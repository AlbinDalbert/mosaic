import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAutosave, type SaveStatus } from './autosave.ts';

// A save that waits until the test resolves or rejects it.
function controlledSaves() {
  const calls: { text: string; resolve(): void; reject(error: Error): void }[] = [];
  const save = (text: string) =>
    new Promise<void>((resolve, reject) => calls.push({ text, resolve, reject }));
  return { calls, save };
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

test('waits for typing to pause, then saves the latest text once', async () => {
  let text = '';
  const saved: string[] = [];
  const autosave = createAutosave({
    read: () => text,
    save: async (value) => void saved.push(value),
    onStatus: () => {},
    delay: 20,
  });

  for (const char of 'hello') {
    text += char;
    autosave.changed();
  }
  assert.deepEqual(saved, []);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.deepEqual(saved, ['hello']);
});

test('typing during a save stays unsaved and is saved next, one save at a time', async () => {
  let text = 'a';
  const statuses: SaveStatus['state'][] = [];
  const { calls, save } = controlledSaves();
  const autosave = createAutosave({
    read: () => text,
    save,
    onStatus: (status) => statuses.push(status.state),
    delay: 60_000,
  });

  autosave.changed();
  const flushed = autosave.flush();
  text = 'ab';
  autosave.changed();
  const flushedAgain = autosave.flush();
  await tick();
  assert.equal(calls.length, 1, 'second save waits for the first');

  calls[0]!.resolve();
  await tick();
  assert.equal(calls.length, 2);
  assert.equal(calls[1]!.text, 'ab');
  assert.deepEqual(statuses, ['unsaved'], 'acknowledging the older revision does not mark it saved');

  calls[1]!.resolve();
  await Promise.all([flushed, flushedAgain]);
  assert.deepEqual(statuses, ['unsaved', 'saved']);
});

test('a failed save reports why and leaves the document unsaved', async () => {
  const statuses: SaveStatus[] = [];
  const { calls, save } = controlledSaves();
  const autosave = createAutosave({
    read: () => 'text',
    save,
    onStatus: (status) => statuses.push(status),
    delay: 60_000,
  });

  autosave.changed();
  const flushed = autosave.flush();
  await tick();
  calls[0]!.reject(new Error('disk full'));
  await assert.rejects(flushed, /disk full/);
  assert.deepEqual(statuses.at(-1), { state: 'failed', reason: 'disk full' });

  const retried = autosave.flush();
  await tick();
  assert.equal(calls.length, 2, 'the next flush tries again');
  calls[1]!.resolve();
  await retried;
  assert.deepEqual(statuses.at(-1), { state: 'saved' });
});

test('discarding forgets unsaved edits so leaving the document does not save them', async () => {
  const { calls, save } = controlledSaves();
  const autosave = createAutosave({ read: () => 'text', save, onStatus: () => {}, delay: 60_000 });

  autosave.changed();
  autosave.discard();
  await autosave.flush();
  assert.equal(calls.length, 0);
});
