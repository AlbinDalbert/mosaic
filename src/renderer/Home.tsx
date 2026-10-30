import { PixelBitmap, PixelText } from './pixel/Pixels';
import { LOGO } from './pixel/icons';

// Shown while no project is open.
interface HomeProps {
  onWrite(): void;
  onOpenFolder(): void;
}

export default function Home({ onWrite, onOpenFolder }: HomeProps) {
  return (
    <main className="home">
      <div className="home-title">
        <PixelBitmap bitmap={LOGO} scale={9} />
        <div className="home-name">
          <h1>
            <PixelText text="Mosaic" scale={8} />
          </h1>
          <p>
            <PixelText text="Implicit linking, just write" scale={2} />
          </p>
        </div>
      </div>
      <div className="home-actions">
        <button type="button" className="home-write" onClick={onWrite}>
          Write
        </button>
        <button type="button" className="home-write" onClick={onOpenFolder}>
          Open folder
        </button>
      </div>
    </main>
  );
}
