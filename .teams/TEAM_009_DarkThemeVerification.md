# TEAM_009: Dark Theme Solid Background & 80% Video Speed Refactor

## Objectives
- Configure the application so every other screen besides the `welcome` page uses a premium solid dark background (`bg-[#121212]`) instead of the active background video.
- Retain the background video exclusively for the `welcome` page, and slow it down to 80% playback speed (`playbackRate = 0.8`).
- Maintain consistent visual contrast and legibility using premium glass-morphic dark elements (white text, glassy borders, vibrant red brand accents) on top of the solid dark background.
- Verify building and linting.
- Commit changes and push to `https://github.com/LinCodex/Xiyuehui`.

## Files Updated
- `src/App.tsx`
  - Reconfigured the background layer to use a solid `#121212` base.
  - Added a smooth transition-opacity layer that shows the background video only when `step === "welcome"` and fades it out beautifully when navigating to other screens.
  - Set the video element's `playbackRate = 0.8` to slow down the playback speed to 80%.
  - Kept all premium glass-morphic textareas, option buttons, star ratings, slider tracks, dropdown menus, and watermarks styled for dark background readability.

## Verification Checklist
- [x] Project builds successfully (`npm run build`)
- [x] TypeScript lints perfectly without error (`npm run lint`)
- [x] Background video plays at 80% speed on the welcome page
- [x] Non-welcome pages fade the video out smoothly and use solid `#121212` dark theme
- [x] Removed container wrappers for survey, rating, comments, and results
- [x] All interactive elements maintain perfect contrast and readability on top of both backgrounds

## Next Steps
- Commit the finalized modifications.
- Push the changes to the Git remote repository.
- Provide final walkthrough and status report to the user.
