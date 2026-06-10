'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme } from '../lib/types';
import { themes } from '../lib/themes';

type FontId = 'grandstander' | 'vt323';

const FONTS: Record<FontId, { name: string; cssVar: string }> = {
  grandstander: { name: 'Grandstander', cssVar: 'var(--font-grandstander)' },
  vt323: { name: 'VT323 (Pixel)', cssVar: 'var(--font-vt323)' },
};

interface ThemeContextValue {
  theme: Theme;
  themeId: string;
  setTheme: (id: string) => void;
  fontId: FontId;
  setFont: (id: FontId) => void;
  fontOptions: { id: FontId; name: string }[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'rac-thai-xanh-ai-theme';
const FONT_STORAGE_KEY = 'rac-thai-xanh-ai-font';
const DEFAULT_THEME = 'sky-coral';
const DEFAULT_FONT: FontId = 'grandstander';

function applyThemeVars(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--bg-warm', theme.bgWarm);
  root.style.setProperty('--bg-card', theme.bgCard);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-light', theme.textLight);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-light', theme.accentLight);
  root.style.setProperty('--hud-gradient-from', theme.hudGradientFrom);
  root.style.setProperty('--hud-gradient-to', theme.hudGradientTo);
  root.style.setProperty('--hud-border', theme.hudBorder);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--border-dark', theme.borderDark);
}

function applyFont(fontId: FontId) {
  const font = FONTS[fontId];
  document.documentElement.style.setProperty('--active-font', font.cssVar);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);
  const [fontId, setFontId] = useState<FontId>(DEFAULT_FONT);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && themes[savedTheme]) {
      setThemeId(savedTheme);
      applyThemeVars(themes[savedTheme]);
    } else {
      applyThemeVars(themes[DEFAULT_THEME]);
    }

    const savedFont = localStorage.getItem(FONT_STORAGE_KEY) as FontId | null;
    if (savedFont && FONTS[savedFont]) {
      setFontId(savedFont);
      applyFont(savedFont);
    } else {
      applyFont(DEFAULT_FONT);
    }
  }, []);

  const setTheme = (id: string) => {
    if (!themes[id]) return;
    setThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    applyThemeVars(themes[id]);
  };

  const setFont = (id: FontId) => {
    if (!FONTS[id]) return;
    setFontId(id);
    localStorage.setItem(FONT_STORAGE_KEY, id);
    applyFont(id);
  };

  const fontOptions = Object.entries(FONTS).map(([id, f]) => ({ id: id as FontId, name: f.name }));

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setTheme, fontId, setFont, fontOptions }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
