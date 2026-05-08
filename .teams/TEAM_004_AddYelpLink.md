# TEAM_004: Add Yelp Review Link

## Objectives
- Add a Yelp review button side-by-side with the Google Review button on the final output screen.
- Make sure both buttons are identically sized (`flex-1`).
- Update the manual review bypass in the Error step to include both Google and Yelp options.
- Update modal logic and translation strings to handle dynamic redirection to either platform.

## Links
- Yelp: `https://www.yelp.com/writeareview/biz/ZFXQV1KOIBrKjJiLRWUBIw?return_url=%2Fbiz%2FZFXQV1KOIBrKjJiLRWUBIw&review_origin=biz-details-war-button`
- Google: `https://reviewthis.biz/chuanbistro`

## Progress
- [ ] Created team file
- [ ] Update `translations.ts` to include Google and Yelp specific strings.
- [ ] Update `App.tsx` state to track `redirectTarget`.
- [ ] Update `App.tsx` error step buttons.
- [ ] Update `App.tsx` result step buttons.
- [ ] Verify build and styling.
