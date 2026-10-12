import { bitmapPath, bitmapWidth, textBitmap, type Bitmap } from './bitmap';

interface PixelBitmapProps {
  bitmap: Bitmap;
  // Screen pixels per bitmap pixel. Whole numbers keep edges sharp.
  scale: number;
  // Accessible name. Without one, the drawing is hidden from assistive technology.
  label?: string;
}

// Draws a bitmap in the current text color.
export function PixelBitmap({ bitmap, scale, label }: PixelBitmapProps) {
  const width = bitmapWidth(bitmap);
  const height = bitmap.length;

  return (
    <svg
      className="pixels"
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={bitmapPath(bitmap)} fill="currentColor" />
    </svg>
  );
}

export function PixelText({ text, scale }: { text: string; scale: number }) {
  return <PixelBitmap bitmap={textBitmap(text)} scale={scale} label={text} />;
}
