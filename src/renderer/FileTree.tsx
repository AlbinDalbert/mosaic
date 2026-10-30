import type { ProjectEntry } from '../shared/project';

interface FileTreeProps {
  entries: ProjectEntry[];
  activePath: string | null;
  onOpenDocument(path: string): void;
}

// Folders expand and collapse as native <details>, so the tree keeps no state.
export default function FileTree({ entries, activePath, onOpenDocument }: FileTreeProps) {
  return (
    <ul className="file-tree">
      {entries.map((entry) => (
        <li key={entry.path}>
          {entry.kind === 'folder' ? (
            <details>
              <summary>{entry.name}</summary>
              <FileTree
                entries={entry.children}
                activePath={activePath}
                onOpenDocument={onOpenDocument}
              />
            </details>
          ) : (
            <button
              type="button"
              aria-current={entry.path === activePath ? 'page' : undefined}
              onClick={() => onOpenDocument(entry.path)}
            >
              {entry.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
