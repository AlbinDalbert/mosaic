export default function TitleBar() {
  return (
    <header className="title-bar">
      <span className="window-title"><b>Mosaic</b></span>
      <div className="window-controls">
        <button
          type="button"
          aria-label="Minimize window"
          title="Minimize window"
          onClick={() => window.mosaicWindow.minimize()}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8h10" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Maximize or restore window"
          title="Maximize or restore window"
          onClick={() => window.mosaicWindow.toggleMaximize()}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3" y="3" width="10" height="10" />
          </svg>
        </button>
        <button
          type="button"
          className="close-window"
          aria-label="Close window"
          title="Close window"
          onClick={() => window.mosaicWindow.close()}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" />
          </svg>
        </button>
      </div>
    </header>
  );
}
