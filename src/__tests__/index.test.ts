import { expect, test } from 'vitest';

import init from '../index.ts';

test('init alias works', async () => {
  const api = init('data', (dirent) => dirent.isDirectory());

  expect(api.root).toBe('data');

  const files = await api.files();
  const items = files.map((file) => file.relativePath);

  expect(items).toStrictEqual(['c', 'e.txt']);
});
