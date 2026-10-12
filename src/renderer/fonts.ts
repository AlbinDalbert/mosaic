// Each entry's `weight` and `tracking` (letter spacing) apply whenever that
// font is chosen. Change the numbers here to tune a font.
export const FONTS = [
  { id: 'jetbrains-mono', label: 'JetBrains Mono', variable: '--font-jetbrains-mono', weight: 400, tracking: '0.02em' },
  { id: 'courier-prime', label: 'Courier Prime', variable: '--font-courier-prime', weight: 400, tracking: '0.02em' },
  { id: 'exo-2', label: 'Exo 2', variable: '--font-exo-2', weight: 500, tracking: '0.05em' },
] as const;

export type FontId = (typeof FONTS)[number]['id'];

const STORAGE_KEY = 'mosaic.font';

export function loadFont(): FontId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return FONTS.find((font) => font.id === stored)?.id ?? 'jetbrains-mono';
}

// Points --font-mono at the chosen family, and sets the weight and tracking
// that go with it. Every component reads these variables, so changing them
// here changes the whole interface.
export function applyFont(id: FontId): void {
  const font = FONTS.find((candidate) => candidate.id === id)!;
  const style = document.documentElement.style;
  style.setProperty('--font-mono', `var(${font.variable})`);
  style.setProperty('--font-weight', String(font.weight));
  style.setProperty('--font-tracking', font.tracking);
  localStorage.setItem(STORAGE_KEY, id);
}
