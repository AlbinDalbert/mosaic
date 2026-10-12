import { PixelBitmap, PixelText } from './pixel/Pixels';
import { CLOSE, LOGO, MAXIMIZE, MINIMIZE } from './pixel/icons';
import { THEMES, type Theme } from './theme';

interface TitleBarProps {
  theme: Theme;
  onThemeChange(theme: Theme): void;
}

export default function TitleBar({ theme, onThemeChange }: TitleBarProps) {
  return (
    <header className="title-bar">
      <span className="window-title">
        <PixelBitmap bitmap={LOGO} scale={2} />
        <PixelText text="Mosaic" scale={2} />
      </span>
      <div className="title-rule dither" />
      <div className="theme-switch" role="group" aria-label="Color theme">
        {THEMES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === theme}
            onClick={() => onThemeChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="window-controls">
        <button
          type="button"
          aria-label="Minimize window"
          title="Minimize window"
          onClick={() => window.mosaicWindow.minimize()}
        >
          <PixelBitmap bitmap={MINIMIZE} scale={2} />
        </button>
        <button
          type="button"
          aria-label="Maximize or restore window"
          title="Maximize or restore window"
          onClick={() => window.mosaicWindow.toggleMaximize()}
        >
          <PixelBitmap bitmap={MAXIMIZE} scale={2} />
        </button>
        <button
          type="button"
          className="close-window"
          aria-label="Close window"
          title="Close window"
          onClick={() => window.mosaicWindow.close()}
        >
          <PixelBitmap bitmap={CLOSE} scale={2} />
        </button>
      </div>
    </header>
  );
}
