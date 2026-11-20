import { useEffect, useRef, useState } from 'react';
import type { Project } from '../shared/project';
import type { Autosave, SaveStatus } from './autosave';
import DocumentEditor from './DocumentEditor';
import Editor from './Editor';
import FileTree from './FileTree';
import { applyFont, loadFont, type FontId } from './fonts';
import Home from './Home';
import TitleBar from './TitleBar';
import { applyTheme, loadTheme, type Theme } from './theme';

interface ShownDocument {
  path: string;
  text: string;
}

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [font, setFont] = useState(loadFont);
  const [writing, setWriting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [shown, setShown] = useState<ShownDocument | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ state: 'saved' });
  // The last document asked for, so a slow read can't replace a newer one.
  const requested = useRef<string | null>(null);
  // The shown document's autosave, set by DocumentEditor.
  const autosave = useRef<Autosave | null>(null);

  // Saves the shown document before leaving it. If that fails, the writer
  // chooses between staying and losing the edits; returns whether to leave.
  async function settle(leaving: string): Promise<boolean> {
    try {
      await autosave.current?.flush();
      return true;
    } catch (error) {
      if (!confirm(`${errorMessage(error)}\n\n${leaving} anyway and lose the unsaved edits?`)) {
        return false;
      }
      autosave.current?.discard();
      return true;
    }
  }

  // settle only reads refs, so the first render's copy stays correct.
  useEffect(() => {
    window.mosaicWindow.onCloseRequested(() => settle('Close'));
  }, []);

  function changeTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  function changeFont(next: FontId) {
    applyFont(next);
    setFont(next);
  }

  async function openFolder() {
    if (!(await settle('Open another folder'))) {
      return;
    }
    try {
      const opened = await window.mosaicProject.open();
      if (opened) {
        requested.current = null;
        setProject(opened);
        setShown(null);
      }
    } catch (error) {
      console.error(error);
      alert('Mosaic could not open that folder.');
    }
  }

  async function openDocument(path: string) {
    requested.current = path;
    // Reading the shown document again would make the edits in the editor
    // look like the file on disk, hiding a change made elsewhere.
    if (path === shown?.path || !(await settle('Leave this document'))) {
      return;
    }
    try {
      const text = await window.mosaicProject.readDocument(path);
      if (requested.current === path) {
        setShown({ path, text });
        setSaveStatus({ state: 'saved' });
      }
    } catch (error) {
      console.error(error);
      alert(`Mosaic could not read ${path}.`);
    }
  }

  let content;
  if (project) {
    content = (
      <div className="workspace">
        <nav className="sidebar">
          <div className="sidebar-header">
            <span>{project.name}</span>
            <button type="button" onClick={openFolder}>
              Open
            </button>
          </div>
          <FileTree
            entries={project.entries}
            activePath={shown?.path ?? null}
            onOpenDocument={openDocument}
          />
          {shown && <SaveStatusLine status={saveStatus} />}
        </nav>
        {shown ? (
          <DocumentEditor
            key={shown.path}
            path={shown.path}
            text={shown.text}
            onStatus={setSaveStatus}
            current={autosave}
          />
        ) : (
          <main />
        )}
      </div>
    );
  } else if (writing) {
    content = <Editor />;
  } else {
    content = <Home onWrite={() => setWriting(true)} onOpenFolder={openFolder} />;
  }

  return (
    <div className="app">
      <TitleBar
        theme={theme}
        onThemeChange={changeTheme}
        font={font}
        onFontChange={changeFont}
      />
      {content}
    </div>
  );
}

function SaveStatusLine({ status }: { status: SaveStatus }) {
  return (
    <div className="save-status" data-state={status.state}>
      {status.state === 'failed' ? (
        <>
          <span>Save failed</span>
          <p>{status.reason}</p>
        </>
      ) : (
        <span>{status.state}</span>
      )}
    </div>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
