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

export interface FileEntry<P extends Path<string> = Path<string>> {
  /** the name of the file (with extension) */
  name: string;
  /** the name without extension */
  basename: string;
  /** the file extension */
  extension: string;
  /** Relative from instance DataTestApi root */
  relativePath: RelativePath<string>;
  /** the absolute path to the file */
  path: P;
  /** getter of the file stream */
  stream: () => ReadStream;
  /** getter of the buffer file */
  buffer: () => Promise<Buffer>;
}
