"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

// ----------------------------------------------------------------------
// Constants & Types
// ----------------------------------------------------------------------

const DEFAULT_SKIP_SELECTORS =
  "script, style, code, pre, kbd, samp, var, svg, math, [data-i18n-skip], [contenteditable], input, textarea, select";

const LOCALE_LABELS: Record<string, string> = {
  // Top Tier
  en: "🇺🇸 English",
  es: "🇪🇸 Español",
  fr: "🇫🇷 Français",
  de: "🇩🇪 Deutsch",
  it: "🇮🇹 Italiano",
  pt: "🇧🇷 Português",
  ja: "🇯🇵 日本語",
  ko: "🇰🇷 한국어",
  zh: "🇨🇳 中文",
  ar: "🇸🇦 العربية",
  hi: "🇮🇳 हिन्दी",
  ru: "🇷🇺 Русский",

  // Western Europe & Nordics
  nl: "🇳🇱 Nederlands",
  sv: "🇸🇪 Svenska",
  da: "🇩🇰 Dansk",
  fi: "🇫🇮 Suomi",
  nb: "🇳🇴 Norsk",
  is: "🇮🇸 Íslenska",
  ga: "🇮🇪 Gaeilge",
  cy: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Cymraeg",
  gl: "🇪🇸 Galego",
  eu: "🇪🇸 Euskara",
  ca: "🇪🇸 Català",

  // Eastern Europe & Balkans
  pl: "🇵🇱 Polski",
  cs: "🇨🇿 Čeština",
  sk: "🇸🇰 Slovenčina",
  hu: "🇭🇺 Magyar",
  ro: "🇷🇴 Română",
  bg: "🇧🇬 Български",
  sr: "🇷🇸 Српски",
  hr: "🇭🇷 Hrvatski",
  bs: "🇧🇦 Bosanski",
  sl: "🇸🇮 Slovenščina",
  el: "🇬🇷 Ελληνικά",
  tr: "🇹🇷 Türkçe",
  uk: "🇺🇦 Українська",
  be: "🇧🇾 Беларуская",
  mk: "🇲🇰 Македонски",
  sq: "🇦🇱 Shqip",

  // Asia Pacific
  th: "🇹🇭 ไทย",
  vi: "🇻🇳 Tiếng Việt",
  id: "🇮🇩 Bahasa Indonesia",
  ms: "🇲🇾 Bahasa Melayu",
  tl: "🇵🇭 Tagalog",
  km: "🇰🇭 ខ្មែរ",
  lo: "🇱🇦 ລາວ",
  my: "🇲🇲 မြန်မာ",
  mn: "🇲🇳 Монгол",

  // South Asia
  bn: "🇧🇩 বাংলা",
  ta: "🇮🇳 தமிழ்",
  te: "🇮🇳 తెలుగు",
  mr: "🇮🇳 मराठी",
  gu: "🇮🇳 ગુજરાતી",
  kn: "🇮🇳 ಕನ್ನಡ",
  ml: "🇮🇳 മലയാളം",
  pa: "🇮🇳 ਪੰਜਾਬੀ",
  ur: "🇵🇰 اردو",
  si: "🇱🇰 සිංහල",
  ne: "🇳🇵 नेपाली",
  "zh-TW": "🇹🇼 繁體中文",
  "zh-CN": "🇨🇳 简体中文",

  // Middle East & Central Asia
  he: "🇮🇱 עברית",
  fa: "🇮🇷 فارسی",
  ps: "🇦🇫 پښتو",
  ku: "🇮🇶 Kurdî",
  az: "🇦🇿 Azərbaycan",
  ka: "🇬🇪 ქართული",
  hy: "🇦🇲 Հայերեն",
  uz: "🇺🇿 Oʻzbek",
  kk: "🇰🇿 Қазақ",
  ky: "🇰🇬 Кыргыз",
  tg: "🇹🇯 Тоҷикӣ",
  tk: "🇹🇲 Türkmen",

  // Africa
  sw: "🇰🇪 Kiswahili",
  am: "🇪🇹 አማርኛ",
  yo: "🇳🇬 Yorùbá",
  ig: "🇳🇬 Igbo",
  ha: "🇳🇬 Hausa",
  zu: "🇿🇦 isiZulu",
  xh: "🇿🇦 isiXhosa",
  af: "🇿🇦 Afrikaans",
  sn: "🇿🇼 chiShona",
  mg: "🇲🇬 Malagasy",
  so: "🇸🇴 Soomaali",

  // Baltics
  et: "🇪🇪 Eesti",
  lv: "🇱🇻 Latviešu",
  lt: "🇱🇹 Lietuvių",

  // Other Global
  mt: "🇲🇹 Malti",
  eo: "🌍 Esperanto",
  la: "🏛️ Latina",
};

/** Pre-built array of all supported language codes. Pass this to `availableLocales` to enable all languages. */
export const ALL_LOCALES: string[] = Object.keys(LOCALE_LABELS);

export interface AutoTranslateProviderProps {
  /** Lingo.dev API key (ignored if fetchAction is provided) */
  apiKey?: string;
  /** The locale the site is originally written in (default: 'en') */
  sourceLocale?: string;
  /** The preferred locale to translate into on load */
  targetLocale?: string;
  /** List of allowed locales, or "all" to allow all supported locales */
  availableLocales?: string[] | "all";
  /** Delay in ms to batch text node changes (default: 150) */
  batchDelayMs?: number;
  /** CSS selectors to ignore during translation */
  skipSelectors?: string;
  /** Whether to show the floating language switcher (default: true) */
  showSwitcher?: boolean;
  /** Callback when locale changes */
  onLocaleChange?: (locale: string) => void;
  /** The path to your Next.js API route that proxies the Lingo.dev API. (e.g. '/api/universal-i18n') */
  apiRoute?: string;
  /** Custom fetcher (e.g. Next.js Server Action) to proxy translations securely */
  fetchAction?: (
    texts: Record<string, string>,
    source: string,
    target: string,
  ) => Promise<Record<string, string>>;
  children: ReactNode;
}

interface AutoTranslateContextValue {
  locale: string;
  sourceLocale: string;
  setLocale: (locale: string) => void;
  availableLocales: string[];
  isTranslating: boolean;
}

const AutoTranslateContext = createContext<AutoTranslateContextValue>({
  locale: "en",
  sourceLocale: "en",
  setLocale: () => {},
  availableLocales: ["en"],
  isTranslating: false,
});

export function useAutoTranslate() {
  return useContext(AutoTranslateContext);
}

// ----------------------------------------------------------------------
// Core DOM Engine
// ----------------------------------------------------------------------

class DOMTranslationEngine {
  private cache: Record<string, string> = {};
  private pendingTexts: Map<string, Array<(val: string) => void>> = new Map();
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private apiKey: string,
    private sourceLocale: string,
    private targetLocale: string,
    private batchDelayMs: number,
    private apiRoute?: string,
    private fetchAction?: AutoTranslateProviderProps["fetchAction"],
  ) {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(
        `ui18n-cache-${this.sourceLocale}-${this.targetLocale}`,
      );
      if (saved) {
        this.cache = JSON.parse(saved);
      }
    } catch {}
  }

  private saveCacheToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `ui18n-cache-${this.sourceLocale}-${this.targetLocale}`,
        JSON.stringify(this.cache),
      );
    } catch {}
  }

  private getCacheKey(text: string) {
    return text.trim();
  }

  public getCachedTranslation(text: string): string | null {
    const key = this.getCacheKey(text);
    return this.cache[key] ?? null;
  }

  public async translate(text: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return text;

    const cached = this.cache[this.getCacheKey(trimmed)];
    if (cached) return cached;

    return new Promise((resolve) => {
      const existing = this.pendingTexts.get(trimmed);
      if (existing) {
        existing.push(resolve);
      } else {
        this.pendingTexts.set(trimmed, [resolve]);
      }

      if (!this.batchTimer) {
        this.batchTimer = setTimeout(
          () => this.flushBatch(),
          this.batchDelayMs,
        );
      }
    });
  }

  private async flushBatch() {
    this.batchTimer = null;
    const batch = new Map(this.pendingTexts);
    this.pendingTexts.clear();

    if (batch.size === 0) return;
    const texts = Array.from(batch.keys());

    try {
      const inputObj: Record<string, string> = {};
      texts.forEach((text, i) => {
        inputObj[`k${i}`] = text;
      });

      let translated: Record<string, string> = {};

      if (this.fetchAction) {
        translated = await this.fetchAction(
          inputObj,
          this.sourceLocale,
          this.targetLocale,
        );
      } else if (
        this.apiRoute ||
        (!this.apiKey && typeof window !== "undefined")
      ) {
        // Fallback to Next.js API route if no API key is provided and we are in a browser
        const route = this.apiRoute || "/api/universal-i18n";
        const response = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts: inputObj,
            source: this.sourceLocale,
            target: this.targetLocale,
          }),
        });

        if (!response.ok) {
          throw new Error(`Proxy API error: ${response.status}`);
        }
        translated = await response.json();
      } else {
        const endpoint = "https://engine.lingo.dev/i18n";
        const headers: Record<string, string> = {
          "Content-Type": "application/json; charset=utf-8",
        };
        if (this.apiKey) {
          headers["Authorization"] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            params: { workflowId: Math.random().toString(36).substring(7) },
            locale: { source: this.sourceLocale, target: this.targetLocale },
            data: inputObj,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.error && !responseData.data) {
          throw new Error(responseData.error);
        }
        translated = responseData.data || {};
      }

      texts.forEach((originalText, i) => {
        const translatedText = translated[`k${i}`] || originalText;
        this.cache[this.getCacheKey(originalText)] = translatedText;

        const resolvers = batch.get(originalText);
        if (resolvers) {
          resolvers.forEach((resolve) => resolve(translatedText));
        }
      });

      this.saveCacheToStorage();
    } catch (error) {
      console.error("[universal-i18n] Batch failed:", error);
      // Revert all promises
      for (const [originalText, resolvers] of Array.from(batch.entries())) {
        resolvers.forEach((resolve) => resolve(originalText));
      }
    }
  }

  public clearCache() {
    this.cache = {};
    if (typeof window !== "undefined") {
      localStorage.removeItem(
        `ui18n-cache-${this.sourceLocale}-${this.targetLocale}`,
      );
    }
  }
}

// ----------------------------------------------------------------------
// DOM Utilities
// ----------------------------------------------------------------------

function getTextNodes(root: HTMLElement, skipSelector: string): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent || !node.textContent.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      if (node.textContent.trim().length < 2) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(skipSelector)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.hasAttribute("data-i18n-translated")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }
  return textNodes;
}

// ----------------------------------------------------------------------
// Provider Component
// ----------------------------------------------------------------------

export function AutoTranslateProvider({
  apiKey,
  sourceLocale = "en",
  targetLocale: initialTargetLocale,
  availableLocales = ["en"],
  batchDelayMs = 150,
  skipSelectors = DEFAULT_SKIP_SELECTORS,
  showSwitcher = true,
  onLocaleChange,
  apiRoute,
  fetchAction,
  children,
}: AutoTranslateProviderProps) {
  const resolvedLocales =
    availableLocales === "all"
      ? Object.keys(LOCALE_LABELS)
      : availableLocales || ["en"];

  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ui18n-auto-locale");
      if (saved && resolvedLocales.includes(saved)) return saved;
    }
    if (!initialTargetLocale && typeof navigator !== "undefined") {
      const browserLang = navigator.language?.split("-")[0];
      if (
        browserLang &&
        browserLang !== sourceLocale &&
        resolvedLocales.includes(browserLang)
      ) {
        return browserLang;
      }
    }
    return initialTargetLocale || sourceLocale;
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const engineRef = useRef<DOMTranslationEngine | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalTextsRef = useRef<Map<Node, string>>(new Map());

  const resolvedApiKey = apiKey || "";

  // Initialize Engine
  useEffect(() => {
    if (locale === sourceLocale) {
      engineRef.current = null;
      return;
    }

    engineRef.current = new DOMTranslationEngine(
      resolvedApiKey,
      sourceLocale,
      locale,
      batchDelayMs,
      apiRoute,
      fetchAction,
    );
  }, [
    locale,
    sourceLocale,
    resolvedApiKey,
    batchDelayMs,
    apiRoute,
    fetchAction,
  ]);

  const translateDOM = useCallback(async () => {
    const engine = engineRef.current;
    const container = containerRef.current;
    if (!engine || !container || locale === sourceLocale) return;

    setIsTranslating(true);

    try {
      const textNodes = getTextNodes(container, skipSelectors);
      if (textNodes.length === 0) {
        setIsTranslating(false);
        return;
      }

      const toTranslate: Array<{ node: Text; text: string }> = [];

      for (const node of textNodes) {
        const originalText = node.textContent || "";
        if (!originalTextsRef.current.has(node)) {
          originalTextsRef.current.set(node, originalText);
        }

        const cached = engine.getCachedTranslation(originalText.trim());
        if (cached) {
          node.textContent = originalText.replace(originalText.trim(), cached);
          const parent = node.parentElement;
          if (parent) parent.setAttribute("data-i18n-translated", "true");
        } else {
          toTranslate.push({ node, text: originalText });
        }
      }

      if (toTranslate.length > 0) {
        const translations = await Promise.all(
          toTranslate.map(({ text }) => engine.translate(text)),
        );

        translations.forEach((translated, i) => {
          const { node, text: originalText } = toTranslate[i];
          if (node.parentElement) {
            node.textContent = originalText.replace(
              originalText.trim(),
              translated,
            );
            node.parentElement.setAttribute("data-i18n-translated", "true");
          }
        });
      }
    } catch (error) {
      console.error("[universal-i18n] DOM translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  }, [locale, sourceLocale, skipSelectors]);

  const revertDOM = useCallback(() => {
    for (const [node, originalText] of Array.from(
      originalTextsRef.current.entries(),
    )) {
      if (node.parentElement) {
        node.textContent = originalText;
        (node.parentElement as HTMLElement).removeAttribute(
          "data-i18n-translated",
        );
      }
    }
    originalTextsRef.current.clear();
  }, []);

  // Observer Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timer = setTimeout(() => translateDOM(), 100);

    observerRef.current = new MutationObserver((mutations) => {
      let hasNewText = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (
              node.nodeType === Node.ELEMENT_NODE ||
              node.nodeType === Node.TEXT_NODE
            ) {
              hasNewText = true;
              break;
            }
          }
        }
        if (hasNewText) break;
      }
      if (hasNewText) {
        setTimeout(() => translateDOM(), 200);
      }
    });

    observerRef.current.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [translateDOM]);

  // Handle Locale Changes
  const setLocale = useCallback(
    (newLocale: string) => {
      revertDOM();
      setLocaleState(newLocale);
      if (typeof window !== "undefined") {
        localStorage.setItem("ui18n-auto-locale", newLocale);
      }
      onLocaleChange?.(newLocale);
    },
    [revertDOM, onLocaleChange],
  );

  // Initial Translation trigger
  useEffect(() => {
    if (locale !== sourceLocale) {
      const timer = setTimeout(() => translateDOM(), 150);
      return () => clearTimeout(timer);
    }
  }, [locale, sourceLocale, translateDOM]);

  const contextValue = {
    locale,
    sourceLocale,
    setLocale,
    availableLocales: resolvedLocales,
    isTranslating,
  };

  return (
    <AutoTranslateContext.Provider value={contextValue}>
      <div ref={containerRef} data-i18n-root="true">
        {children}
      </div>
      {showSwitcher && resolvedLocales.length > 1 && (
        <FloatingLanguageSwitcher />
      )}
      {isTranslating && <TranslatingIndicator />}
    </AutoTranslateContext.Provider>
  );
}

// ----------------------------------------------------------------------
// UI Components
// ----------------------------------------------------------------------

function FloatingLanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useAutoTranslate();
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            right: "0",
            background: "white",
            borderRadius: "16px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
            padding: "8px",
            minWidth: "180px",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {availableLocales.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: l === locale ? "#EEF2FF" : "transparent",
                borderRadius: "10px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: l === locale ? "700" : "400",
                color: l === locale ? "#4F46E5" : "#374151",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (l !== locale)
                  (e.target as HTMLElement).style.background = "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                if (l !== locale)
                  (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {LOCALE_LABELS[l] || l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "white",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow:
            "0 8px 32px rgba(99,102,241,0.4), 0 0 0 4px rgba(99,102,241,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.transform = "scale(1)";
        }}
        title={`Current language: ${LOCALE_LABELS[locale] || locale}`}
      >
        🌐
      </button>
    </div>
  );
}

function TranslatingIndicator() {
  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        color: "white",
        padding: "8px 20px",
        borderRadius: "100px",
        fontSize: "13px",
        fontWeight: "600",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "ui18n-pulse 1.5s ease-in-out infinite",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "white",
          animation: "ui18n-dot 1s ease-in-out infinite",
        }}
      />
      Translating...
      <style>{`
        @keyframes ui18n-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes ui18n-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
