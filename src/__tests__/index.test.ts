import { expect, test } from 'vitest';

import { DataTestApi } from '../index.ts';

test('should construct with root', () => {
  const api = new DataTestApi('root');

  expect(api.root).toBe('root');
});
