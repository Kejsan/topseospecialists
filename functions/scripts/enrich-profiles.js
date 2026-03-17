#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const DEFAULT_COLLECTION = process.env.FIRESTORE_COLLECTION || "specialists";
const DEFAULT_FIRECRAWL_API_URL = (process.env.FIRECRAWL_API_URL || "https://api.firecrawl.dev/v2").replace(/\/$/, "");
const DEFAULT_BATCH_SIZE = Number(process.env.FIRECRAWL_ENRICHMENT_BATCH_SIZE || 5);
const ENRICHMENT_VERSION = "firecrawl-v1";

function printHelp() {
  console.log(`
Usage:
  node scripts/enrich-profiles.js --profile-id <docId> [options]
  node scripts/enrich-profiles.js --pending [options]

Required configuration:
  --service-account <path>        Path to a Firebase service-account JSON key
  FIRECRAWL_API_KEY               Firecrawl API key

Options:
  --collection <name>             Firestore collection to update (default: specialists)
  --batch-size <n>                Max pending profiles to process (default: 5)
  --initiated-by <label>          Audit label stored in enrichmentUpdatedBy
  --dry-run                       Generate drafts without writing Firestore changes
  --help                          Show this message

Environment variable fallbacks:
  FIREBASE_SERVICE_ACCOUNT_KEY_PATH
  GOOGLE_APPLICATION_CREDENTIALS
  FIRECRAWL_API_URL
  FIRECRAWL_ENRICHMENT_BATCH_SIZE
  FIRESTORE_COLLECTION
`);
}

function parseArgs(argv) {
  const options = {
    collection: DEFAULT_COLLECTION,
    batchSize: DEFAULT_BATCH_SIZE,
    initiatedBy: process.env.ENRICHMENT_INITIATED_BY || "script-manual",
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY || "",
    firecrawlApiUrl: DEFAULT_FIRECRAWL_API_URL,
    profileId: "",
    processPending: false,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--pending") {
      options.processPending = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    const nextValue = argv[i + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }

    switch (arg) {
      case "--profile-id":
        options.profileId = nextValue.trim();
        i += 1;
        break;
      case "--service-account":
        options.serviceAccountPath = nextValue.trim();
        i += 1;
        break;
      case "--collection":
        options.collection = nextValue.trim();
        i += 1;
        break;
      case "--batch-size":
        options.batchSize = Number(nextValue);
        i += 1;
        break;
      case "--initiated-by":
        options.initiatedBy = nextValue.trim();
        i += 1;
        break;
      case "--firecrawl-api-url":
        options.firecrawlApiUrl = nextValue.trim().replace(/\/$/, "");
        i += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function resolvePath(inputPath) {
  if (!inputPath) return "";
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
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

function loadServiceAccount(serviceAccountPath) {
  const resolvedPath = resolvePath(serviceAccountPath);
  if (!resolvedPath) {
    throw new Error("A service-account JSON path is required. Pass --service-account or set FIREBASE_SERVICE_ACCOUNT_KEY_PATH.");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Service-account file not found: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, "utf8");
  return JSON.parse(raw);
}

function initializeFirebase(serviceAccount) {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function firecrawlRequest(pathname, options, config) {
  if (!config.firecrawlApiKey) {
    throw new Error("FIRECRAWL_API_KEY is required.");
  }

  const response = await fetch(`${config.firecrawlApiUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.firecrawlApiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_error) {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Firecrawl request failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function searchCandidateUrls(profile, config) {
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
  }, config);

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

async function startExtract(profile, urls, config) {
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
  }, config);
}

async function waitForExtractResult(jobId, config) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const payload = await firecrawlRequest(`/extract/${jobId}`, { method: "GET" }, config);

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

async function generateDraft(profile, config) {
  const urls = await searchCandidateUrls(profile, config);
  const started = await startExtract(profile, urls, config);
  const jobId = started.id || started.jobId;

  if (!jobId) {
    throw new Error(`Missing extract job id: ${JSON.stringify(started)}`);
  }

  const completed = await waitForExtractResult(jobId, config);
  const extracted = completed.data || {};
  const sources = completed.sources || extracted.sources || [];
  return buildDraft(profile, extracted, sources);
}

async function processProfileEnrichment(db, profileId, config) {
  const specialistRef = db.collection(config.collection).doc(profileId);
  const snapshot = await specialistRef.get();

  if (!snapshot.exists) {
    throw new Error(`Profile not found in collection "${config.collection}": ${profileId}`);
  }

  const profile = { id: snapshot.id, ...snapshot.data() };
  console.log(`Enriching ${profile.name} (${snapshot.id}) from ${config.collection}`);

  if (!config.dryRun) {
    await specialistRef.set({
      enrichmentStatus: "processing",
      enrichmentLastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
      enrichmentUpdatedBy: config.initiatedBy,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  try {
    const draft = await generateDraft(profile, config);

    if (!config.dryRun) {
      await specialistRef.set({
        enrichmentStatus: "needs_review",
        enrichmentDraft: draft,
        enrichmentConfidence: draft.confidenceScore || null,
        enrichmentSourceUrls: draft.sourceUrls,
        enrichmentLastSuccessAt: admin.firestore.FieldValue.serverTimestamp(),
        enrichmentPendingApproval: true,
        enrichmentVersion: ENRICHMENT_VERSION,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return {
      id: snapshot.id,
      name: profile.name,
      status: config.dryRun ? "draft_generated" : "needs_review",
      draft,
    };
  } catch (error) {
    if (!config.dryRun) {
      await specialistRef.set({
        enrichmentStatus: "failed",
        enrichmentPendingApproval: false,
        enrichmentNotes: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    throw error;
  }
}

async function processPendingBatch(db, config) {
  const snapshot = await db.collection(config.collection)
    .where("enrichmentStatus", "==", "pending")
    .orderBy("enrichmentRequestedAt", "asc")
    .limit(config.batchSize)
    .get();

  const results = [];

  for (const docSnapshot of snapshot.docs) {
    try {
      const result = await processProfileEnrichment(db, docSnapshot.id, config);
      results.push({ id: docSnapshot.id, ok: true, status: result.status });
    } catch (error) {
      console.error(`Failed to enrich ${docSnapshot.id}: ${error.message}`);
      results.push({ id: docSnapshot.id, ok: false, error: error.message });
    }
  }

  return {
    attempted: snapshot.size,
    processed: results.filter((item) => item.ok).length,
    failed: results.filter((item) => !item.ok),
  };
}

function validateOptions(options) {
  if (options.help) return;

  if (options.profileId && options.processPending) {
    throw new Error("Use either --profile-id or --pending, not both.");
  }

  if (!options.profileId && !options.processPending) {
    throw new Error("Choose either --profile-id <docId> or --pending.");
  }

  if (!Number.isFinite(options.batchSize) || options.batchSize <= 0) {
    throw new Error("--batch-size must be a positive number.");
  }

  if (!options.firecrawlApiKey) {
    throw new Error("FIRECRAWL_API_KEY is required.");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  validateOptions(options);

  const serviceAccount = loadServiceAccount(options.serviceAccountPath);
  initializeFirebase(serviceAccount);
  const db = admin.firestore();

  const runtimeConfig = {
    collection: options.collection,
    batchSize: options.batchSize,
    initiatedBy: options.initiatedBy,
    dryRun: options.dryRun,
    firecrawlApiKey: options.firecrawlApiKey,
    firecrawlApiUrl: options.firecrawlApiUrl,
  };

  if (options.profileId) {
    const result = await processProfileEnrichment(db, options.profileId, runtimeConfig);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const batchResult = await processPendingBatch(db, runtimeConfig);
  console.log(JSON.stringify(batchResult, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
