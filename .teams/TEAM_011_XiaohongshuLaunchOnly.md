# TEAM_011: Xiaohongshu Direct Launch & Vercel Security Hardening

This log covers the two main objectives achieved during the lifecycle of Team 011: updating the native Xiaohongshu app launch behavior and auditing/hardening the security of the Vercel deployment.

---

## Objectives Achieved

### 1. Xiaohongshu Redirection Update
- **App Launch Directness:** Modified the redirection in the frontend so that clicking Xiaohongshu opens the root app scheme (`xhsdiscover://`) directly instead of forcing the note creation editor (`xhsdiscover://post_note`), resolving the issue where users were forced into the photo selector.
- **Web Fallback:** Refined the fallback URL to point to the generic Xiaohongshu homepage (`https://www.xiaohongshu.com`) rather than the publisher's portal dashboard.
- **Localized Copy Updates:** Simplified the `modalSubXiaohongshu` translation strings across English, Chinese, and Spanish to inform the user that Xiaohongshu is opening and their review is copied, removing text tab selection instructions.

### 2. Vercel Security Hardening Audit & Implementation
- **Client Key Removal:** Audited the client-side API key usage. Moving from client-side direct calls (which leaked the `VITE_GEMINI_API_KEY` rotation credentials) to a secure server-side environment.
- **Vercel Serverless Function:** Created a Node.js serverless endpoint at `api/generate.ts` which handles the Gemini API SDK initialization, prompt compilation, and rate-limit key rotation securely on the server.
- **Proxy Call Refactoring:** Refactored `src/services/gemini.ts` to call `/api/generate` via fetch, keeping signatures completely identical to prevent any UI or state breakages.
- **Performance Enhancement:** Removing `@google/genai` from the browser chunk reduced the bundle size by **6.0 KB** (down to `245.15 KB`), increasing initial page speed.

---

## Handoff Checklist
- [x] Project builds cleanly (`npm run build`)
- [x] All lints pass (`npm run lint`)
- [x] Behavioral regression verified (UI layout and animations remain 100% identical)
- [x] Team file updated with progress
- [x] Remaining TODOs documented
