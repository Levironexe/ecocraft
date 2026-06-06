'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme } from '../lib/types';
import { themes } from '../lib/themes';

interface ThemeContextValue {
  theme: Theme;
  themeId: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'ecocraft-theme';
const DEFAULT_THEME = 'sky-coral';

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes[saved]) {
      setThemeId(saved);
      applyThemeVars(themes[saved]);
    } else {
      applyThemeVars(themes[DEFAULT_THEME]);
    }
  }, []);

  const setTheme = (id: string) => {
    if (!themes[id]) return;
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyThemeVars(themes[id]);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
