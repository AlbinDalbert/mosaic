import type { Ref } from 'react';

interface EditorProps {
  text?: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
  onInput?(): void;
}

// A plain-text writing area. The textarea owns its own text: React doesn't
// store it or re-render on keystrokes.
export default function Editor({ text, textareaRef, onInput }: EditorProps) {
  return (
    <main className="editor">
      <textarea
        ref={textareaRef}
        aria-label="Writing"
        autoFocus
        defaultValue={text}
        onInput={onInput}
      />
    </main>
  );
}
