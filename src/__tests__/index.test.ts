import { expect, test } from 'vitest';

import init from '../index.ts';

test('init alias works', async () => {
  const api = init('data', (dirent) => dirent.isDirectory());

  expect(api.root).toBe('data');
  await expect(api.files()).resolves.toMatchObject([
    {
      name: 'c',
      relativePath: 'c',
    },
    {
      name: 'e.txt',
      relativePath: 'e.txt',
    },
  ]);
});
