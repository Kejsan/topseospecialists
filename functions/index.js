
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp;
const deleteField = admin.firestore.FieldValue.delete;

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || functions.config().firecrawl?.key || "";
const FIRECRAWL_API_URL = (process.env.FIRECRAWL_API_URL || functions.config().firecrawl?.api_url || "https://api.firecrawl.dev/v2").replace(/\/$/, "");
const ENRICHMENT_BATCH_SIZE = Number(process.env.FIRECRAWL_ENRICHMENT_BATCH_SIZE || functions.config().firecrawl?.enrichment_batch_size || 5);
const ENRICHMENT_VERSION = "firecrawl-v1";

function ensureAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication is required.");
  }
}

function ensureFirecrawlConfig() {
  if (!FIRECRAWL_API_KEY) {
    throw new functions.https.HttpsError("failed-precondition", "Firecrawl API key is not configured.");
  }
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => normalizeString(item)).filter(Boolean))];
}

function uniqueUrls(items) {
  return [...new Set(items.map((item) => normalizeString(item)).filter(Boolean))];
}

async function firecrawlRequest(path, options = {}) {
  ensureFirecrawlConfig();

  const response = await fetch(`${FIRECRAWL_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Firecrawl request failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchCandidateUrls(profile) {
  const seededUrls = uniqueUrls([
    profile.website,
    profile.social,
    ...(Array.isArray(profile.enrichmentSourceUrls) ? profile.enrichmentSourceUrls : []),
  ]);

  if (seededUrls.length > 0) {
    return seededUrls.slice(0, 4);
  }

  const query = [profile.name, profile.role, profile.category, "SEO"].filter(Boolean).join(" ");
  const payload = await firecrawlRequest("/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      limit: 4,
      ignoreInvalidURLs: true,
      scrapeOptions: {
        formats: [{ type: "markdown" }],
        onlyMainContent: true,
      },
    }),
  });

  const candidates = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.data?.web)
      ? payload.data.web
      : [];

  return uniqueUrls(candidates.map((item) => item.url || item.sourceURL)).slice(0, 4);
}
function buildExtractSchema() {
  return {
    type: "object",
    properties: {
      headline: { type: "string" },
      summary: { type: "string" },
      website: { type: "string" },
      linkedinUrl: { type: "string" },
      xUrl: { type: "string" },
      githubUrl: { type: "string" },
      otherSocialUrl: { type: "string" },
      country: { type: "string" },
      city: { type: "string" },
      region: { type: "string" },
      timezone: { type: "string" },
      currentCompany: { type: "string" },
      specialties: { type: "array", items: { type: "string" } },
      secondaryCategories: { type: "array", items: { type: "string" } },
      servicesOffered: { type: "array", items: { type: "string" } },
      problemsTheySolve: { type: "array", items: { type: "string" } },
      notableAchievements: { type: "array", items: { type: "string" } },
      confidenceScore: { type: "number" },
      notes: { type: "string" },
    },
  };
}

function buildExtractPrompt(profile) {
  return [
    `Research the SEO professional ${profile.name}.`,
    profile.role ? `Current role/company signal: ${profile.role}.` : "",
    profile.category ? `Primary platform category: ${profile.category}.` : "",
    profile.contribution ? `Known contribution: ${profile.contribution}.` : "",
    "Return only facts that can be verified from public professional sources.",
    "Prefer personal websites, company team pages, LinkedIn, X/Twitter, GitHub, conference bios, and reputable interviews.",
    "If a field cannot be verified, return an empty string or empty array.",
    "Keep summary to 1-2 professional sentences.",
    "Only include secondary categories that fit this platform taxonomy: General SEO, Technical SEO, Content SEO, Local SEO, E-commerce SEO, Link Building, AI SEO, Affiliate SEO, Community & Education.",
  ].filter(Boolean).join(" ");
}

async function startExtract(profile, urls) {
  const body = urls.length > 0
    ? {
        urls,
        prompt: buildExtractPrompt(profile),
        schema: buildExtractSchema(),
        showSources: true,
        ignoreInvalidURLs: true,
      }
    : {
        prompt: buildExtractPrompt(profile),
        schema: buildExtractSchema(),
        showSources: true,
        enableWebSearch: true,
      };

  return firecrawlRequest("/extract", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function waitForExtractResult(jobId) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const payload = await firecrawlRequest(`/extract/${jobId}`, { method: "GET" });
    if (payload.status === "completed") {
      return payload;
    }
    if (payload.status === "failed" || payload.status === "cancelled") {
      throw new Error(`Firecrawl extract ${payload.status}`);
    }
    await sleep(3000);
  }

  throw new Error("Firecrawl extract timed out.");
}

function pickPrimarySocialUrl(data, profile) {
  return normalizeString(data.linkedinUrl)
    || normalizeString(data.xUrl)
    || normalizeString(data.githubUrl)
    || normalizeString(data.otherSocialUrl)
    || normalizeString(profile.social);
}

function buildDraft(profile, extracted, sources) {
  const sourceUrls = uniqueUrls([
    ...(Array.isArray(sources) ? sources.map((item) => item.url || item.sourceURL || item) : []),
    normalizeString(extracted.website),
    normalizeString(extracted.linkedinUrl),
    normalizeString(extracted.xUrl),
    normalizeString(extracted.githubUrl),
    normalizeString(extracted.otherSocialUrl),
  ]);

  return {
    headline: normalizeString(extracted.headline),
    summary: normalizeString(extracted.summary),
    website: normalizeString(extracted.website),
    social: pickPrimarySocialUrl(extracted, profile),
    linkedinUrl: normalizeString(extracted.linkedinUrl),
    xUrl: normalizeString(extracted.xUrl),
    githubUrl: normalizeString(extracted.githubUrl),
    otherSocialUrl: normalizeString(extracted.otherSocialUrl),
    country: normalizeString(extracted.country),
    city: normalizeString(extracted.city),
    region: normalizeString(extracted.region),
    timezone: normalizeString(extracted.timezone),
    currentCompany: normalizeString(extracted.currentCompany),
    specialties: normalizeStringArray(extracted.specialties),
    secondaryCategories: normalizeStringArray(extracted.secondaryCategories),
    servicesOffered: normalizeStringArray(extracted.servicesOffered),
    problemsTheySolve: normalizeStringArray(extracted.problemsTheySolve),
    notableAchievements: normalizeStringArray(extracted.notableAchievements),
    confidenceScore: Number(extracted.confidenceScore || 0),
    notes: normalizeString(extracted.notes),
    sourceUrls,
    generatedAt: new Date().toISOString(),
    version: ENRICHMENT_VERSION,
  };
}

async function generateDraft(profile) {
  const urls = await searchCandidateUrls(profile);
  const started = await startExtract(profile, urls);
  const jobId = started.id || started.jobId;

  if (!jobId) {
    throw new Error(`Missing extract job id: ${JSON.stringify(started)}`);
  }

  const completed = await waitForExtractResult(jobId);
  const extracted = completed.data || {};
  const sources = completed.sources || extracted.sources || [];
  return buildDraft(profile, extracted, sources);
}
async function processProfileEnrichmentInternal(profileId, initiatedBy) {
  const specialistRef = db.collection("specialists").doc(profileId);
  const snapshot = await specialistRef.get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Specialist not found.");
  }

  const profile = { id: snapshot.id, ...snapshot.data() };

  await specialistRef.set({
    enrichmentStatus: "processing",
    enrichmentLastAttemptAt: timestamp(),
    enrichmentUpdatedBy: initiatedBy,
    updatedAt: timestamp(),
  }, { merge: true });

  try {
    const draft = await generateDraft(profile);
    await specialistRef.set({
      enrichmentStatus: "needs_review",
      enrichmentDraft: draft,
      enrichmentConfidence: draft.confidenceScore || null,
      enrichmentSourceUrls: draft.sourceUrls,
      enrichmentLastSuccessAt: timestamp(),
      enrichmentPendingApproval: true,
      enrichmentVersion: ENRICHMENT_VERSION,
      updatedAt: timestamp(),
    }, { merge: true });

    return draft;
  } catch (error) {
    await specialistRef.set({
      enrichmentStatus: "failed",
      enrichmentPendingApproval: false,
      enrichmentNotes: error.message,
      updatedAt: timestamp(),
    }, { merge: true });
    throw error;
  }
}

async function processPendingBatch(triggerLabel) {
  const snapshot = await db.collection("specialists")
    .where("enrichmentStatus", "==", "pending")
    .orderBy("enrichmentRequestedAt", "asc")
    .limit(ENRICHMENT_BATCH_SIZE)
    .get();

  let processed = 0;
  const failed = [];

  for (const docSnapshot of snapshot.docs) {
    try {
      await processProfileEnrichmentInternal(docSnapshot.id, triggerLabel);
      processed += 1;
    } catch (error) {
      failed.push({ id: docSnapshot.id, message: error.message });
    }
  }

  return {
    attempted: snapshot.size,
    processed,
    failed,
  };
}

exports.queueProfileEnrichment = functions.https.onCall(async (data, context) => {
  ensureAuth(context);
  const specialistId = normalizeString(data.specialistId || data.profileId);
  if (!specialistId) {
    throw new functions.https.HttpsError("invalid-argument", "specialistId is required.");
  }

  await db.collection("specialists").doc(specialistId).set({
    enrichmentStatus: "pending",
    enrichmentRequestedAt: timestamp(),
    enrichmentPendingApproval: false,
    enrichmentNotes: data.note ? String(data.note) : "Queued for enrichment.",
    updatedAt: timestamp(),
  }, { merge: true });

  return { success: true };
});

exports.excludeProfileFromEnrichment = functions.https.onCall(async (data, context) => {
  ensureAuth(context);
  const specialistId = normalizeString(data.specialistId || data.profileId);
  if (!specialistId) {
    throw new functions.https.HttpsError("invalid-argument", "specialistId is required.");
  }

  await db.collection("specialists").doc(specialistId).set({
    enrichmentStatus: "excluded",
    enrichmentPendingApproval: false,
    enrichmentDraft: deleteField(),
    enrichmentNotes: data.note ? String(data.note) : "Excluded from automated enrichment.",
    updatedAt: timestamp(),
  }, { merge: true });

  return { success: true };
});
exports.rejectProfileEnrichment = functions.https.onCall(async (data, context) => {
  ensureAuth(context);
  const specialistId = normalizeString(data.specialistId || data.profileId);
  if (!specialistId) {
    throw new functions.https.HttpsError("invalid-argument", "specialistId is required.");
  }

  await db.collection("specialists").doc(specialistId).set({
    enrichmentStatus: "rejected",
    enrichmentPendingApproval: false,
    enrichmentDraft: deleteField(),
    enrichmentNotes: data.note ? String(data.note) : "Enrichment draft rejected.",
    updatedAt: timestamp(),
  }, { merge: true });

  return { success: true };
});

exports.approveProfileEnrichment = functions.https.onCall(async (data, context) => {
  ensureAuth(context);
  const specialistId = normalizeString(data.specialistId || data.profileId);
  if (!specialistId) {
    throw new functions.https.HttpsError("invalid-argument", "specialistId is required.");
  }

  const specialistRef = db.collection("specialists").doc(specialistId);
  const snapshot = await specialistRef.get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError("not-found", "Specialist not found.");
  }

  const profile = snapshot.data() || {};
  const draft = profile.enrichmentDraft;
  if (!draft) {
    throw new functions.https.HttpsError("failed-precondition", "No enrichment draft available to approve.");
  }

  await specialistRef.set({
    headline: draft.headline || profile.headline || "",
    summary: draft.summary || profile.summary || "",
    website: draft.website || profile.website || "",
    social: draft.social || profile.social || "",
    country: draft.country || profile.country || "",
    city: draft.city || profile.city || "",
    region: draft.region || profile.region || "",
    timezone: draft.timezone || profile.timezone || "",
    currentCompany: draft.currentCompany || profile.currentCompany || "",
    specialties: draft.specialties || profile.specialties || [],
    secondaryCategories: draft.secondaryCategories || profile.secondaryCategories || [],
    servicesOffered: draft.servicesOffered || profile.servicesOffered || [],
    problemsTheySolve: draft.problemsTheySolve || profile.problemsTheySolve || [],
    notableAchievements: draft.notableAchievements || profile.notableAchievements || [],
    enrichmentStatus: "enriched",
    enrichmentPendingApproval: false,
    enrichmentApprovedAt: timestamp(),
    enrichmentConfidence: draft.confidenceScore || null,
    enrichmentSourceUrls: draft.sourceUrls || [],
    enrichmentDraft: deleteField(),
    enrichmentNotes: draft.notes || profile.enrichmentNotes || "Approved enrichment draft.",
    updatedAt: timestamp(),
  }, { merge: true });

  return { success: true };
});

exports.enrichProfile = functions.https.onCall(async (data, context) => {
  ensureAuth(context);
  const specialistId = normalizeString(data.specialistId || data.profileId);
  if (!specialistId) {
    throw new functions.https.HttpsError("invalid-argument", "specialistId is required.");
  }

  const draft = await processProfileEnrichmentInternal(specialistId, "manual");
  return { success: true, draft };
});

exports.runMonthlyEnrichmentBatch = functions.https.onCall(async (_data, context) => {
  ensureAuth(context);
  const result = await processPendingBatch("manual-batch");
  return { success: true, ...result };
});

exports.monthlyProfileEnrichment = functions.pubsub
  .schedule("0 4 1 * *")
  .timeZone("Etc/UTC")
  .onRun(async () => {
    await processPendingBatch("scheduled-monthly");
    return null;
  });
