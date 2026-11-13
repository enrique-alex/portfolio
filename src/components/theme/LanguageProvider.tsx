'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const FALLBACK_CONTEXT: LanguageContextType = {
  locale: 'fr',
  setLocale: () => {},
  t: (key: string) => translations.fr[key] || key,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const stored = localStorage.getItem('portfolio-locale') as Locale | null;
    if (stored && (stored === 'fr' || stored === 'en')) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    } else if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
      setLocaleState(browserLang);
      document.documentElement.lang = browserLang;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('portfolio-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useOptionalLanguage(): LanguageContextType {
  return useContext(LanguageContext) ?? FALLBACK_CONTEXT;
}
