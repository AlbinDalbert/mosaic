import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { ProjectEntry } from '../src/shared/project';

// Lists folders and Markdown documents below a folder, folders first. Hidden
// entries such as .git are skipped. A document's name is its filename
// without the .md extension.
export async function readEntries(root: string, relative = ''): Promise<ProjectEntry[]> {
  const dirents = await readdir(path.join(root, relative), { withFileTypes: true });
  const entries: ProjectEntry[] = [];

  for (const dirent of dirents) {
    if (dirent.name.startsWith('.')) {
      continue;
    }
    const entryPath = relative ? `${relative}/${dirent.name}` : dirent.name;
    if (dirent.isDirectory()) {
      const children = await readEntries(root, entryPath);
      entries.push({ kind: 'folder', name: dirent.name, path: entryPath, children });
    } else if (dirent.isFile() && dirent.name.endsWith('.md')) {
      entries.push({ kind: 'document', name: dirent.name.slice(0, -3), path: entryPath });
    }
  }

  return entries.sort(
    (a, b) =>
      Number(b.kind === 'folder') - Number(a.kind === 'folder') ||
      a.name.localeCompare(b.name, undefined, { numeric: true }),
  );
}

// Resolves a renderer-supplied path to a Markdown file inside the root, or
// throws. This is what keeps the renderer from reading arbitrary files.
export function resolveDocument(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(root + path.sep) || !resolved.endsWith('.md')) {
    throw new Error(`Not a document in the open folder: ${relative}`);
  }
  return resolved;
}
