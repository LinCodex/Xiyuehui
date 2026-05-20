# TEAM_010: Theme and Review Links Update

## Objectives
- **Aesthetic Adjustment:** Change the dark background of the application from a pitch black `#121212` to a slightly lighter, premium charcoal dark tone (such as `#1E1E20`) to improve overall elegance and visual comfort, as requested by the user.
- **Link Updates:**
  - Google redirection: `https://reviewthis.biz/xiyuehui` (already set, but verify).
  - Yelp redirection: Update to `https://www.yelp.com/writeareview/biz/0oHgxYrn8DhPsMhJNQWapA`.
  - Instagram redirection: Update to `https://www.instagram.com/xiyuehui_nyc/`.
  - **Xiaohongshu (Rednote) redirection:** Implement direct deep link attempt to the app (`xhsdiscover://post_note`), falling back to the creator portal website (`https://creator.xiaohongshu.com/publish/publish`) if the app is not installed.
- **Xiaohongshu Text-Post Picker Issue (User Feedback):**
  - *Context:* The user noted that opening the app was still forcing them into the photo/video gallery selector instead of a pure text post.
  - *Finding:* Standard notes on the native Xiaohongshu platform always require at least one photo or video, meaning the deep link schemes (`xhsdiscover://post_note` and `xhsdiscover://post`) are natively coded by Xiaohongshu to open the media gallery picker first. There is no query parameter (such as `type=text`) that programmatically bypasses this selector to default to the "Text" (文字) tab.
  - *Solution:* Updated the localized copies of `modalSubXiaohongshu` in `src/translations.ts` in English, Chinese, and Spanish to guide users to select the "Text" (文字) or "Moment" (此刻) tab at the bottom of the camera/gallery picker to seamlessly bypass photo upload.
- **Traceability:** Add code comments in the format `// TEAM_010: Reason for change` to ensure traceability of modifications.
- **Git Push:** Push the finalized and validated modifications to the user's `xiyuehui` GitHub repository.

## Handoff Checklist
- [x] Project builds cleanly (`npm run build`)
- [x] All lints pass (`npm run lint`)
- [x] Behavioral regression verified
- [x] Team file updated with progress
- [x] Remaining TODOs documented

