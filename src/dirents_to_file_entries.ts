import type { Dirent } from 'node:fs';

import { direntToFileEntry } from './dirent_to_file_entry.js';
import type { FileEntry, Path } from './types.js';

/**
 * Convert an array of Dirent objects to an iterable of FileEntry objects.
 * @param files - An array of Dirent objects to convert.
 * @param root - The root directory to use for relative paths.
 * @param filter - A filter function to determine which files to include.
 * @yields - FileEntry objects representing the files that pass the filter.
 */
export function* direntsToFileEntries<P extends Path<string>>(
  files: Dirent[],
  root: P,
  filter: (file: Dirent) => boolean,
): IteratorObject<FileEntry<`${P}/${string}`>, void> {
  for (const file of files) {
    if (!filter(file)) continue;

    yield direntToFileEntry(file, root);
  }
}
