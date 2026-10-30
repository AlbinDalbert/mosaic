import { useRef, useState } from 'react';
import type { Project } from '../shared/project';
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
  // The last document asked for, so a slow read can't replace a newer one.
  const requested = useRef<string | null>(null);

  function changeTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  function changeFont(next: FontId) {
    applyFont(next);
    setFont(next);
  }

  async function openFolder() {
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
    try {
      const text = await window.mosaicProject.readDocument(path);
      if (requested.current === path) {
        setShown({ path, text });
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
        </nav>
        {shown ? <Editor key={shown.path} text={shown.text} /> : <main />}
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
