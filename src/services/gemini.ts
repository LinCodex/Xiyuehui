// TEAM_011: Secure client-side proxy pointing to Vercel Serverless Function /api/generate
export interface SurveyResults {
  food: string;
  service: string;
  atmosphere: string;
  rating: number;
  comments?: string;
}

export type Lang = "en" | "cn" | "es";
// TEAM_012: Extended response type now includes xhs-truncated versions for Xiaohongshu's 100-char limit
export type AllReviews = Record<Lang, string> & { xhs_en?: string; xhs_cn?: string; xhs_es?: string };

/**
 * TEAM_011: Generate all three languages by calling the secure Vercel backend.
 * This completely hides Gemini API keys on the server side and avoids bundle leakage.
 */
export async function generateAllReviews(
  results: SurveyResults,
  previousReview?: string,
): Promise<AllReviews> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ results, previousReview }),
  });

  if (!response.ok) {
    let errMsg = "Failed to generate review";
    try {
      const data = await response.json();
      if (data && typeof data.error === "string") {
        errMsg = data.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data as AllReviews;
}

/**
 * TEAM_011: Backwards-compatible helper returning a single language.
 */
export async function generateReview(
  results: SurveyResults,
  language: Lang = "en",
  previousReview?: string,
): Promise<string> {
  const all = await generateAllReviews(results, previousReview);
  return all[language];
}

/**
 * TEAM_011: Kept as a dummy exporter to ensure any test harness compiles cleanly.
 */
export function _resetKeyCooldownsForTesting(): void {
  // No-op on the client-side
}
