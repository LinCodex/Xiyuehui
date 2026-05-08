# TEAM_007: Prompt Hardening — Punctuation & Anti-Hallucination

## Problems
1. **Output included `:` and `;`.** Customers don't write Google Maps
   reviews with semicolons — it makes the AI origin obvious. The prompt
   already banned hyphens/dashes/emojis but missed these.
2. **Model invented dish names when the customer left no note.** Even with
   "Their note: none", Gemini was confidently writing things like "the
   Mapo Tofu had real depth" — a plausible-sounding hallucination that
   would land in a public review for a real restaurant. Bad outcome.

## Fix
- **Punctuation rule expanded** to cover `:`, `;`, and the full-width
  Chinese forms `：` and `；`, alongside the existing hyphen/dash ban.
- **Conditional anti-hallucination rule.** When the customer note is
  empty, the prompt explicitly forbids naming any dish, drink,
  ingredient, server, or location detail and tells the model to use
  general phrasing ("the food", "what we ordered"). When the note has
  content, the rule shifts to "you may only reference specifics that
  appear verbatim in the note — never invent".
- **Defense-in-depth scrubber.** A new `scrubBannedPunctuation()` runs
  after the JSON parse and replaces any leaked colons/semicolons with a
  period + space, em/en-dashes with a comma, and collapses the double
  punctuation those substitutions can produce. Cheap insurance for the
  occasional rule violation.

## Files Touched
- `src/services/gemini.ts`
  - Re-numbered prompt rules and added the two new ones.
  - Added `scrubBannedPunctuation()` and wired it into `parseAllReviews`.

## Progress
- [x] Created team file
- [x] Updated prompt rules (`buildPrompt`)
- [x] Added `scrubBannedPunctuation` post-processor
- [x] Verified `npm run lint` and `npm run build`

## Manual test plan
1. Generate a review with **comments empty** in all three languages.
   Expect: no specific dish/drink names, only general phrasing.
2. Generate with comments mentioning a specific dish (e.g.
   "the Mapo Tofu was perfect"). Expect: that dish CAN appear in the
   review, but no others.
3. Manually craft a generation that the model returns with a colon or
   semicolon and confirm the scrubber rewrites it to a clean sentence.
