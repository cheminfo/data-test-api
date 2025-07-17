import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { direntToFileEntry } from './dirent_to_file_entry.js';
import { direntsToFileEntries } from './dirents_to_file_entries.js';
import type { AbsolutePath, FileEntry, Path, RelativePath } from './types.js';

export class DataTestApi<RootPath extends Path<string>> {
  readonly #root: RootPath;
  readonly #filter = (file: Dirent) => file.isFile();

  /**
   * Create a new instance of DataTestApi.
   * @param root - The root directory for the data test API. It can be relative or absolute.
   * @param filter - An optional filter function to determine which files to include.
   *   Defaults to filtering only files.
   *   /!\ If you provide a filter and want to get only files, yuo must specify it in your filter.
   */
  constructor(root: RootPath, filter?: (file: Dirent) => boolean) {
    this.#root = root;
    if (filter) this.#filter = filter;
  }

  /**
   * Get the root directory of the DataTestApi instance.
   * @returns The root directory as a string.
   */
  get root(): RootPath {
    return this.#root;
  }

  /**
   * Get the path to a file or directory relative to the root.
   * @param relativePath - The relative path to the file or directory.
   * @returns The path as a string.
   */
  getPath<SubPath extends string>(
    relativePath: SubPath extends AbsolutePath ? never : SubPath,
  ): SubPath extends AbsolutePath ? never : `${RootPath}/${SubPath}` {
    return join(this.#root, relativePath) as SubPath extends AbsolutePath
      ? never
      : `${RootPath}/${SubPath}`;
  }

  // cache readdir results to avoid multiple disk reads
  #rawFiles: Promise<Dirent[]> | undefined;
  #getRawFiles() {
    if (!this.#rawFiles) {
      this.#rawFiles = readdir(this.#root, {
        withFileTypes: true,
        recursive: true,
      });
    }

    return this.#rawFiles;
  }

  /**
   * Get an async iterator of FileEntry objects for all files (recursive) in the root directory matching the filter.
   * @yields - FileEntry objects representing the files that pass the filter.
   */
  async *filesAsyncValues() {
    const files = await this.#getRawFiles();

    yield* direntsToFileEntries(files, this.#root, this.#filter);
  }

  /**
   * Get an iterator of FileEntry objects for all files (recursive) in the root directory matching the filter
   * @returns - A promise fulfilled with the iterator.
   */
  async filesValues() {
    const files = await this.#getRawFiles();

    return direntsToFileEntries(files, this.#root, this.#filter);
  }

  /**
   * Get an array of FileEntry objects for all files (recursive) in the root directory matching the filter.
   * @returns - A promise fulfilled with an array of FileEntry objects.
   */
  async files() {
    const files: Array<FileEntry<`${RootPath}/${string}`>> = [];

    for await (const file of this.filesAsyncValues()) {
      files.push(file);
    }

    return files;
  }

  /**
   * Get a FileEntry object for a specific file path relative to the root directory.
   * This method does not use the filter, so it will return the file if it exists, even if it does not match the filter.
   * @param relativePath - The relative path to the file.
   * @returns - A promise fulfilled with a FileEntry object if the file exists, or undefined if it does not.
   */
  async getFile<SubPath extends RelativePath<string>>(
    relativePath: SubPath extends AbsolutePath ? never : SubPath,
  ): Promise<FileEntry<`${RootPath}/${SubPath}`> | undefined> {
    const path = this.getPath(relativePath);
    const [dir, name] = [dirname(path), basename(path)];
    const files = await readdir(dir, {
      withFileTypes: true,
      recursive: false,
    });

    const file = files.find((f) => f.isFile() && f.name === name);
    if (!file) return undefined;

    return direntToFileEntry(
      file,
      this.#root,
    ) as FileEntry<`${RootPath}/${SubPath}`>;
  }

  /**
   * Find a FileEntry object by its name in the root directory (recursive).
   * This method does not use the filter, so it will return the file if it founds, even if it does not match the filter.
   * @param name - The name of the file to find.
   * @returns - A promise fulfilled with a FileEntry object if the file is found, or undefined if it is not found.
   */
  async findFile<Name extends string>(
    name: Name extends `${string}/${string}` ? never : Name,
  ): Promise<FileEntry<`${RootPath}/${string}`> | undefined> {
    const files = await this.#getRawFiles();

    const file = files.find((f) => f.isFile() && f.name === name);
    if (!file) return undefined;

    return direntToFileEntry(file, this.#root);
  }

  /**
   * Get the data (as a Buffer) of a file for a specific path relative to the root directory.
   * This method does not use the filter, so it will return the data if the file exists, even if it does not match the filter.
   * @param relativePath - The relative path to the file.
   * @returns - A promise fulfilled with the file data as a Buffer if the file exists, or undefined if it does not.
   */
  async getData<SubPath extends RelativePath<string>>(
    relativePath: SubPath extends AbsolutePath ? never : SubPath,
  ) {
    const file = await this.getFile(relativePath);

    return file?.buffer();
  }

  /**
   * Find the data (as a Buffer) of a file by its name in the root directory (recursive).
   * This method does not use the filter, so it will return the file if it is found, even if it does not match the filter.
   * @param name - The name of the file to find.
   * @returns - A promise fulfilled with the file data as a Buffer if the is found, or undefined if it does not.
   */
  async findData<Name extends string>(
    name: Name extends `${string}/${string}` ? never : Name,
  ) {
    const file = await this.findFile(name);

    return file?.buffer();
  }
}
