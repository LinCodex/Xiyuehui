/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  memo,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { m, AnimatePresence } from "motion/react";
import {
  Star,
  ChevronRight,
  ChevronLeft,
  Plus,
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

// Stable inline style for <main> so React doesn't allocate a fresh object on
// every render. The `max(...)` keeps a 1.5rem default on devices without
// safe-area insets (desktop, older phones).
const MAIN_PADDING: CSSProperties = {
  paddingTop: "max(1.5rem, env(safe-area-inset-top))",
  paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
  paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
  paddingRight: "max(1.5rem, env(safe-area-inset-right))",
};

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
    subtitle: "From the first bite to the last ? how did the flavors land?",
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

// Slide direction ??? motion variants used by the per-question animation.
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

interface RatingStepProps {
  initial: number;
  onCommit: (rating: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Isolated rating step with local state. The slider drag updates `rating`
 * locally so the parent App component never re-renders during the drag ? only
 * this subtree does. The committed value flows up to the parent on slider
 * release, star tap, or the Continue button.
 */
const RatingStep = memo(function RatingStep({
  initial,
  onCommit,
  onBack,
  onContinue,
}: RatingStepProps) {
  const [rating, setRating] = useState(initial);
  const qualityLabel = getQualityLabel(rating);
  const fillPct = ((rating - 1) / 4) * 100;

  const handleStarClick = useCallback(
    (star: number) => {
      setRating(star);
      onCommit(star);
    },
    [onCommit],
  );

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRating(parseFloat(e.target.value));
  };

  const handleSliderRelease = () => {
    onCommit(rating);
  };

  const handleContinue = () => {
    onCommit(rating);
    onContinue();
  };

  return (
    <m.div
      key="rating"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col py-2 max-w-xl mx-auto w-full"
    >
      <div className="text-center pt-8 pb-2">
        <m.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111] leading-[1.1]"
        >
          Overall Rating
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="text-sm sm:text-base text-[#555] mt-4 max-w-sm mx-auto leading-relaxed"
        >
          How was your visit overall?
        </m.p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-8 sm:gap-10 my-2">
        {/* Stars row ??? plain buttons + Tailwind active scale, no motion. */}
        <m.div
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
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="p-1 relative active:scale-125 transition-transform duration-150"
                aria-label={`Rate ${star} out of 5`}
              >
                <Star
                  className="w-11 h-11 sm:w-14 sm:h-14 text-[#E7E5E4]"
                  strokeWidth={1.5}
                />
                <div
                  className="absolute inset-0 p-1 pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
                >
                  <Star
                    className="w-11 h-11 sm:w-14 sm:h-14 text-[#DC2626] fill-[#DC2626]"
                    strokeWidth={1.5}
                  />
                </div>
              </button>
            );
          })}
        </m.div>

        {/* Glassy value card. Big number is direct, label re-keys only when
            the bucket changes so it doesn't strobe during slider drag. */}
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-transparent px-10 py-6 flex flex-col items-center min-w-[220px]"
        >
          <span className="text-[5rem] sm:text-[6rem] font-black text-[#111] tabular-nums leading-none tracking-tighter">
            {rating.toFixed(1)}
          </span>
          <AnimatePresence mode="wait">
            <m.p
              key={qualityLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#DC2626] mt-3"
            >
              {qualityLabel}
            </m.p>
          </AnimatePresence>
        </m.div>

        {/* Custom slider ??? visual track + fill are plain divs (no spring on
            width so drag is instant); native input sits on top with only
            its thumb styled. */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full max-w-md mx-auto px-2"
        >
          <div className="relative h-7 flex items-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#E5E5E5] rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#111111] rounded-full"
              style={{ width: `${fillPct}%` }}
            />
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={rating}
              onChange={handleSliderChange}
              onPointerUp={handleSliderRelease}
              onKeyUp={handleSliderRelease}
              aria-label="Overall rating slider"
              className="rating-slider absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mt-4">
            <span>Needs Work</span>
            <span>Excellent</span>
          </div>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex items-center justify-between pt-4 pb-8 px-6"
      >
        <button
          onClick={onBack}
          className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-[#111] active:scale-95 transition-all"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-[#111]">Next</span>
          <button
            onClick={handleContinue}
            className="w-16 h-16 bg-[#111] text-white rounded-[1.25rem] flex items-center justify-center active:scale-95 transition-transform shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </m.div>
    </m.div>
  );
});

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

const EMBERS = Array.from({ length: 20 }).map(() => ({
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  tx: `${(Math.random() - 0.5) * 100}px`,
  ty: `-${Math.random() * 200 + 100}px`,
  size: `${Math.random() * 6 + 4}px`,
  duration: `${Math.random() * 5 + 5}s`,
  delay: `${Math.random() * 5}s`,
}));

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
  // Index for the inline shuffling suggestion pill that lives inside the
  // Comments textarea. Rotates through every entry in SUGGESTIONS so the
  // user always sees variety without ever having to scroll a chip row.
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyDirection, setSurveyDirection] = useState<1 | -1>(1);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * SUGGESTIONS.length);
    setRandomPlaceholder(SUGGESTIONS[randomIdx]);
    // Start the inline shuffle at a different random position so the
    // pill and the placeholder don't show the same line on first paint.
    setSuggestionIdx(
      (randomIdx + 1 + Math.floor(Math.random() * (SUGGESTIONS.length - 1))) %
        SUGGESTIONS.length,
    );
  }, []);

  // Auto-rotate the inline suggestion every 3.5s. Pure setInterval ?
  // setSuggestionIdx is the only state update so re-render is cheap.
  useEffect(() => {
    const id = setInterval(() => {
      setSuggestionIdx((i) => (i + 1) % SUGGESTIONS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleOptionSelect = useCallback(
    (key: keyof SurveyResults, value: any) => {
      setResults((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const goToSurvey = useCallback(() => {
    setSurveyIndex(0);
    setSurveyDirection(1);
    setStep("survey");
  }, []);

  const handleSurveyNext = useCallback(() => {
    setSurveyIndex((idx) => {
      if (idx < SURVEY_QUESTIONS.length - 1) {
        setSurveyDirection(1);
        return idx + 1;
      }
      setStep("rating");
      return idx;
    });
  }, []);

  const handleSurveyBack = useCallback(() => {
    setSurveyIndex((idx) => {
      if (idx === 0) {
        setStep("welcome");
        return idx;
      }
      setSurveyDirection(-1);
      return idx - 1;
    });
  }, []);

  const handleRatingBack = useCallback(() => {
    setSurveyIndex(SURVEY_QUESTIONS.length - 1);
    setSurveyDirection(-1);
    setStep("survey");
  }, []);

  const handleRatingCommit = useCallback((rating: number) => {
    setResults((prev) => ({ ...prev, rating }));
  }, []);

  const handleRatingContinue = useCallback(() => {
    setStep("comments");
  }, []);

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
    <div className="relative min-h-[100dvh] text-[#111] font-sans selection:bg-[#DC2626] selection:text-white overflow-x-hidden w-full bg-[#FAF5ED]">
      {/* Background Vector Lines */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05] overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 Q40,40 100,10" fill="none" stroke="#111" strokeWidth="0.1" />
          <path d="M0,70 Q60,90 100,50" fill="none" stroke="#111" strokeWidth="0.15" />
          <path d="M-20,90 Q50,110 120,70" fill="none" stroke="#111" strokeWidth="0.1" />
        </svg>
      </div>

      <main
        className="relative z-10 max-w-md sm:max-w-lg md:max-w-2xl mx-auto min-h-[100dvh] flex flex-col"
        style={MAIN_PADDING}
      >
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <m.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="relative h-[45dvh] w-full mt-6">
                <m.img 
                  src="/dish1.png" 
                  alt="Sichuan Dish"
                  className="absolute top-2 left-6 w-[55%] h-[75%] object-cover rounded-[2rem] shadow-xl"
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                />
                <m.img 
                  src="/dish2.png" 
                  alt="Sichuan Cocktail"
                  className="absolute bottom-2 right-6 w-[50%] h-[70%] object-cover rounded-[2rem] shadow-2xl"
                  initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                />
              </div>

              <div className="px-6 py-8 flex-1 flex flex-col justify-end pb-12">
                <m.h1 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-[#111]"
                >
                  Craft your <br/>perfect review
                </m.h1>
                <m.p 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-4 text-sm sm:text-base text-[#555] max-w-[85%] leading-relaxed"
                >
                  An unrivaled selection of phrases to capture the essence of Sichuan dining.
                </m.p>
                
                <m.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                  className="mt-10 flex justify-between items-end"
                >
                  <div className="flex gap-2 pb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccc]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccc]"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm text-[#111]">Start</span>
                    <button 
                      onClick={goToSurvey} 
                      className="w-16 h-16 bg-[#111] text-white rounded-[1.25rem] flex items-center justify-center active:scale-95 transition-transform shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </m.div>
              </div>
            </m.div>
          )}

          {/* Survey Step ??? one question per screen */}
          {step === "survey" && (
            <m.div
              key="survey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col py-2 max-w-xl mx-auto w-full"
            >
              {/* Progress segments */}
              <div className="flex items-center justify-center gap-2 pt-6">
                {SURVEY_QUESTIONS.map((q, idx) => {
                  const isActive = idx === surveyIndex;
                  const isFilled = isActive || (!!results[q.key] && idx < surveyIndex);
                  return (
                    <div
                      key={q.key}
                      className={`h-1.5 rounded-full transition-all duration-400 ease-out ${
                        isFilled ? "bg-[#111]" : "bg-[#E5E5E5]"
                      }`}
                      style={{ width: isActive ? 36 : 10 }}
                    />
                  );
                })}
              </div>

              {/* Animated question pane */}
              <AnimatePresence mode="wait" custom={surveyDirection}>
                <m.div
                  key={surveyIndex}
                  custom={surveyDirection}
                  variants={SURVEY_SLIDE_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="flex-1 flex flex-col px-6"
                >
                  {(() => {
                    const question = SURVEY_QUESTIONS[surveyIndex];
                    const selectedValue = results[question.key];
                    const isLast =
                      surveyIndex === SURVEY_QUESTIONS.length - 1;
                    return (
                      <>
                        {/* Question heading */}
                        <div className="pt-8 pb-6 text-left">
                          <m.h2
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111] leading-[1.1]"
                          >
                            {question.title}
                          </m.h2>
                          <m.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.13 }}
                            className="text-sm sm:text-base text-[#555] mt-3 max-w-[85%] leading-relaxed"
                          >
                            {question.subtitle}
                          </m.p>
                        </div>

                        {/* Option cards ??? plain buttons + CSS for entrance,
                            tap, and selection states. No motion components
                            here so taps stay on the compositor thread. */}
                        <div className="flex-1 flex flex-col justify-center gap-3 my-2">
                          {question.options.map((opt, idx) => {
                            const Icon = opt.icon;
                            const isSelected = selectedValue === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handleOptionSelect(question.key, opt.value)
                                }
                                style={{
                                  animationDelay: `${0.25 + idx * 0.08}s`,
                                }}
                                className={`card-enter relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 active:scale-[0.97] ${
                                  isSelected
                                    ? "bg-white border-[#111] shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                                    : "bg-white/60 border-transparent hover:bg-white text-[#111] shadow-sm"
                                }`}
                              >
                                <div
                                  className={`relative z-10 shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    isSelected
                                      ? "bg-[#111] text-white scale-105"
                                      : "bg-[#F0EBE1] text-[#555]"
                                  }`}
                                >
                                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                </div>

                                <div className="relative z-10 flex-1 min-w-0">
                                  <p className="text-base sm:text-lg font-bold leading-tight text-[#111]">
                                    {opt.label}
                                  </p>
                                  <p
                                    className={`text-xs sm:text-sm mt-1 leading-snug ${
                                      isSelected
                                        ? "text-[#555]"
                                        : "text-[#777]"
                                    }`}
                                  >
                                    {opt.description}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="check-badge relative z-10 shrink-0 w-7 h-7 rounded-full bg-[#111] text-white flex items-center justify-center shadow-md">
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Navigation footer */}
                        <m.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="flex items-center justify-between pt-4 pb-8"
                        >
                          <button
                            onClick={handleSurveyBack}
                            className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-[#111] active:scale-95 transition-all"
                            aria-label="Back"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <div className={`flex items-center gap-4 transition-opacity duration-300 ${!selectedValue ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                            <span className="font-bold text-sm text-[#111]">{isLast ? "Continue" : "Next"}</span>
                            <button
                              disabled={!selectedValue}
                              onClick={handleSurveyNext}
                              className="w-16 h-16 bg-[#111] text-white rounded-[1.25rem] flex items-center justify-center active:scale-95 transition-transform shadow-lg"
                            >
                              <ChevronRight className={`w-6 h-6 ${selectedValue ? "arrow-nudge" : ""}`} />
                            </button>
                          </div>
                        </m.div>
                      </>
                    );
                  })()}
                </m.div>
              </AnimatePresence>
            </m.div>
          )}

          {/* Rating Step ??? extracted into its own memoized component so the
              slider drag updates only that subtree's local state, never the
              full App. */}
          {step === "rating" && (
            <RatingStep
              key="rating"
              initial={Number(results.rating)}
              onCommit={handleRatingCommit}
              onBack={handleRatingBack}
              onContinue={handleRatingContinue}
            />
          )}

          {/* Comments Step */}
          {step === "comments" && (
            <m.div
              key="comments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col py-4 justify-between max-w-xl mx-auto w-full space-y-4"
            >
              <div className="pt-8 pb-4 px-6 text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111] leading-[1.1]">
                  Anything else?
                </h2>
                <p className="text-sm sm:text-base text-[#555] mt-3 max-w-[85%] leading-relaxed">
                  Mention specific dishes or staff members (optional)
                </p>
              </div>

              {(() => {
                // Strip the "e.g.," prefix and trailing "..." from the
                // current rotating suggestion so the inline pill reads as a
                // natural snippet (the trailing/leading bits only made sense
                // when the suggestion was a placeholder).
                const currentSuggestion = (
                  SUGGESTIONS[suggestionIdx] || ""
                )
                  .replace("e.g., ", "")
                  .replace("...", "");
                const addCurrentSuggestion = () => {
                  const newComments = results.comments
                    ? `${results.comments}, ${currentSuggestion}`
                    : currentSuggestion;
                  handleOptionSelect("comments", newComments);
                };
                return (
                  <div className="flex-1 flex flex-col min-h-[200px] my-2 relative">
                    <textarea
                      value={results.comments}
                      onChange={(e) =>
                        handleOptionSelect("comments", e.target.value)
                      }
                      placeholder={randomPlaceholder}
                      className="flex-1 w-full p-6 pb-16 sm:pb-20 bg-white border border-[#E5E5E5] rounded-2xl outline-none focus:border-[#111] transition-all duration-300 resize-none text-base shadow-sm focus:shadow-md text-[#111]"
                    />

                    {/* Inline shuffling suggestion pill — pinned to the
                        bottom of the textarea. The pill is sized to its
                        content so the + button naturally trails the text:
                        short suggestions — short pill, the + sits right
                        after the text; long suggestions — pill widens up
                        to the textarea width before the text truncates. */}
                    <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 flex justify-start pointer-events-none">
                      <AnimatePresence mode="wait">
                        <m.div
                          key={suggestionIdx}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{
                            duration: 0.28,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="inline-flex items-center gap-2 max-w-full pl-3 pr-1 py-1 bg-[#F0EBE1] rounded-full shadow-sm pointer-events-auto"
                        >
                          <span className="text-[12px] sm:text-[13px] text-[#57534E] font-medium truncate min-w-0">
                            {currentSuggestion}
                          </span>
                          <button
                            type="button"
                            onClick={addCurrentSuggestion}
                            className="shrink-0 w-7 h-7 rounded-full bg-[#111] text-white flex items-center justify-center active:scale-95 transition-all shadow-sm"
                            aria-label={`Add suggestion: ${currentSuggestion}`}
                          >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </m.div>
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-6 pb-8 px-6 mt-auto">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-[#111] text-white py-4 sm:py-5 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-lg"
                >
                  Generate Review
                </button>
              </div>
            </m.div>
          )}

          {/* Generating Step */}
          {step === "generating" && (
            <m.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center space-y-8"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <img
                  src="/chili.svg"
                  alt="Loading animation"
                  className="chili-loader w-full h-full object-contain"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-[#111]">Crafting your review...</p>
                <p className="text-sm text-[#555]">
                  Personalizing based on your feedback
                </p>
              </div>
            </m.div>
          )}

          {/* Result Step */}
          {step === "result" && reviews && (
            <m.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col py-4 justify-between space-y-4 max-w-2xl mx-auto w-full"
            >
              <div className="flex justify-between items-center px-6 mt-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111]">
                  Your Review
                </h2>
                <button
                  onClick={() => setLang(lang === "en" ? "cn" : "en")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F0EBE1] rounded-full text-sm font-bold text-[#111] hover:bg-[#E5E5E5] transition-colors shadow-sm"
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
                  className="flex-1 bg-white p-6 sm:p-8 pr-14 sm:pr-16 rounded-3xl border border-[#E5E5E5] shadow-sm leading-relaxed text-[#111] text-lg sm:text-xl min-h-[160px] sm:min-h-[200px] outline-none focus:border-[#111] transition-all duration-300 resize-none w-full block scrollbar-hide focus:shadow-md"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-md border hover:border-[#111] hover:bg-[#111] hover:text-white transition-all active:scale-95 text-[#555]"
                >
                  {isCopying ? (
                    <Check className="w-5 h-5 text-green-500 hover:text-white" />
                  ) : (
                    <Clipboard className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-4 px-6 pb-6 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-[#777]">
                    Refreshes:{" "}
                    <span
                      className={
                        refreshCount >= MAX_REFRESH ? "text-[#DC2626]" : ""
                      }
                    >
                      {refreshCount}/{MAX_REFRESH}
                    </span>
                  </p>
                  {refreshCount >= MAX_REFRESH && (
                    <p className="text-[10px] uppercase tracking-tighter text-[#DC2626] font-bold bg-red-50 px-2 py-1 rounded-full">
                      Limit reached
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshCount >= MAX_REFRESH}
                  className="w-full flex items-center justify-center gap-2 font-bold text-base sm:text-lg text-[#555] hover:text-[#111] disabled:opacity-30 p-2 transition-colors"
                >
                  <RefreshCcw
                    className={`w-4 h-4 sm:w-5 ${refreshCount < MAX_REFRESH ? "hover:rotate-180 transition-transform duration-500" : ""}`}
                  />
                  Not quite right? Regenerate
                </button>

                <div className="w-full pt-2 mt-auto">
                  <button
                    onClick={handleRedirect}
                    className="w-full bg-[#111] text-white py-4 rounded-[1.25rem] font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
                  >
                    Post to Google Maps
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </main>

      {/* Redirect Confirmation Modal */}
      <AnimatePresence>
        {showRedirectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60">
            <m.div
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
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
