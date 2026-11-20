import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { contentHash, readEntries, resolveDocument, writeDocument } from './project.ts';

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

test('writes a document that is unchanged since it was read, leaving no temporary file', async () => {
  const folder = await mkdtemp(path.join(root, 'write-'));
  const file = path.join(folder, 'draft.md');
  await writeFile(file, 'old');

  const baseline = await writeDocument(file, 'new', contentHash('old'));
  assert.equal(await readFile(file, 'utf8'), 'new');
  assert.equal(baseline, contentHash('new'));
  assert.deepEqual(await readdir(folder), ['draft.md']);
});

test('refuses to overwrite a document changed elsewhere since it was read', async () => {
  const file = path.join(await mkdtemp(path.join(root, 'conflict-')), 'draft.md');
  await writeFile(file, 'changed in another editor');

  await assert.rejects(writeDocument(file, 'mine', contentHash('what Mosaic read')), /changed on disk/);
  assert.equal(await readFile(file, 'utf8'), 'changed in another editor');
});
