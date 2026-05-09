/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { generateAllReviews, SurveyResults } from "./services/gemini";
import { t, Lang, getInitialLang } from "./translations";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const YelpIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
    <path d="M13.961 22.279c0.246-0.273 0.601-0.444 0.995-0.444 0.739 0 1.338 0.599 1.338 1.338 0 0.016-0 0.032-0.001 0.048l0-0.002-0.237 6.483c-0.027 0.719-0.616 1.293-1.34 1.293-0.077 0-0.153-0.006-0.226-0.019l0.008 0.001c-1.763-0.303-3.331-0.962-4.69-1.902l0.039 0.025c-0.351-0.245-0.578-0.647-0.578-1.102 0-0.346 0.131-0.661 0.346-0.898l-0.001 0.001 4.345-4.829zM12.853 20.434l-6.301 1.572c-0.097 0.025-0.208 0.039-0.322 0.039-0.687 0-1.253-0.517-1.332-1.183l-0.001-0.006c-0.046-0.389-0.073-0.839-0.073-1.295 0-1.324 0.223-2.597 0.635-3.781l-0.024 0.081c0.183-0.534 0.681-0.911 1.267-0.911 0.214 0 0.417 0.050 0.596 0.14l-0.008-0.004 5.833 2.848c0.45 0.221 0.754 0.677 0.754 1.203 0 0.623-0.427 1.147-1.004 1.294l-0.009 0.002zM13.924 15.223l-6.104-10.574c-0.112-0.191-0.178-0.421-0.178-0.667 0-0.529 0.307-0.987 0.752-1.204l0.008-0.003c1.918-0.938 4.153-1.568 6.511-1.761l0.067-0.004c0.031-0.003 0.067-0.004 0.104-0.004 0.738 0 1.337 0.599 1.337 1.337 0 0.001 0 0.001 0 0.002v-0 12.207c-0 0.739-0.599 1.338-1.338 1.338-0.493 0-0.923-0.266-1.155-0.663l-0.003-0.006zM19.918 20.681l6.176 2.007c0.541 0.18 0.925 0.682 0.925 1.274 0 0.209-0.048 0.407-0.134 0.584l0.003-0.008c-0.758 1.569-1.799 2.889-3.068 3.945l-0.019 0.015c-0.23 0.19-0.527 0.306-0.852 0.306-0.477 0-0.896-0.249-1.134-0.625l-0.003-0.006-3.449-5.51c-0.128-0.201-0.203-0.446-0.203-0.709 0-0.738 0.598-1.336 1.336-1.336 0.147 0 0.289 0.024 0.421 0.068l-0.009-0.003zM26.197 16.742l-6.242 1.791c-0.11 0.033-0.237 0.052-0.368 0.052-0.737 0-1.335-0.598-1.335-1.335 0-0.282 0.087-0.543 0.236-0.758l-0.003 0.004 3.63-5.383c0.244-0.358 0.65-0.59 1.111-0.59 0.339 0 0.649 0.126 0.885 0.334l-0.001-0.001c1.25 1.104 2.25 2.459 2.925 3.99l0.029 0.073c0.070 0.158 0.111 0.342 0.111 0.535 0 0.608-0.405 1.121-0.959 1.286l-0.009 0.002z"></path>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
    <path d="M21.3,9.7c-0.6,0-1.2,0.5-1.2,1.2c0,0.7,0.5,1.2,1.2,1.2c0.7,0,1.2-0.5,1.2-1.2C22.4,10.2,21.9,9.7,21.3,9.7z"/>
    <path d="M16,11.2c-2.7,0-4.9,2.2-4.9,4.9c0,2.7,2.2,4.9,4.9,4.9s4.9-2.2,4.9-4.9C21,13.4,18.8,11.2,16,11.2z M16,19.3c-1.7,0-3.2-1.4-3.2-3.2c0-1.7,1.4-3.2,3.2-3.2c1.7,0,3.2,1.4,3.2,3.2C19.2,17.9,17.8,19.3,16,19.3z"/>
    <path d="M20,6h-8c-3.3,0-6,2.7-6,6v8c0,3.3,2.7,6,6,6h8c3.3,0,6-2.7,6-6v-8C26,8.7,23.3,6,20,6z M24.1,20c0,2.3-1.9,4.1-4.1,4.1h-8c-2.3,0-4.1-1.9-4.1-4.1v-8c0-2.3,1.9-4.1,4.1-4.1h8c2.3,0,4.1,1.9,4.1,4.1V20z"/>
  </svg>
);

// Stable inline style for <main> so React doesn't allocate a fresh object on
// every render. The `max(...)` keeps a 1.5rem default on devices without
// safe-area insets (desktop, older phones).
const MAIN_PADDING: CSSProperties = {
  paddingTop: "max(1.5rem, env(safe-area-inset-top))",
  paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
  paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
  paddingRight: "max(1.5rem, env(safe-area-inset-right))",
};

// Instagram-style gradient — linear reads cleaner on circles than conic (no seams).
const INSTAGRAM_GRADIENT: CSSProperties = {
  background:
    "linear-gradient(220deg, #FFDC80 0%, #FCAF45 12%, #F77737 28%, #E1306C 52%, #C13584 72%, #833AB4 100%)",
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

  // TEAM_005: All three language versions are generated in a single call,
  // so this is always populated for every locale once a generation succeeds.
  const [reviews, setReviews] = useState<Record<Lang, string> | null>(null);
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const [refreshCount, setRefreshCount] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [redirectTarget, setRedirectTarget] = useState<'google' | 'yelp' | 'instagram'>('google');
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyDirection, setSurveyDirection] = useState<1 | -1>(1);

  // TEAM_001: Guard against duplicate API calls from double-taps.
  const isGenerating = useRef(false);

  // TEAM_001: Memoize survey questions so we don't allocate 18 new objects
  // every render — only recompute when the language changes.
  const surveyQuestions = useMemo(() => getSurveyQuestions(lang), [lang]);

  // Auto-rotate the placeholder suggestion every 4s.
  // TEAM_001: `lang` in deps so the interval resets on language switch.
  useEffect(() => {
    const id = setInterval(() => {
      setSuggestionIdx((i) => (i + 1) % t[lang].suggestions.length);
    }, 4000);
    // Clamp index immediately when lang changes in case arrays differ in length.
    setSuggestionIdx((i) => Math.min(i, t[lang].suggestions.length - 1));
    return () => clearInterval(id);
  }, [lang]);

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
    // TEAM_001: Prevent duplicate API calls from double-taps.
    if (isGenerating.current) return;
    isGenerating.current = true;
    setStep("generating");
    try {
      // TEAM_005: Single API call returns all three languages, so language
      // switching on the result screen is instant (no extra requests).
      const all = await generateAllReviews(results);
      setReviews(all);
      setStep("result");
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setStep("error");
    } finally {
      isGenerating.current = false;
    }
  };

  const handleRefresh = async () => {
    if (refreshCount >= MAX_REFRESH) return;
    // TEAM_001: Prevent duplicate API calls from double-taps.
    if (isGenerating.current) return;
    isGenerating.current = true;
    setStep("generating");
    try {
      const prevReview = reviews ? reviews[lang] : undefined;
      // TEAM_005: One call regenerates all three languages. We hand the
      // model the previous version *of the visible language* so it knows
      // what to vary against.
      const all = await generateAllReviews(results, prevReview || undefined);
      setReviews(all);
      setRefreshCount((prev) => prev + 1);
      setStep("result");
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setStep("error");
    } finally {
      isGenerating.current = false;
    }
  };

  // TEAM_005: Language switching is now synchronous — every supported
  // language is already cached in `reviews` after the initial generation.
  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
  };

  // TEAM_001: Await clipboard API with legacy fallback for HTTP origins or
  // browsers that deny clipboard permission.
  const copyToClipboard = async () => {
    const text = (reviews && reviews[lang]) ? reviews[lang] : "";
    try {
      await navigator.clipboard.writeText(text);
      setIsCopying(true);
    } catch {
      // Fallback: select a hidden textarea and use execCommand.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsCopying(true);
    }
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleRedirect = (target: 'google' | 'yelp' | 'instagram') => {
    setRedirectTarget(target);
    copyToClipboard();
    setShowRedirectModal(true);
  };

  const confirmRedirect = (target?: 'google' | 'yelp' | 'instagram') => {
    const finalTarget = target || redirectTarget;
    if (finalTarget === 'yelp') {
      window.open(
        "https://www.yelp.com/writeareview/biz/ZFXQV1KOIBrKjJiLRWUBIw?return_url=%2Fbiz%2FZFXQV1KOIBrKjJiLRWUBIw&review_origin=biz-details-war-button",
        "_blank",
      );
    } else if (finalTarget === 'instagram') {
      window.open(
        "https://www.instagram.com/chuanbistro/",
        "_blank",
      );
    } else {
      window.open(
        "https://reviewthis.biz/chuanbistro",
        "_blank",
      );
    }
    setShowRedirectModal(false);
  };

  return (
    <div className="relative min-h-[100dvh] text-[#111] font-sans selection:bg-[#DC2626] selection:text-white overflow-x-hidden w-full bg-[#FAF5ED]">
      
      {/* Background Video Layer - Small overextension to hide overscroll edge */}
      <AnimatePresence>
        {step === "welcome" && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 w-full z-0 pointer-events-none"
            style={{ 
              top: "-100px",
              height: "calc(55dvh + 100px)",
              maskImage: 'linear-gradient(to bottom, black calc(100% - 10dvh), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 10dvh), transparent 100%)'
            }}
          >
            <m.img
              src="/hero-bg.png"
              alt="Chuan Bistro"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
            <video
              ref={(el: HTMLVideoElement | null) => {
                if (el) el.play().catch(() => {});
              }}
              onPlaying={(e) => {
                (e.target as HTMLVideoElement).style.opacity = "1";
              }}
              src="https://chuanbistro.com/wp-content/themes/chuan-bistro/assets/Hero%20Video-C9Qrq4r7.mp4"
              autoPlay
              muted
              loop
              playsInline
              webkit-playsinline=""
              x5-video-player-type="h5-page"
              x5-playsinline=""
              x5-video-player-fullscreen="false"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: 0 }}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* Global Header */}
      <div 
        className="absolute top-0 inset-x-0 z-50 flex justify-between items-center px-6 sm:px-8 pointer-events-none"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
      >
        <AnimatePresence>
          {step === "welcome" && (
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-baseline gap-1.5 sm:gap-2 pointer-events-auto shrink-0"
            >
              <span className="font-serif font-extrabold text-white tracking-widest text-lg sm:text-2xl uppercase drop-shadow-md">Chuan Bistro</span>
              <span className="font-serif font-bold text-[#C5A254] text-base sm:text-xl tracking-wide drop-shadow-md">三杯叙</span>
            </m.div>
          )}
        </AnimatePresence>

        <div ref={langRef} className="relative pointer-events-auto ml-auto shrink-0" style={{ WebkitTapHighlightColor: "transparent" }}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1.5 pl-7 pr-5 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold text-[#111] shadow-md border border-white/40 outline-none cursor-pointer select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#111]" />
            {{en: "English", cn: "中文", es: "Español"}[lang]}
            <svg className={`ml-0.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} width="6" height="4" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Custom dropdown menu */}
          <AnimatePresence>
            {langOpen && (
              <>
                {/* Invisible backdrop to close menu on outside tap */}
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <m.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 z-50 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 overflow-hidden min-w-[100px]"
                >
                  {(["en", "cn", "es"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => { handleLanguageChange(l); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        lang === l ? "bg-[#111] text-white" : "text-[#111] hover:bg-black/5 active:bg-black/10"
                      }`}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                      {{en: "English", cn: "中文", es: "Español"}[l]}
                    </button>
                  ))}
                </m.div>
              </>
            )}
          </AnimatePresence>
        </div>
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
              <div className="relative h-[45dvh] sm:h-[55dvh] w-full pt-20 px-6 pb-2 mt-4 shrink-0 z-10 pointer-events-none" />

              <div className="px-6 sm:px-8 py-4 sm:py-8 flex-1 flex flex-col justify-end pb-6 sm:pb-12 z-10 relative">
                <m.h1 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-[clamp(2rem,8vw,3rem)] min-[400px]:text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] text-[#111]"
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
                {surveyQuestions.map((q, idx) => {
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
                    const question = surveyQuestions[surveyIndex];
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
              className="flex-1 flex flex-col justify-center items-center text-center px-6 py-8 overflow-y-auto"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mb-6 sm:mb-8 shadow-inner shrink-0">
                <span className="text-red-500 text-3xl sm:text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight">{t[lang].errorTitle}</h2>
              <p className="text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                {t[lang].errorSub}
              </p>
              
              <div className="w-full space-y-4 max-w-md mx-auto">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-[#111] text-white py-4 rounded-[1.25rem] font-bold text-lg hover:bg-[#333] transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  {t[lang].tryAgain}
                </button>
                
                <div className="w-full space-y-2">
                  <p className="text-sm font-medium text-[#777] uppercase tracking-wider mt-4">{t[lang].skipBtn}</p>
                  <div className="flex items-center justify-center gap-5 sm:gap-6">
                    <button
                      onClick={() => confirmRedirect('google')}
                      aria-label="Google"
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg"
                    >
                      <GoogleIcon className="w-8 h-8" />
                    </button>
                    <button
                      onClick={() => confirmRedirect('yelp')}
                      aria-label="Yelp"
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[#E00707] rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg"
                    >
                      <YelpIcon className="w-8 h-8 text-white" />
                    </button>
                    <button
                      onClick={() => confirmRedirect('instagram')}
                      aria-label="Instagram"
                      style={INSTAGRAM_GRADIENT}
                      className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg"
                    >
                      <InstagramIcon className="w-10 h-10 sm:w-11 sm:h-11 text-white shrink-0" />
                    </button>
                  </div>
                </div>
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
                  value={(reviews && reviews[lang]) || ""}
                  onChange={(e) => {
                    if (reviews) {
                      setReviews({ ...reviews, [lang]: e.target.value });
                    }
                  }}
                  className="flex-1 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] shadow-sm leading-relaxed text-[#111] text-lg sm:text-xl min-h-[160px] sm:min-h-[200px] outline-none focus:border-[#111] transition-all duration-300 resize-none w-full block scrollbar-hide focus:shadow-md"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-md border hover:border-[#111] hover:bg-[#111] hover:text-white transition-all active:scale-95 text-[#555] disabled:opacity-50 disabled:pointer-events-none"
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

                <div className="w-full pt-2 mt-auto flex items-center justify-center gap-5 sm:gap-6">
                  <button
                    onClick={() => handleRedirect('google')}
                    aria-label="Google"
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg"
                  >
                    <GoogleIcon className="w-8 h-8" />
                  </button>
                  <button
                    onClick={() => handleRedirect('yelp')}
                    aria-label="Yelp"
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[#E00707] rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg"
                  >
                    <YelpIcon className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={() => handleRedirect('instagram')}
                    aria-label="Instagram"
                    style={INSTAGRAM_GRADIENT}
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg"
                  >
                    <InstagramIcon className="w-10 h-10 sm:w-11 sm:h-11 text-white shrink-0" />
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <p className="mt-auto pt-4 pb-0 text-center text-[10px] sm:text-[11px] font-medium tracking-wide text-[#111]/35 select-none">
          Powered by Ezrefill
        </p>
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
                  {redirectTarget === 'google'
                    ? (t[lang] as any).modalSubGoogle
                    : redirectTarget === 'yelp'
                      ? (t[lang] as any).modalSubYelp
                      : (t[lang] as any).modalSubInstagram}
                </p>
              </div>
              <button
                onClick={() => confirmRedirect()}
                style={redirectTarget === 'instagram' ? INSTAGRAM_GRADIENT : undefined}
                className={`w-full text-white py-4 rounded-full font-medium ${
                  redirectTarget === 'yelp'
                    ? 'bg-[#E00707]'
                    : redirectTarget === 'instagram'
                      ? ''
                      : 'bg-[#1A1A1A]'
                }`}
              >
                {redirectTarget === 'google'
                  ? (t[lang] as any).modalGoGoogle
                  : redirectTarget === 'yelp'
                    ? (t[lang] as any).modalGoYelp
                    : (t[lang] as any).modalGoInstagram}
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
