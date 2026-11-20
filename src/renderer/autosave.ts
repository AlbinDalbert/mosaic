export type SaveStatus =
  | { state: 'saved' }
  | { state: 'unsaved' }
  | { state: 'failed'; reason: string };

interface AutosaveOptions {
  read(): string;
  save(text: string): Promise<void>;
  onStatus(status: SaveStatus): void;
  delay?: number;
}

export interface Autosave {
  changed(): void;
  flush(): Promise<void>;
  discard(): void;
}

// Saves one document a moment after typing stops. A keystroke only counts a
// revision and restarts the timer; the text is read and handed to `save`
// when the timer fires. One save runs at a time, and a revision made while
// it runs stays unsaved until the next one. Status is reported only when it
// changes, so typing never causes a re-render.
export function createAutosave({ read, save, onStatus, delay = 1000 }: AutosaveOptions): Autosave {
  let revision = 0;
  let savedRevision = 0;
  let state: SaveStatus['state'] = 'saved';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | null = null;

  function report(status: SaveStatus) {
    if (status.state !== state || status.state === 'failed') {
      state = status.state;
      onStatus(status);
    }
  }

  function changed() {
    revision += 1;
    report({ state: 'unsaved' });
    clearTimeout(timer);
    timer = setTimeout(() => flush().catch(() => {}), delay);
  }

  // Saves until the latest revision is on disk. Rejects if a save fails,
  // leaving the document unsaved.
  async function flush(): Promise<void> {
    clearTimeout(timer);
    while (savedRevision !== revision) {
      if (running) {
        await running;
        continue;
      }
      const captured = revision;
      running = save(read());
      try {
        await running;
        savedRevision = captured;
      } catch (error) {
        report({ state: 'failed', reason: error instanceof Error ? error.message : String(error) });
        throw error;
      } finally {
        running = null;
      }
    }
    report({ state: 'saved' });
  }

  // Forgets unsaved revisions, when the writer chooses to leave them.
  function discard() {
    clearTimeout(timer);
    savedRevision = revision;
  }

  return { changed, flush, discard };
}
