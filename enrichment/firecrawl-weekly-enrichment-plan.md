# Firecrawl Enrichment Integration Plan

## Goal
Enrich the current 104 profiles first, then run a weekly automated enrichment job that only processes newly added profiles.

## Recommended rollout
1. Use the CSV scaffold and Firecrawl prompt for the first 104 profiles.
2. Review and import the enriched fields into Firestore.
3. Add enrichment tracking fields to the profile documents.
4. Add a weekly scheduled function that only picks profiles with `enrichment_status = pending`.
5. Keep strict batch caps because the Firecrawl free plan has low monthly credits.

## Netlify environment variables
- `FIRECRAWL_API_KEY`
- `FIRECRAWL_RETRY_MAX_ATTEMPTS=5`
- `FIRECRAWL_RETRY_INITIAL_DELAY=2000`
- `FIRECRAWL_RETRY_MAX_DELAY=30000`
- `FIRECRAWL_RETRY_BACKOFF_FACTOR=2`
- `FIRECRAWL_ENRICHMENT_BATCH_SIZE=5`
- `FIRECRAWL_ENRICHMENT_STALE_DAYS=90`

## Firestore fields to add per profile
- `enrichment_status`
  Values: `pending`, `processing`, `enriched`, `failed`, `needs_review`
- `enrichment_requested_at`
- `enrichment_last_attempt_at`
- `enrichment_last_success_at`
- `enrichment_confidence`
- `enrichment_source_urls`
- `enrichment_notes`
- `enrichment_version`

## Initial batch strategy
- Do not automate all 104 profiles through the weekly job.
- Process them offline in CSV batches.
- Recommended batch size: `10` profiles at a time.
- After each batch, review quality before moving to the next batch.
- Import only reviewed data back into Firestore.

## Weekly automation strategy
- Trigger on a Netlify scheduled function once per week.
- Query only profiles where `enrichment_status = pending`.
- Order by `createdAt` ascending so the oldest unprocessed new profile is handled first.
- Limit each run to `FIRECRAWL_ENRICHMENT_BATCH_SIZE`.
- For each profile:
  - build a focused prompt from existing fields
  - call Firecrawl using a small number of source pages
  - normalize the response into the profile schema
  - update enrichment fields
- If Firecrawl fails or confidence is low:
  - set `enrichment_status = needs_review` or `failed`
  - keep the original profile intact

## Guardrails for free-plan credits
- Do not re-enrich already enriched profiles weekly.
- Only enrich new profiles or manually flagged stale profiles.
- Cap source pages per profile to 3-5 max.
- Prefer source URLs already present in the record before broader search.
- Skip profiles that already have complete core enrichment data.

## Suggested implementation pieces
- Server utility: `src/lib/enrichment/firecrawl.ts`
- Profile normalizer: `src/lib/enrichment/normalizeProfile.ts`
- Scheduled function or background function for weekly queue processing
- Admin support to mark a profile as `pending enrichment` or `re-enrich`

## Suggested weekly schedule
- Once per week on a low-traffic window.
- Keep runtime short and deterministic.
- Example policy: process at most 5 new profiles every Monday.

## Review policy
- Never auto-rewrite editorial text without keeping source-backed notes.
- Keep imported enrichment separate from manually curated profile copy when possible.
- Require human review for low-confidence or conflicting data.
