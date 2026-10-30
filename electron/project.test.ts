import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { readEntries, resolveDocument } from './project.ts';

const root = await mkdtemp(path.join(tmpdir(), 'mosaic-project-'));
after(() => rm(root, { recursive: true, force: true }));

test('lists folders first, then documents, skipping hidden and non-Markdown files', async () => {
  await mkdir(path.join(root, 'writing'));
  await mkdir(path.join(root, '.git'));
  await writeFile(path.join(root, 'writing', 'Chapter 10.md'), '');
  await writeFile(path.join(root, 'writing', 'Chapter 2.md'), '');
  await writeFile(path.join(root, 'now.md'), '');
  await writeFile(path.join(root, 'photo.png'), '');
  await writeFile(path.join(root, '.hidden.md'), '');

  assert.deepEqual(await readEntries(root), [
    {
      kind: 'folder',
      name: 'writing',
      path: 'writing',
      children: [
        { kind: 'document', name: 'Chapter 2', path: 'writing/Chapter 2.md' },
        { kind: 'document', name: 'Chapter 10', path: 'writing/Chapter 10.md' },
      ],
    },
    { kind: 'document', name: 'now', path: 'now.md' },
  ]);
});

test('resolves documents inside the folder only', () => {
  assert.equal(resolveDocument(root, 'writing/now.md'), path.join(root, 'writing', 'now.md'));
  assert.throws(() => resolveDocument(root, '../outside.md'));
  assert.throws(() => resolveDocument(root, '/etc/passwd.md'));
  assert.throws(() => resolveDocument(root, 'photo.png'));
  // A sibling whose name starts with the folder's name is still outside it.
  assert.throws(() => resolveDocument(root, `../${path.basename(root)}-other/a.md`));
});
