import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it, test } from 'vitest';

import type { AbsolutePath } from '../index.ts';
import { DataTestApi } from '../index.ts';

test('should construct with data', async () => {
  const api = new DataTestApi('data');
  await api.findFile('name');

  expect(api.root).toBe('data');
});

const DATA_ROOT = join(import.meta.dirname, '../../data') as AbsolutePath;

test('should construct with data and custom file filter', async () => {
  const api = new DataTestApi(
    DATA_ROOT,
    (file) => file.isFile() && file.name.endsWith('.txt'),
  );

  const files = await api.files();
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  expect(files).toMatchObject([
    {
      name: 'a.txt',
      basename: 'a',
      extension: '.txt',
      relativePath: 'a.txt',
      path: join(DATA_ROOT, 'a.txt'),
    },
    {
      name: 'b.txt',
      basename: 'b',
      extension: '.txt',
      relativePath: 'b.txt',
      path: join(DATA_ROOT, 'b.txt'),
    },
    {
      name: 'd.txt',
      basename: 'd',
      extension: '.txt',
      relativePath: 'c/d.txt',
      path: join(DATA_ROOT, 'c/d.txt'),
    },
  ]);
});

describe('DataTestApi iterations', () => {
  it('should async iterate over files', async () => {
    const api = new DataTestApi(DATA_ROOT);

    interface Item {
      relativePath: string;
      text: string;
    }

    const files: Item[] = [];

    for await (const file of api.filesAsyncValues()) {
      const buffer = await file.buffer();
      const text = buffer.toString();
      const relativePath = file.relativePath;

      files.push({ relativePath, text });
    }

    files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    expect(files).toStrictEqual([
      { relativePath: 'a.txt', text: 'a\n' },
      { relativePath: 'b.txt', text: 'b\n' },
      { relativePath: 'bar.foo', text: 'bar\n' },
      { relativePath: 'c/d.txt', text: 'd\n' },
      { relativePath: 'foo.bar', text: 'foo\n' },
    ]);
  });

  it('should iterate over files', async () => {
    const api = new DataTestApi(DATA_ROOT);

    const entries = await api.filesValues();
    const entry = entries.next();

    // eslint-disable-next-line vitest/no-conditional-in-test
    if (entry.done) throw new Error('No entry found');

    const file = entry.value;

    expect(file).toMatchObject({
      name: 'a.txt',
      basename: 'a',
      extension: '.txt',
      path: join(DATA_ROOT, 'a.txt'),
      relativePath: 'a.txt',
    });
  });
});

describe('DataTestApi single file', () => {
  const api = new DataTestApi(DATA_ROOT);

  it('should get file (by relative path)', async () => {
    const file = await api.getFile('c/d.txt');

    expect(file).toMatchObject({
      name: 'd.txt',
      basename: 'd',
      extension: '.txt',
      relativePath: 'c/d.txt',
      path: join(DATA_ROOT, 'c/d.txt'),
    });
  });

  it('should find specific file (by name)', async () => {
    const file = await api.findFile('d.txt');

    expect(file).toMatchObject({
      name: 'd.txt',
      basename: 'd',
      extension: '.txt',
      relativePath: 'c/d.txt',
      path: join(DATA_ROOT, 'c/d.txt'),
    });
  });

  it('should not throw if no file found', async () => {
    const file = await api.findFile('not-found.txt');

    expect(file).toBeUndefined();
  });

  it('should not throw if file does not exists', async () => {
    const file = await api.getFile('not-found.txt');

    expect(file).toBeUndefined();
  });
});

describe('DataTestApi path', () => {
  it('should give relative path', async () => {
    const api = new DataTestApi('data');
    const path = api.getPath('c/d.txt');

    expect(path).toBe('data/c/d.txt');
  });

  it('should give absolute path', async () => {
    const api = new DataTestApi(DATA_ROOT);
    const path = api.getPath('c/d.txt');

    expect(path).toBe(join(DATA_ROOT, 'c/d.txt'));

    const stats = await stat(path);

    expect(stats.isFile()).toBe(true);
  });
});

describe('DataTestApi data', () => {
  const api = new DataTestApi(DATA_ROOT);

  it('should get buffer', async () => {
    const buffer = await api.getData('c/d.txt');

    expect(buffer?.toString()).toBe('d\n');
  });

  it('should find buffer', async () => {
    const buffer = await api.findData('d.txt');

    expect(buffer?.toString()).toBe('d\n');
  });

  it('should not throw if no data found', async () => {
    const bufferFound = await api.findData('not-found.txt');
    const bufferGot = await api.getData('not-found.txt');

    expect(bufferFound).toBeUndefined();
    expect(bufferGot).toBeUndefined();
  });
});
