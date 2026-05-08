# TEAM_006: Multi-Key Fallback System

## Problem
Even with TEAM_005's optimizations, a single free-tier Gemini key tops out
at 1,000 requests per day and 30 requests per minute. A busy lunch service
or a heavy day of testing can blow past either ceiling, taking the kiosk
offline until midnight Pacific. We want a free-tier solution that scales
horizontally instead of paying per-call.

## Strategy
Treat up to three independent API keys (one per Google account) as a
rotating pool. The free-tier RPM/RPD buckets are scoped per project, so
three keys = 3,000 RPD and 90 effective RPM with zero infra changes.

When the active key returns a 429, immediately rotate to the next key
without waiting — the customer should never sit through Google's suggested
60s retry window. Mark the spent key as "cooling down" for the API's
suggested retryDelay (default 60s) so subsequent generations skip it.

## Behavior
1. Read `VITE_GEMINI_API_KEY`, `_2`, `_3` from the env. Filter out empty
   slots so the app works fine with just the primary configured.
2. On generate: filter out keys still in cooldown.
3. Try each remaining key in order. On 429, mark the key cooling down for
   the API's `retryDelay` and continue to the next.
4. On a 5xx (transient upstream blip), rotate immediately on earlier keys
   and retry once on the last key before failing.
5. On a non-quota error (auth, malformed prompt, network down), throw
   immediately without burning the other keys.
6. If every key has been tried or is in cooldown, throw a clear
   "all keys rate-limited" error so the existing error UI can show
   Try Again / Google / Yelp options.

## Files Touched
- `vite.config.ts`: inline `VITE_GEMINI_API_KEY_2` and `_3` into the
  bundle, with `GEMINI_API_KEY_2` / `_3` fallbacks for AI Studio's
  legacy variable names.
- `src/services/gemini.ts`: rewrote `generateAllReviews` around the
  `getApiKeys() → cooldown filter → rotation loop` pipeline. Split the
  "one attempt against one key" into a private `callGeminiOnce` helper.
- `.env.example`: documented the two optional fallback slots.

## Progress
- [x] Created team file
- [x] Wired `VITE_GEMINI_API_KEY_2` / `_3` through `vite.config.ts`
- [x] Refactored `src/services/gemini.ts` to rotate keys on 429
- [x] Updated `.env.example`
- [x] Verified `npm run lint` and `npm run build`

## Deployment notes
- Generate the two extra keys from separate Google accounts at
  https://aistudio.google.com/apikey (free).
- Add both as environment variables on the deploy host (AI Studio /
  Vercel / etc.) using the names `VITE_GEMINI_API_KEY_2` and
  `VITE_GEMINI_API_KEY_3`.
- They are inlined into the public bundle at build time, same as the
  primary key — anyone who downloads the JS can see them. Use API-key
  restrictions in the Google Cloud Console (HTTP referrer whitelist for
  your domain) to lock each key to your kiosk's URL.

## Effective quota with 3 keys
- 3,000 free RPD across the pool (3 × 1,000)
- ~90 effective RPM at peak (3 × 30, since rotation is instant on 429)
- Same per-key TPM ceiling, but now distributed
