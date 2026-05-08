# TEAM_005: Optimize Gemini Quota & Fix 429 Errors

## Problem
Live site is returning `429 Too Many Requests` from `gemini-2.5-flash-lite`.
Free tier ceilings: 30 RPM, 1,000 RPD, 1,000,000 TPM. Daily quota is fine
(100 reviews × 3 languages = 300 calls, well under 1,000), so the failure is
the **30 RPM** burst window — multiple kiosk customers (or rapid language
switches) push us over the per-minute cap. The current code also pays the
full cost of a long prompt on every refresh and on every language switch.

## Goals
- Comfortably support ~100 review sessions/day in 3 languages on the free tier.
- Eliminate the language-switch latency and reduce 429 risk.
- Fail gracefully on 429 by waiting a real RPM window (not 8s).

## Strategy
1. **Single call, three languages.** Replace per-language requests with a
   single `generateAllReviews(...)` that asks the model to return JSON
   `{en, cn, es}`. Cuts per-session API calls by ~3x and removes the
   "Translating..." round-trip.
2. **Trim the prompt** (~500 → ~220 tokens). Same behavior, fewer tokens —
   less TPM pressure and faster responses.
3. **Smarter 429 / 503 retry.** Parse Gemini's `retryDelay` from the error,
   wait for it (clamped between 1s and 65s), and retry up to 3 times with
   gentle exponential fallback if the API doesn't give a hint.

## Progress
- [x] Created team file
- [x] Refactored `src/services/gemini.ts` (single-call multi-language, JSON
      output, trimmed prompt, retry-aware 429 handling, kept the legacy
      `generateReview` export for safety)
- [x] Updated `src/App.tsx`: `handleGenerate` and `handleRefresh` populate
      all three languages in one call; `handleLanguageChange` is now
      synchronous when reviews are already cached (no API call on language
      switch)
- [x] Verified with `npm run lint` (tsc --noEmit) and `npm run build`

## Summary
The kiosk now makes one Gemini call per generation instead of up to three.
Language switches on the result screen are instant. The trimmed prompt and
retry-aware backoff make 429s much less likely and recoverable when they do
happen. Net effect: ~3x more headroom on the free RPM bucket and ~3.5x
fewer tokens per multi-language session.
