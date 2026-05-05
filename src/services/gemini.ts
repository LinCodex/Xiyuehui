export interface SurveyResults {
  food: string;
  service: string;
  atmosphere: string;
  rating: number;
  comments?: string;
}

function getApiKey(): string {
  return (
    ((import.meta as ImportMeta).env?.VITE_GEMINI_API_KEY as string) || ""
  );
}

export async function generateReview(
  results: SurveyResults,
  language: "en" | "cn" = "en",
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      "[gemini] No API key configured. Set VITE_GEMINI_API_KEY in your .env file.",
    );
    return language === "en"
      ? "API key not configured. Add VITE_GEMINI_API_KEY to your .env file."
      : "API 密钥未配置。请在 .env 文件中添加 VITE_GEMINI_API_KEY。";
  }

  const prompt = `
You are helping a real customer write a Google Maps review for "Chuan Bistro" (三杯叙) in Flushing, NY.

Here is what the customer told us about their visit:
- They described the food as: ${results.food}
- They described the service as: ${results.service}
- They described the atmosphere/vibe as: ${results.atmosphere}
- Their overall rating: ${results.rating} out of 5
- Their own additional details: ${results.comments || "nothing specific mentioned"}

Write a review in ${language === "en" ? "English" : "Simplified Chinese"} that sounds like a normal, everyday person posting on Google Maps. NOT a food blogger, NOT an influencer, NOT a marketing person. Just a regular customer sharing their honest experience.

Critical rules you MUST follow:
1. NEVER use hyphens (-) or dashes anywhere in the review.
2. NEVER use emojis.
3. NEVER use over the top words like "incredible", "amazing", "absolutely", "game changer", "next level", "must try", "blown away", "obsessed", "divine", "exquisite", "impeccable", "phenomenal", "spectacular".
4. Use simple, conversational language. Think about how a normal person actually talks.
5. Keep it 3 to 5 sentences long.
6. If the customer mentioned specific dishes or details, naturally weave those in.
7. Make the tone match the rating. A 5 star review should be enthusiastic but real. A 3 star review should be balanced.
8. Every review must be unique. Vary sentence structure, opening lines, and phrasing. Do NOT start with "Went to" or "Visited" every time. Mix it up.
9. If writing in Chinese, refer to the restaurant as "三杯叙".
10. Output ONLY the review text. No quotes, no labels, no extra formatting.
`;

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return (
      response.text?.trim() || "Something went wrong generating the review."
    );
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Temporary debug: output the exact error message so we can see why Vercel is failing
    return `Debug Error: ${error?.message || String(error)}`;
  }
}
