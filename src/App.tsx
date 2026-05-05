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
  RefreshCcw,
  Clipboard,
  ExternalLink,
  Check,
  Languages,
} from "lucide-react";
import { generateReview, SurveyResults } from "./services/gemini";
import { t, Lang, getInitialLang } from "./translations";

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
  | "result"
  | "error";

interface Option {
  label: string;
  value: string;
  description: string;
}

interface SurveyQuestion {
  key: "food" | "service" | "atmosphere";
  title: string;
  subtitle: string;
  options: Option[];
}

const getSurveyQuestions = (lang: Lang): SurveyQuestion[] => [
  {
    key: "food",
    title: t[lang].surveyFoodTitle,
    subtitle: t[lang].surveyFoodSub,
    options: [
      { label: t[lang].foodOptions[0].label, value: "outstanding", description: t[lang].foodOptions[0].description },
      { label: t[lang].foodOptions[1].label, value: "delicious", description: t[lang].foodOptions[1].description },
      { label: t[lang].foodOptions[2].label, value: "tasty", description: t[lang].foodOptions[2].description },
    ],
  },
  {
    key: "service",
    title: t[lang].surveyServiceTitle,
    subtitle: t[lang].surveyServiceSub,
    options: [
      { label: t[lang].serviceOptions[0].label, value: "excellent", description: t[lang].serviceOptions[0].description },
      { label: t[lang].serviceOptions[1].label, value: "attentive", description: t[lang].serviceOptions[1].description },
      { label: t[lang].serviceOptions[2].label, value: "friendly", description: t[lang].serviceOptions[2].description },
    ],
  },
  {
    key: "atmosphere",
    title: t[lang].surveyAtmoTitle,
    subtitle: t[lang].surveyAtmoSub,
    options: [
      { label: t[lang].atmoOptions[0].label, value: "vibrant", description: t[lang].atmoOptions[0].description },
      { label: t[lang].atmoOptions[1].label, value: "cozy", description: t[lang].atmoOptions[1].description },
      { label: t[lang].atmoOptions[2].label, value: "relaxing", description: t[lang].atmoOptions[2].description },
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

function getQualityLabel(rating: number, lang: Lang): string {
  if (rating >= 4.5) return t[lang].qualityLabels[4];
  if (rating >= 3.5) return t[lang].qualityLabels[3];
  if (rating >= 2.5) return t[lang].qualityLabels[2];
  if (rating >= 1.5) return t[lang].qualityLabels[1];
  return t[lang].qualityLabels[0];
}

interface RatingStepProps {
  initial: number;
  lang: Lang;
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
  lang,
  onCommit,
  onBack,
  onContinue,
}: RatingStepProps) {
  const [rating, setRating] = useState(initial);
  const qualityLabel = getQualityLabel(rating, lang);
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
          {t[lang].overallRating}
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="text-sm sm:text-base text-[#555] mt-4 max-w-sm mx-auto leading-relaxed"
        >
          {t[lang].overallSub}
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
            <span>{t[lang].ratingLabels[0]}</span>
            <span>{t[lang].ratingLabels[1]}</span>
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
          <span className="font-bold text-sm text-[#111]">{t[lang].next}</span>
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
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const [refreshCount, setRefreshCount] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyDirection, setSurveyDirection] = useState<1 | -1>(1);

  // Auto-rotate the placeholder suggestion every 4s.
  useEffect(() => {
    const id = setInterval(() => {
      setSuggestionIdx((i) => (i + 1) % t[lang].suggestions.length);
    }, 4000);
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
      if (idx < 3 - 1) {
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
    setSurveyIndex(3 - 1);
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
    try {
      const [en, cn] = await Promise.all([
        generateReview(results, "en"),
        generateReview(results, "cn"),
      ]);
      setReviews({ en, cn });
      setStep("result");
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };

  const handleRefresh = async () => {
    if (refreshCount >= MAX_REFRESH) return;
    setStep("generating");
    try {
      const [en, cn] = await Promise.all([
        generateReview(results, "en", reviews?.en),
        generateReview(results, "cn", reviews?.cn),
      ]);
      setReviews({ en, cn });
      setRefreshCount((prev) => prev + 1);
      setStep("result");
    } catch (error) {
      console.error(error);
      setStep("error");
    }
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
      {/* Global Language Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <button
          onClick={() => setLang(lang === "en" ? "cn" : "en")}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-sm font-bold text-[#111] hover:bg-white transition-colors shadow-md border border-white/40"
        >
          <Languages className="w-4 h-4 sm:w-5" />
          {lang === "en" ? "中文" : "English"}
        </button>
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
              className="flex-1 flex flex-col h-full relative"
            >
              {/* Full-bleed Video Background for top half (no curved edges) */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 w-screen z-0"
                style={{ 
                  top: "calc(-1 * max(1.5rem, env(safe-area-inset-top)))",
                  height: "55dvh",
                  maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                }}
              >
                <m.video
                  src="https://chuanbistro.com/wp-content/themes/chuan-bistro/assets/Hero%20Video-C9Qrq4r7.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                />
                {/* Gradual blur for top 1/4 (Logo readability) */}
                <div 
                  className="absolute top-0 inset-x-0 h-[40%] pointer-events-none backdrop-blur-md" 
                  style={{ 
                    maskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)', 
                    WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)' 
                  }}
                />
                <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              </div>

              <div className="absolute top-6 inset-x-0 px-6 sm:top-8 sm:px-8 z-20 flex items-baseline gap-2">
                <span className="font-serif font-extrabold text-white tracking-widest text-xl sm:text-2xl uppercase drop-shadow-md">Chuan Bistro</span>
                <span className="font-serif font-bold text-[#C5A254] text-lg sm:text-xl tracking-wide drop-shadow-md">三杯叙</span>
              </div>
              
              {/* Spacer matching original image container layout to push text down exactly where it was */}
              <div className="relative h-[55dvh] w-full pt-20 px-6 pb-2 mt-4 shrink-0 z-10 pointer-events-none" />

              <div className="px-6 sm:px-8 py-8 flex-1 flex flex-col justify-end pb-12 z-10 relative">
                <m.h1 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-[clamp(2.2rem,8.5vw,3rem)] min-[400px]:text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] text-[#111]"
                >
                  {t[lang].welcomeTitle1}<br/>{t[lang].welcomeTitle2}
                </m.h1>
                
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
                    <span className="font-bold text-sm text-[#111]">{t[lang].startBtn}</span>
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
                {getSurveyQuestions(lang).map((q, idx) => {
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
                    const question = getSurveyQuestions(lang)[surveyIndex];
                    const selectedValue = results[question.key];
                    const isLast = surveyIndex === 3 - 1;
                    return (
                      <>
                        {/* Question heading */}
                        <div className="pt-6 pb-2 text-left">
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
                        <div className="flex-1 flex flex-col justify-center gap-4 my-2">
                          {question.options.map((opt, idx) => {
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
                                className={`card-enter relative overflow-hidden flex items-center gap-4 p-6 sm:p-8 rounded-[1.25rem] border transition-all duration-300 active:scale-[0.97] ${
                                  isSelected
                                    ? "bg-white border-[#111] shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                                    : "bg-white/60 border-transparent hover:bg-white text-[#111] shadow-sm"
                                }`}
                              >
                                <div className="relative z-10 flex-1 min-w-0">
                                  <p className="text-lg sm:text-xl font-bold leading-tight text-[#111]">
                                    {opt.label}
                                  </p>
                                  <p
                                    className={`text-sm sm:text-base mt-1.5 leading-snug ${
                                      isSelected
                                        ? "text-[#555]"
                                        : "text-[#777]"
                                    }`}
                                  >
                                    {opt.description}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="check-badge relative z-10 shrink-0 w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center shadow-md">
                                    <Check className="w-5 h-5" strokeWidth={3} />
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
                            <span className="font-bold text-sm text-[#111]">{t[lang].next}</span>
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
              lang={lang}
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
                  {t[lang].commentsTitle}
                </h2>
                <p className="text-sm sm:text-base text-[#555] mt-3 max-w-[85%] leading-relaxed">
                  {t[lang].commentsSub}
                </p>
              </div>

                  <div className="flex-1 flex flex-col min-h-[200px] my-2 relative px-6">
                    <textarea
                      value={results.comments}
                      onChange={(e) =>
                        handleOptionSelect("comments", e.target.value)
                      }
                      placeholder={t[lang].suggestions[suggestionIdx]}
                      className="flex-1 w-full p-6 sm:p-8 bg-white border border-[#E5E5E5] rounded-2xl outline-none focus:border-[#111] transition-all duration-300 resize-none text-base sm:text-lg shadow-sm focus:shadow-md text-[#111] placeholder-[#A8A29E]"
                    />
                  </div>

              <div className="pt-6 pb-8 px-6 mt-auto">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-[#111] text-white py-4 sm:py-5 rounded-[1.25rem] font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-lg"
                >
                  {t[lang].createBtn}
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
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-[3px] border-[#DC2626]/20 rounded-full" />
                <m.div
                  className="absolute inset-0 border-[3px] border-[#DC2626] rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-[#111]">{t[lang].generatingTitle}</p>
                <p className="text-sm text-[#555]">
                  {t[lang].generatingSub}
                </p>
              </div>
            </m.div>
          )}

          {/* Error Step */}
          {step === "error" && (
            <m.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-center items-center text-center px-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                <span className="text-red-500 text-4xl">⚠️</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">{t[lang].errorTitle}</h2>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-sm mx-auto">
                {t[lang].errorSub}
              </p>
              
              <div className="w-full space-y-4">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-[#111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#333] transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  {t[lang].tryAgain}
                </button>
                <button
                  onClick={confirmRedirect}
                  className="w-full bg-white text-[#111] py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                >
                  {t[lang].skipBtn}
                </button>
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
                  {t[lang].resultTitle}
                </h2>
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
                    {t[lang].refreshes}:{" "}
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
                      {t[lang].limitReached}
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
                  {t[lang].regenerate}
                </button>

                <div className="w-full pt-2 mt-auto">
                  <button
                    onClick={handleRedirect}
                    className="w-full bg-[#111] text-white py-4 rounded-[1.25rem] font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
                  >
                    {t[lang].postBtn}
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
                <h3 className="text-xl font-semibold">{t[lang].modalTitle}</h3>
                <p className="text-[#78716C]">
                  {t[lang].modalSub}
                </p>
              </div>
              <button
                onClick={confirmRedirect}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-full font-medium"
              >
                {t[lang].modalGo}
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
