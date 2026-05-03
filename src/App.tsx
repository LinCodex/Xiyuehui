/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  RefreshCcw,
  Clipboard,
  ExternalLink,
  UtensilsCrossed,
  Check,
  Languages,
  Flame,
  Heart,
  Crown,
  HandHeart,
  Smile,
  Music,
  Coffee,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { generateReview, SurveyResults } from "./services/gemini";

// --- Types ---
type Step =
  | "welcome"
  | "survey"
  | "rating"
  | "comments"
  | "generating"
  | "result";

interface Option {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

interface SurveyQuestion {
  key: "food" | "service" | "atmosphere";
  title: string;
  subtitle: string;
  options: Option[];
}

const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    key: "food",
    title: "How was the food?",
    subtitle: "From the first bite to the last — how did the flavors land?",
    options: [
      {
        label: "Outstanding",
        value: "outstanding",
        description: "Truly memorable, every bite a highlight.",
        icon: Flame,
      },
      {
        label: "Delicious",
        value: "delicious",
        description: "Loved the dishes, would order again.",
        icon: Heart,
      },
      {
        label: "Tasty",
        value: "tasty",
        description: "Solid, satisfying, hit the spot.",
        icon: UtensilsCrossed,
      },
    ],
  },
  {
    key: "service",
    title: "How was the service?",
    subtitle: "Tell us about the team that took care of your table.",
    options: [
      {
        label: "Excellent",
        value: "excellent",
        description: "Polished, attentive, and a step ahead.",
        icon: Crown,
      },
      {
        label: "Attentive",
        value: "attentive",
        description: "Always there when we needed something.",
        icon: HandHeart,
      },
      {
        label: "Friendly",
        value: "friendly",
        description: "Warm, welcoming, easy to chat with.",
        icon: Smile,
      },
    ],
  },
  {
    key: "atmosphere",
    title: "How was the vibe?",
    subtitle: "The energy of the room can make a great meal even better.",
    options: [
      {
        label: "Vibrant",
        value: "vibrant",
        description: "Lively, energetic, full of buzz.",
        icon: Music,
      },
      {
        label: "Cozy",
        value: "cozy",
        description: "Warm, intimate, inviting.",
        icon: Coffee,
      },
      {
        label: "Relaxing",
        value: "relaxing",
        description: "Calm, easy-going, unhurried.",
        icon: Leaf,
      },
    ],
  },
];

const MAX_REFRESH = 5;

// Slide direction → motion variants used by the per-question animation.
const SURVEY_SLIDE_VARIANTS = {
  initial: (dir: number) => ({opacity: 0, x: dir * 40}),
  animate: {opacity: 1, x: 0},
  exit: (dir: number) => ({opacity: 0, x: -dir * 40}),
};

function getQualityLabel(rating: number): string {
  if (rating >= 4.5) return "Outstanding";
  if (rating >= 3.5) return "Excellent";
  if (rating >= 2.5) return "Great";
  if (rating >= 1.5) return "Good";
  return "Needs Work";
}

const SUGGESTIONS = [
  "e.g., The Black Fungus With Wild Pepper was delicious...",
  "e.g., Really enjoyed the Blood Tofu With Pork Intestines...",
  "e.g., Braised Pork Tripe With Cordyceps Flowers & Dual Mushrooms was amazing...",
  "e.g., Loved the Braised String Beans And Eggplant...",
  "e.g., The Braised Turtle With Two Peppers was so unique...",
  "e.g., Brown Sugar Glutinous Rice Cake was the perfect dessert...",
  "e.g., The Cashew Celery was fresh and crunchy...",
  "e.g., Chive Flower Stir-Fried Fresh Squid was perfectly cooked...",
  "e.g., The Chongqing Spicy Chicken was flavorful and spicy...",
  "e.g., Cold Edamame was a great starter...",
  "e.g., The staff was very attentive...",
  "e.g., The waiter gave great recommendations...",
  "e.g., The service was incredibly fast...",
];

// --- Main App ---
export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [results, setResults] = useState<SurveyResults>({
    food: "",
    service: "",
    atmosphere: "",
    rating: 5,
    comments: "",
  });

  const [reviews, setReviews] = useState<{ en: string; cn: string } | null>(
    null,
  );
  const [lang, setLang] = useState<"en" | "cn">("en");
  const [refreshCount, setRefreshCount] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [randomPlaceholder, setRandomPlaceholder] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyDirection, setSurveyDirection] = useState<1 | -1>(1);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * SUGGESTIONS.length);
    setRandomPlaceholder(SUGGESTIONS[randomIdx]);

    // Select 4 random suggestions excluding the one used as placeholder.
    const available = SUGGESTIONS.filter((_, i) => i !== randomIdx);
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 4));
  }, []);

  const handleOptionSelect = (key: keyof SurveyResults, value: any) => {
    setResults((prev) => ({ ...prev, [key]: value }));
  };

  const goToSurvey = () => {
    setSurveyIndex(0);
    setSurveyDirection(1);
    setStep("survey");
  };

  const handleSurveyNext = () => {
    if (surveyIndex < SURVEY_QUESTIONS.length - 1) {
      setSurveyDirection(1);
      setSurveyIndex((idx) => idx + 1);
    } else {
      setStep("rating");
    }
  };

  const handleSurveyBack = () => {
    if (surveyIndex === 0) {
      setStep("welcome");
    } else {
      setSurveyDirection(-1);
      setSurveyIndex((idx) => idx - 1);
    }
  };

  const handleRatingBack = () => {
    setSurveyIndex(SURVEY_QUESTIONS.length - 1);
    setSurveyDirection(-1);
    setStep("survey");
  };

  const handleGenerate = async () => {
    setStep("generating");
    const [en, cn] = await Promise.all([
      generateReview(results, "en"),
      generateReview(results, "cn"),
    ]);
    setReviews({ en, cn });
    setStep("result");
  };

  const handleRefresh = async () => {
    if (refreshCount >= MAX_REFRESH) return;
    setStep("generating");
    const [en, cn] = await Promise.all([
      generateReview(results, "en"),
      generateReview(results, "cn"),
    ]);
    setReviews({ en, cn });
    setRefreshCount((prev) => prev + 1);
    setStep("result");
  };

  const copyToClipboard = () => {
    const text = reviews ? (lang === "en" ? reviews.en : reviews.cn) : "";
    navigator.clipboard.writeText(text);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleRedirect = () => {
    copyToClipboard();
    setShowRedirectModal(true);
  };

  const confirmRedirect = () => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=Chuan+Bistro+135-21A+37th+Ave+Flushing+NY+11354",
      "_blank",
    );
    setShowRedirectModal(false);
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#eaeaeb] text-[#1A1A1A] font-sans selection:bg-[#E60000] selection:text-white overflow-x-hidden w-full transition-colors duration-500">
      {/* Aesthetic Background */}
      <div className="fixed inset-0 z-0 bg-[#eaeaeb] overflow-hidden">
        {/* Maroon Blob 1 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1.1, 1],
            x: [0, -100, 50, 0],
            y: [0, 150, -50, 0],
            rotate: [0, 90, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-20%] w-[100vw] sm:w-[90vw] md:w-[80vw] aspect-square rounded-[40%_60%_70%_30%] bg-gradient-to-tr from-[#CC0000] via-[#990000] to-transparent blur-[90px] sm:blur-[120px] opacity-[0.9]"
        />

        {/* Maroon Blob 2 */}
        <motion.div
          animate={{
            scale: [1, 1.3, 0.9, 1],
            x: [0, 150, -80, 0],
            y: [0, -100, 120, 0],
            rotate: [360, 180, 90, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[-30%] w-[90vw] sm:w-[80vw] md:w-[70vw] aspect-square rounded-[60%_40%_30%_70%] bg-gradient-to-bl from-[#CC0000] via-[#990000] to-transparent blur-[100px] sm:blur-[130px] opacity-[0.8]"
        />

        {/* Deep dark spot in the very corner for contrast */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[-15%] w-[70vw] sm:w-[60vw] md:w-[45vw] aspect-square rounded-full bg-[#4D0000] blur-[90px] opacity-[0.8]"
        />

        {/* Subtle warm tint left/bottom for depth */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-30%] left-[-20%] w-[90vw] sm:w-[70vw] aspect-square rounded-full bg-[#d6cdc8] blur-[120px] opacity-[0.5]"
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <main
        className="relative z-10 max-w-md sm:max-w-lg md:max-w-2xl mx-auto h-[100dvh] flex flex-col"
        style={{
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))",
        }}
      >
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden pb-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start w-full mix-blend-difference text-[white]/80">
                <div className="font-semibold tracking-[0.2em] leading-snug text-[10px] sm:text-xs uppercase pt-2">
                  <p>Chuan Bistro</p>
                  <p>Review</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/20 bg-black/10 backdrop-blur-sm flex items-center justify-center text-white shadow-lg mix-blend-normal z-20">
                  <span className="text-xl sm:text-2xl font-semibold">叙</span>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Big Text Group */}
              <div className="flex justify-between items-end mb-8 sm:mb-10 w-full pl-2">
                <div className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#78716C] pb-2">
                  {new Date().getFullYear()}
                </div>
                <div className="text-right">
                  <h1 className="text-[40px] sm:text-[56px] md:text-[64px] tracking-tight text-[#111111] leading-[1.05]">
                    <span className="block font-medium">CRAFT</span>
                    <span className="block font-medium">YOUR PERFECT</span>
                    <span className="block font-bold">REVIEW</span>
                  </h1>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex w-full">
                <button
                  onClick={goToSurvey}
                  className="relative overflow-hidden w-full rounded-full bg-[#111111] text-white py-5 sm:py-6 transition-all duration-500 active:scale-[0.98] group font-bold uppercase tracking-[0.2em] text-xs sm:text-sm flex items-center justify-center gap-3 border border-white/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E60000] to-[#CC0000] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  <span className="whitespace-nowrap z-10">Start Crafting</span>
                  
                  <div className="w-6 h-5 relative z-10 flex items-center justify-center shrink-0">
                    <motion.div
                      animate={{ x: [-3, 3, -3] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </motion.div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Survey Step — one question per screen */}
          {step === "survey" && (
            <motion.div
              key="survey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col py-2 max-w-xl mx-auto w-full"
            >
              {/* Progress segments */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {SURVEY_QUESTIONS.map((q, idx) => {
                  const isActive = idx === surveyIndex;
                  const isComplete = !!results[q.key] && idx < surveyIndex;
                  return (
                    <motion.div
                      key={q.key}
                      animate={{
                        width: isActive ? 36 : 10,
                        backgroundColor:
                          isActive || isComplete ? "#E60000" : "#E7E5E4",
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-1.5 rounded-full"
                    />
                  );
                })}
              </div>

              {/* Animated question pane */}
              <AnimatePresence mode="wait" custom={surveyDirection}>
                <motion.div
                  key={surveyIndex}
                  custom={surveyDirection}
                  variants={SURVEY_SLIDE_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="flex-1 flex flex-col"
                >
                  {(() => {
                    const question = SURVEY_QUESTIONS[surveyIndex];
                    const selectedValue = results[question.key];
                    const isLast =
                      surveyIndex === SURVEY_QUESTIONS.length - 1;
                    return (
                      <>
                        {/* Question heading */}
                        <div className="text-center pt-10 pb-6">
                          <motion.h2
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.35)]"
                          >
                            {question.title}
                          </motion.h2>
                          <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.13 }}
                            className="text-sm sm:text-base text-[#1A1A1A] mt-3 max-w-sm mx-auto leading-relaxed"
                          >
                            {question.subtitle}
                          </motion.p>
                        </div>

                        {/* Option cards */}
                        <div className="flex-1 flex flex-col justify-center gap-3 my-2">
                          {question.options.map((opt, idx) => {
                            const Icon = opt.icon;
                            const isSelected = selectedValue === opt.value;
                            return (
                              <motion.button
                                key={opt.value}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay: 0.25 + idx * 0.08,
                                  duration: 0.4,
                                  ease: "easeOut",
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() =>
                                  handleOptionSelect(question.key, opt.value)
                                }
                                className={`relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 rounded-3xl border-2 text-left transition-colors duration-300 ${
                                  isSelected
                                    ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-2xl shadow-[#1A1A1A]/25"
                                    : "bg-white/70 backdrop-blur-md border-white hover:border-[#E60000]/40 hover:bg-white text-[#1A1A1A]"
                                }`}
                              >
                                {/* Subtle red glow when selected */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.span
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-[#E60000]/40 via-transparent to-transparent"
                                    />
                                  )}
                                </AnimatePresence>

                                <motion.div
                                  animate={{
                                    rotate: isSelected ? [0, -8, 8, 0] : 0,
                                    scale: isSelected ? 1.05 : 1,
                                  }}
                                  transition={{ duration: 0.4 }}
                                  className={`relative z-10 shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                                    isSelected
                                      ? "bg-[#E60000] text-white shadow-lg shadow-[#E60000]/40"
                                      : "bg-[#E60000]/10 text-[#E60000]"
                                  }`}
                                >
                                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                </motion.div>

                                <div className="relative z-10 flex-1 min-w-0">
                                  <p className="text-base sm:text-lg font-bold leading-tight">
                                    {opt.label}
                                  </p>
                                  <p
                                    className={`text-xs sm:text-sm mt-1 leading-snug ${
                                      isSelected
                                        ? "text-white/70"
                                        : "text-[#78716C]"
                                    }`}
                                  >
                                    {opt.description}
                                  </p>
                                </div>

                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -90, opacity: 0 }}
                                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                      }}
                                      className="relative z-10 shrink-0 w-7 h-7 rounded-full bg-white text-[#E60000] flex items-center justify-center shadow-md"
                                    >
                                      <Check
                                        className="w-4 h-4"
                                        strokeWidth={3}
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Navigation footer */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="flex items-center gap-3 pt-4"
                        >
                          <button
                            onClick={handleSurveyBack}
                            className="shrink-0 w-14 h-14 rounded-full border-2 border-[#1A1A1A]/10 bg-white/70 backdrop-blur-md flex items-center justify-center text-[#1A1A1A] hover:border-[#1A1A1A]/40 hover:bg-white active:scale-95 transition-all"
                            aria-label="Back"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            disabled={!selectedValue}
                            onClick={handleSurveyNext}
                            className="group relative overflow-hidden flex-1 bg-[#1A1A1A] text-white py-4 sm:py-5 rounded-full font-bold uppercase tracking-[0.15em] text-xs sm:text-sm disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3 transition-all duration-500 hover:shadow-2xl hover:shadow-[#E60000]/30"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-[#E60000] to-[#CC0000] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10">
                              {isLast ? "Continue" : "Next"}
                            </span>
                            <motion.div
                              animate={
                                selectedValue
                                  ? { x: [0, 4, 0] }
                                  : { x: 0 }
                              }
                              transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="relative z-10"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          </button>
                        </motion.div>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Rating Step */}
          {step === "rating" &&
            (() => {
              const rating = Number(results.rating);
              const qualityLabel = getQualityLabel(rating);
              const fillPct = ((rating - 1) / 4) * 100;
              return (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col py-2 max-w-xl mx-auto w-full"
                >
                  {/* Heading */}
                  <div className="text-center pt-10 pb-2">
                    <motion.h2
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.35)]"
                    >
                      Overall Rating
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.13 }}
                      className="text-sm sm:text-base text-[#1A1A1A] mt-3 max-w-sm mx-auto leading-relaxed"
                    >
                      How was your visit overall?
                    </motion.p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-center gap-8 sm:gap-10 my-2">
                    {/* Stars row */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="flex items-center justify-center gap-2 sm:gap-3"
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const fillPercent = Math.max(
                          0,
                          Math.min(100, (rating - (star - 1)) * 100),
                        );
                        return (
                          <motion.button
                            key={star}
                            onClick={() =>
                              handleOptionSelect("rating", star)
                            }
                            whileTap={{ scale: 1.25 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 18,
                            }}
                            className="p-1 relative"
                            aria-label={`Rate ${star} out of 5`}
                          >
                            <Star
                              className="w-11 h-11 sm:w-14 sm:h-14 text-[#E7E5E4]"
                              strokeWidth={1.5}
                            />
                            <div
                              className="absolute inset-0 p-1 pointer-events-none"
                              style={{
                                clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
                              }}
                            >
                              <Star
                                className="w-11 h-11 sm:w-14 sm:h-14 text-[#F59E0B] fill-[#F59E0B] drop-shadow-md"
                                strokeWidth={1.5}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>

                    {/* Glass card with big numeric + quality label */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="bg-white/70 backdrop-blur-md border-2 border-white shadow-lg shadow-black/5 rounded-3xl px-10 py-6 flex flex-col items-center min-w-[220px]"
                    >
                      <span className="text-6xl sm:text-7xl font-bold text-[#1A1A1A] tabular-nums leading-none tracking-tight">
                        {rating.toFixed(1)}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={qualityLabel}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#E60000] mt-3"
                        >
                          {qualityLabel}
                        </motion.p>
                      </AnimatePresence>
                    </motion.div>

                    {/* Custom slider */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="w-full max-w-md mx-auto px-2"
                    >
                      <div className="relative h-7 flex items-center">
                        {/* Background track */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-white/60 backdrop-blur-sm border border-white rounded-full" />
                        {/* Filled track */}
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-[#E60000] to-[#CC0000] rounded-full shadow-md shadow-[#E60000]/30"
                          style={{ width: `${fillPct}%` }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                        {/* Native input on top — only the thumb is visible (CSS) */}
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          value={rating}
                          onChange={(e) =>
                            handleOptionSelect(
                              "rating",
                              parseFloat(e.target.value),
                            )
                          }
                          aria-label="Overall rating slider"
                          className="rating-slider absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mt-4">
                        <span>Needs Work</span>
                        <span>Excellent</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Footer nav */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center gap-3 pt-4"
                  >
                    <button
                      onClick={handleRatingBack}
                      className="shrink-0 w-14 h-14 rounded-full border-2 border-[#1A1A1A]/10 bg-white/70 backdrop-blur-md flex items-center justify-center text-[#1A1A1A] hover:border-[#1A1A1A]/40 hover:bg-white active:scale-95 transition-all"
                      aria-label="Back"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setStep("comments")}
                      className="group relative overflow-hidden flex-1 bg-[#1A1A1A] text-white py-4 sm:py-5 rounded-full font-bold uppercase tracking-[0.15em] text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-500 hover:shadow-2xl hover:shadow-[#E60000]/30"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-[#E60000] to-[#CC0000] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10">Add Details</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </button>
                  </motion.div>
                </motion.div>
              );
            })()}

          {/* Comments Step */}
          {step === "comments" && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col py-4 justify-between max-w-xl mx-auto w-full space-y-4"
            >
              <div className="space-y-2 mt-2">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] text-center mt-4">
                  Anything else?
                </h2>
                <p className="text-sm text-[#78716C] text-center">
                  Mention specific dishes or staff members (optional)
                </p>
              </div>

              <div className="flex-1 flex flex-col min-h-[150px] my-2">
                <textarea
                  value={results.comments}
                  onChange={(e) =>
                    handleOptionSelect("comments", e.target.value)
                  }
                  placeholder={randomPlaceholder}
                  className="flex-1 w-full p-6 bg-white/80 backdrop-blur-md border-2 border-white focus:bg-white rounded-[2rem] outline-none focus:border-[#E60000]/50 transition-all duration-300 resize-none text-lg shadow-sm focus:shadow-md"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center pb-2">
                {(suggestions || []).map((suggestion, idx) => {
                  const suggestionText = (suggestion || "")
                    .replace("e.g., ", "")
                    .replace("...", "");
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const newComments = results.comments
                          ? `${results.comments}, ${suggestionText}`
                          : suggestionText;
                        handleOptionSelect("comments", newComments);
                      }}
                      className="px-4 py-2 bg-white/80 backdrop-blur-sm shadow-sm text-[13px] text-[#57534E] font-medium rounded-full hover:bg-white hover:text-[#1A1A1A] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-white/50 cursor-pointer"
                    >
                      + {suggestionText}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-auto">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-[#E60000] text-white py-4 sm:py-5 rounded-full font-bold uppercase tracking-[0.15em] text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#CC0000] hover:shadow-2xl hover:shadow-[#E60000]/30 transition-all duration-500 shadow-lg shadow-[#E60000]/20 hover:-translate-y-0.5"
                >
                  Generate Review
                </button>
              </div>
            </motion.div>
          )}

          {/* Generating Step */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center space-y-8"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.img
                  animate={{
                    rotate: [-15, 15, -15],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  src="/chili.svg"
                  alt="Loading animation"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-medium">Crafting your review...</p>
                <p className="text-sm text-[#78716C]">
                  Personalizing based on your feedback
                </p>
              </div>
            </motion.div>
          )}

          {/* Result Step */}
          {step === "result" && reviews && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col py-4 justify-between space-y-4 max-w-2xl mx-auto w-full"
            >
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
                  Your Review
                </h2>
                <button
                  onClick={() => setLang(lang === "en" ? "cn" : "en")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F3F2F1] rounded-full text-sm font-medium hover:bg-[#E7E5E4] transition-colors"
                >
                  <Languages className="w-4 h-4 sm:w-5" />
                  {lang === "en" ? "中文" : "English"}
                </button>
              </div>

              <div className="relative group flex-1 flex flex-col">
                <textarea
                  value={lang === "en" ? reviews.en : reviews.cn}
                  onChange={(e) => {
                    if (reviews) {
                      setReviews({ ...reviews, [lang]: e.target.value });
                    }
                  }}
                  className="flex-1 bg-white/80 backdrop-blur-md p-6 sm:p-8 pr-14 sm:pr-16 rounded-[2rem] border-2 border-white focus:bg-white shadow-lg leading-relaxed text-[#44403C] text-lg sm:text-xl min-h-[160px] sm:min-h-[200px] outline-none focus:border-[#E60000]/50 transition-all duration-300 resize-none w-full block scrollbar-hide focus:shadow-xl"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-md border hover:border-[#E60000] hover:bg-[#E60000] hover:text-white transition-all active:scale-95 text-[#57534E]"
                >
                  {isCopying ? (
                    <Check className="w-5 h-5 text-green-500 hover:text-white" />
                  ) : (
                    <Clipboard className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <p className="text-sm font-medium text-[#78716C]">
                    Refreshes:{" "}
                    <span
                      className={
                        refreshCount >= MAX_REFRESH ? "text-red-500" : ""
                      }
                    >
                      {refreshCount}/{MAX_REFRESH}
                    </span>
                  </p>
                  {refreshCount >= MAX_REFRESH && (
                    <p className="text-[10px] uppercase tracking-tighter text-red-500 font-bold bg-red-50 px-2 py-1 rounded-full">
                      Limit reached
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshCount >= MAX_REFRESH}
                  className="w-full flex items-center justify-center gap-2 font-medium text-base sm:text-lg text-[#78716C] hover:text-[#E60000] disabled:opacity-30 p-2 transition-colors"
                >
                  <RefreshCcw
                    className={`w-4 h-4 sm:w-5 ${refreshCount < MAX_REFRESH && "group-hover:rotate-180 transition-transform duration-500"}`}
                  />
                  Not quite right? Regenerate
                </button>

                <div className="w-full pt-2 mt-auto">
                  <button
                    onClick={handleRedirect}
                    className="w-full bg-[#E60000] text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#E60000]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Post to Google Maps
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Redirect Confirmation Modal */}
      <AnimatePresence>
        {showRedirectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Review Copied!</h3>
                <p className="text-[#78716C]">
                  We're opening Google Maps for you. Simply paste your review in
                  the comment box.
                </p>
              </div>
              <button
                onClick={confirmRedirect}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-full font-medium"
              >
                Go to Google Maps
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
