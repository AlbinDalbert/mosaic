import { useEffect, useRef, type RefObject } from 'react';
import { createAutosave, type Autosave, type SaveStatus } from './autosave';
import Editor from './Editor';

interface DocumentEditorProps {
  path: string;
  text: string;
  onStatus(status: SaveStatus): void;
  // Set to the shown document's autosave, so App can save before switching
  // documents or closing.
  current: RefObject<Autosave | null>;
}

// Shows a document from the opened folder and saves it a moment after typing
// stops. App keys this component by path, so each document gets its own.
export default function DocumentEditor({ path, text, onStatus, current }: DocumentEditorProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const autosave = useRef<Autosave | null>(null);

  useEffect(() => {
    // The autosave keeps this document's textarea, so a save that runs after
    // another document is shown still saves this document's text.
    const element = textarea.current!;
    const session = createAutosave({
      read: () => element.value,
      save: (value) => window.mosaicProject.saveDocument(path, value),
      onStatus: (status) => {
        if (current.current === session) {
          onStatus(status);
        }
      },
    });
    autosave.current = session;
    current.current = session;

    return () => {
      if (current.current === session) {
        current.current = null;
      }
      session.flush().catch((error: Error) => alert(error.message));
    };
  }, [path, onStatus, current]);

  return <Editor text={text} textareaRef={textarea} onInput={() => autosave.current?.changed()} />;
}
