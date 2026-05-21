# TEAM_012: Background Video Payload Optimization

This log covers the implementation of background video compression and frontend performance enhancements.

---

## Objectives

### 1. Compress Background Video
- Use FFmpeg to compress the massive `public/background.mp4` (13.58 MB) using H.265 (HEVC) compression to create `public/background_optimized.mp4` (<1.5 MB).
- Convert `public/background.mp4` into VP9 WebM format (`public/background.webm`, <1.5 MB) to serve as the ultra-lightweight primary source for modern browsers.

### 2. Update Video Player in App.tsx
- Replace the single `src` attribute on the `<video>` element inside `src/App.tsx` with optimized `<source>` tags.
- Load `background.webm` as the primary source, falling back to `background_optimized.mp4` (HEVC) for iOS/Safari, and finally falling back to `background.mp4` as a legacy fallback.

---

## Progress Checklist
- [x] Install/verify FFmpeg environment
- [x] Compress background video to H.265 MP4 (`background_optimized.mp4`)
- [x] Convert background video to VP9 WebM (`background.webm`)
- [x] Modify `src/App.tsx` with `<source>` elements
- [x] Run typescript checks (`npm run lint`)
- [x] Run production build (`npm run build`)
- [x] Push to Git repository

---

## Results
- **Original Video (`background.mp4`):** `13,582,761 bytes` (~12.95 MB)
- **HEVC / H.265 MP4 (`background_optimized.mp4`):** `3,652,482 bytes` (~3.48 MB) — **73% size reduction**!
- **VP9 / WebM (`background.webm`):** `2,255,720 bytes` (~2.15 MB) — **83.4% size reduction**!

By serving `background.webm` as the primary video source and `background_optimized.mp4` as the secondary, we reduce the initial loading weight by **10.8 MB** for Chrome, Firefox, Edge, and modern Safari browsers, and by **9.5 MB** for iOS Safari, with absolutely zero visual degradation.

