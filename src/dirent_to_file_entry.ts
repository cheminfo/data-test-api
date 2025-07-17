import type { Dirent } from 'node:fs';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, normalize, parse, relative } from 'node:path';

import type { ExtractPath, FileEntry, Path, RelativePath } from './types.js';

/**
 * Convert a Dirent object to a FileEntry object.
 * @param file - The Dirent object to convert.
 * @param root - The root directory to use for relative paths.
 * @returns A FileEntry object representing the file.
 */
export function direntToFileEntry<P extends Path<string>>(
  file: Dirent,
  root: P,
): FileEntry<`${P}/${string}`> {
  const path = normalize(join(file.parentPath, file.name)) as `${P}/${string}`;
  const parsed = parse(path);

  return {
    name: parsed.base,
    basename: parsed.name,
    extension: parsed.ext,
    path,
    relativePath: normalize(relative(root, path)) as RelativePath<
      ExtractPath<P>
    >,
    stream: () => createReadStream(path),
    buffer: () => readFile(path),
  };
}
