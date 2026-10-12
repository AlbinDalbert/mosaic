import { PixelBitmap, PixelText } from './pixel/Pixels';
import { LOGO } from './pixel/icons';

// Shown while no project is open.
export default function Home({ onWrite }: { onWrite(): void }) {
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
      <button type="button" className="home-write" onClick={onWrite}>
        Write
      </button>
    </main>
  );
}
