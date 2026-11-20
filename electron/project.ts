import { createHash } from 'node:crypto';
import { open, readdir, readFile, rename, rm, stat } from 'node:fs/promises';
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

// Identifies a document's content, to notice when the file changed on disk.
export function contentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// Writes a document only if the file still holds what Mosaic last read or
// wrote (`baseline`), so a change made elsewhere is never silently
// overwritten. The text goes to a temporary file that replaces the document
// in one rename, so a crash leaves either the old or the new file, never a
// partial one. Returns the new baseline.
export async function writeDocument(file: string, text: string, baseline: string): Promise<string> {
  const onDisk = await readFile(file, 'utf8');
  if (contentHash(onDisk) !== baseline) {
    throw new Error(`${path.basename(file)} changed on disk after Mosaic opened it. Your edits are kept in the editor but not saved.`);
  }

  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.mosaic-save`);
  try {
    const handle = await open(temporary, 'w', (await stat(file)).mode);
    try {
      await handle.writeFile(text, 'utf8');
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, file);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  return contentHash(text);
}
