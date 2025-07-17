import type { ReadStream } from 'node:fs';

export type AbsolutePath = `/${string}`;
export type RelativePath<S extends string = ''> = S extends AbsolutePath
  ? never
  : S;
export type Path<P extends string> = AbsolutePath | RelativePath<P>;

export type ExtractPath<P extends Path<string>> = P extends AbsolutePath
  ? P
  : P extends RelativePath<infer S>
    ? S
    : never;

/**
 * Represents a file entry in the DataTestApi.
 * Get basic info like, name, relative path, etc.
 * Get file stream or buffer.
 */
export interface FileEntry<P extends Path<string> = Path<string>> {
  /**
   * The name of the file (with extension)
   * @example 'file.txt'
   */
  name: string;
  /**
   * The name without extension
   * @example 'file'
   */
  basename: string;
  /**
   * The file extension
   * @example '.txt'
   */
  extension: string;
  /**
   * Relative from instance DataTestApi root
   * @example 'subfolder/file.txt'
   */
  relativePath: RelativePath<string>;
  /**
   * The path to the file
   * @example 'data/subfolder/file.txt'
   * @example '/absolute/path/to/data/subfolder/file.txt'
   */
  path: P;
  /** getter of the file stream */
  stream: () => ReadStream;
  /** getter of the buffer file */
  buffer: () => Promise<Buffer>;
}
