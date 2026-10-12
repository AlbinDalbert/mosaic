import { PixelBitmap, PixelText } from './pixel/Pixels';
import { LOGO } from './pixel/icons';

// Shown while no project is open.
export default function Home() {
  return (
    <main className="home">
      <PixelBitmap bitmap={LOGO} scale={9} />
      <div className="home-name">
        <h1>
          <PixelText text="Mosaic" scale={8} />
        </h1>
        <p>
          <PixelText text="Implicit linking, just write" scale={2} />
        </p>
      </div>
    </main>
  );
}
