export const THEMES = ['amber', 'green'] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'mosaic.theme';

export function loadTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return THEMES.find((theme) => theme === stored) ?? 'amber';
}

// theme.css selects its palette from this attribute on the root element.
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}
