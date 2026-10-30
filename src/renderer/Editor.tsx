// A plain-text writing area. The textarea owns its own text: React doesn't
// store or re-render on keystrokes, and nothing is saved. A document read
// from disk is shown read-only until saving exists.
export default function Editor({ text }: { text?: string }) {
  return (
    <main className="editor">
      <textarea
        aria-label="Writing"
        autoFocus
        defaultValue={text}
        readOnly={text !== undefined}
      />
    </main>
  );
}
