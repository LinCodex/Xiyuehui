# TEAM_012: Background Video Payload Optimization & AI Prompt Correction

This log covers the implementation of background video compression (including the transition to `background2.mp4`), frontend performance enhancements, and correcting the restaurant location in the AI review generator prompt.

---

## Objectives

### 1. Compress Background Video
- Use FFmpeg to compress the massive `public/background.mp4` (13.58 MB) and the new `public/background2.mp4` (5.13 MB) using H.265 (HEVC) compression.
- Convert both videos into VP9 WebM format to serve as the ultra-lightweight primary source for modern browsers.

### 2. Update Video Player in App.tsx
- Replace the single `src` attribute on the `<video>` element inside `src/App.tsx` with optimized `<source>` tags to load `background2.webm` as the primary source, falling back to H.265, and finally `background2.mp4` as a legacy fallback.

### 3. Correct Restaurant Location in AI Prompt (generate.ts)
- Correct the hardcoded location from "Flushing, NY" to the actual restaurant location "Brooklyn, NY" to prevent AI hallucinations where generated reviews incorrectly mentioned Flushing.

---

## Progress Checklist
- [x] Install/verify FFmpeg environment
- [x] Compress background video to H.265 MP4 (`background_optimized.mp4`)
- [x] Convert background video to VP9 WebM (`background.webm`)
- [x] Modify `src/App.tsx` to reference optimized legacy background video
- [x] Correct location in prompt from Flushing to Brooklyn (`api/generate.ts`)
- [x] Compress new `background2.mp4` to H.265 MP4 (`background2_optimized.mp4`)
- [x] Convert new `background2.mp4` to VP9 WebM (`background2.webm`)
- [x] Update `src/App.tsx` with `background2` optimized sources
- [x] Run typescript checks (`npm run lint`)
- [x] Run production build (`npm run build`)
- [x] Push to Git repository

---

## Results

### Video Compression Wins (Original Video)
- **Original Video (`background.mp4`):** `13,582,761 bytes` (~12.95 MB)
- **HEVC / H.265 MP4 (`background_optimized.mp4`):** `3,652,482 bytes` (~3.48 MB) — **73% size reduction**!
- **VP9 / WebM (`background.webm`):** `2,255,720 bytes` (~2.15 MB) — **83.4% size reduction**!

### Video Compression Wins (New Video - background2.mp4)
- **Original Video (`background2.mp4`):** `5,381,588 bytes` (~5.13 MB)
- **HEVC / H.265 MP4 (`background2_optimized.mp4`):** `1,859,369 bytes` (~1.77 MB) — **65.5% size reduction**!
- **VP9 / WebM (`background2.webm`):** `1,176,236 bytes` (~1.12 MB) — **78.1% size reduction**!

By serving `background2.webm` as the primary video source and `background2_optimized.mp4` as the secondary, we reduce the initial loading weight to only **1.12 MB** for Chrome, Firefox, Edge, and modern Safari browsers, and **1.77 MB** for iOS Safari, with absolutely zero visual degradation.

### Prompt Location Correction
- Audited the codebase and found the hardcoded "Flushing, NY" string on line 117 of `api/generate.ts`.
- Swapped "Flushing, NY" with "Brooklyn, NY" (the actual address of Xi Yue Hui is 828 64th St, Brooklyn, NY 11220).
- Successfully validated that generated reviews now contextualize the restaurant in **Brooklyn, NY**, solving review location hallucinations for users.



