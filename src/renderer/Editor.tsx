// A plain-text writing area. The textarea owns its own text: React doesn't
// store or re-render on keystrokes, and nothing is saved.
export default function Editor() {
  return (
    <main className="editor">
      <textarea aria-label="Writing" autoFocus />
    </main>
  );
}
