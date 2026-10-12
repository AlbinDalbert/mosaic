import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bitmapPath, GLYPH_HEIGHT, GLYPH_WIDTH, GLYPHS, textBitmap } from './bitmap.ts';

test('every glyph is a complete 5×7 grid', () => {
  for (const [char, glyph] of Object.entries(GLYPHS)) {
    const rows = glyph.split('|');
    assert.equal(rows.length, GLYPH_HEIGHT, `glyph ${char}`);
    for (const row of rows) {
      assert.match(row, new RegExp(`^[#.]{${GLYPH_WIDTH}}$`), `glyph ${char}`);
    }
  }
});

test('text is drawn as uppercase glyphs separated by one column', () => {
  const bitmap = textBitmap('hi');
  assert.equal(bitmap.length, GLYPH_HEIGHT);
  assert.equal(bitmap[0], '#...#..###.');
  assert.deepEqual(bitmap, textBitmap('HI'));
});

test('unsupported characters are drawn as a question mark', () => {
  assert.deepEqual(textBitmap('é'), textBitmap('?'));
});

test('each horizontal run of lit pixels becomes one rectangle', () => {
  assert.equal(bitmapPath(['##.#', '....']), 'M0 0h2v1h-2zM3 0h1v1h-1z');
});
