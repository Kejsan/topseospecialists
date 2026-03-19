import { NextRequest, NextResponse } from "next/server";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "";
const FIRECRAWL_API_URL = (process.env.FIRECRAWL_API_URL || "https://api.firecrawl.dev/v2").replace(/\/$/, "");
const ENRICHMENT_VERSION = "firecrawl-v1";

function ensureFirecrawlConfig() {
  if (!FIRECRAWL_API_KEY) {
    throw new Error("Firecrawl API key is not configured in environment variables.");
  }
}

function normalizeString(value: any): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => normalizeString(item)).filter(Boolean))];
}

function uniqueUrls(items: any[]): string[] {
  return [...new Set(items.map((item) => normalizeString(item)).filter(Boolean))];
}

async function firecrawlRequest(path: string, options: RequestInit = {}) {
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
  let payload: any = {};

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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchCandidateUrls(profile: any) {
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

  return uniqueUrls(candidates.map((item: any) => item.url || item.sourceURL)).slice(0, 4);
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

function buildExtractPrompt(profile: any) {
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

async function startExtract(profile: any, urls: string[]) {
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

async function waitForExtractResult(jobId: string) {
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

function pickPrimarySocialUrl(data: any, profile: any) {
  return normalizeString(data.linkedinUrl)
    || normalizeString(data.xUrl)
    || normalizeString(data.githubUrl)
    || normalizeString(data.otherSocialUrl)
    || normalizeString(profile.social);
}

function buildDraft(profile: any, extracted: any, sources: any) {
  const sourceUrls = uniqueUrls([
    ...(Array.isArray(sources) ? sources.map((item: any) => item.url || item.sourceURL || item) : []),
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

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile } = body;

    if (!profile || !profile.id) {
      return NextResponse.json({ error: "Missing highly required profile data or ID" }, { status: 400 });
    }

    const urls = await searchCandidateUrls(profile);
    const started = await startExtract(profile, urls);
    const jobId = started.id || started.jobId;

    if (!jobId) {
      throw new Error(`Missing extract job id: ${JSON.stringify(started)}`);
    }

    const completed = await waitForExtractResult(jobId);
    const extracted = completed.data || {};
    const sources = completed.sources || extracted.sources || [];
    
    const draft = buildDraft(profile, extracted, sources);
    
    return NextResponse.json({ success: true, draft }, { status: 200 });
    
  } catch (error: any) {
    console.error("Enrichment API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete AI extraction" }, 
      { status: 500 }
    );
  }
}
