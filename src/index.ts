import type { Dirent } from 'node:fs';

import { DataTestApi } from './data_test_api.ts';
import type { Path } from './types.ts';

/**
 * Initialize the DataTestApi with the root directory.
 * @param root - The root directory for the data test API. It can be relative or absolute.
 * @param fileFilter - An optional filter function to determine which files to include.
 *                     Defaults to filtering only files.
 * @returns An instance of DataTestApi.
 */
export default function init<RootPath extends Path<string>>(
  root: RootPath,
  fileFilter?: (file: Dirent) => boolean,
): DataTestApi<RootPath> {
  return new DataTestApi(root, fileFilter);
}

export { DataTestApi } from './data_test_api.ts';
export type * from './types.ts';
