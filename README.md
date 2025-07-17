# data-test-api

API to expose test data in a convenient and consistent way

## Installation

```bash
npm i -D data-test-api
```

## Usage

Api Reference: https://cheminfo.github.io/data-test-api/

### Package exposing files

```ts
// src/index.ts

import { join } from 'node:path';

import type { AbsolutePath } from 'data-test-api';
import init from 'data-test-api';

const zipFilesApi = init(
  join(import.meta.dirname, '../data/zipped') as AbsolutePath,
  (dirent) => dirent.isFile() && dirent.name.endsWith('.zip'),
);

const flatFilesApi = init(join(import.meta.dirname, '../data/flat'));

export { zipFilesApi, flatFilesApi };
```

### Using the API

```ts
import { join } from 'node:path';

import type { AbsolutePath } from 'data-test-api';
import init from 'data-test-api';

const api = init(join(import.meta.dirname, '../data') as AbsolutePath);

const root = api.root;
const filePath = api.getPath('relative/path/to/file.txt');
// .getPath('./relative/path/to/file.txt') // also works
// .getPath('../data/relative/path/to/file.txt') // also works
// .getPath('/absolute/path') // typecheck error, absolute paths are not allowed

const fileByPath = await api.getFile('relative/path/to/file.txt'); // fulfill a FileEntry or reject a FileNotExistsError
const fileByPathBuffer = await fileByPath.buffer();
const fileByPathStream = await fileByPath.stream();

const fileByName = await api.findFile('file.txt'); // fulfill a FileEntry or reject a FileNotFoundError
const fileByNameBuffer = await fileByPath.buffer();
const fileByNameStream = await fileByPath.stream();

// async iteration on files
for await (const file of api.filesAsyncValues()) {
  const buffer = await file.buffer();
  console.log(file.path, buffer.toString());
}

// iteration on files
const values = await api.filesValues();
for (const file of values) {
  console.log(file.path);
}
// you can also use Iterator helpers if you use Node >= 22
// and add "ESNext.Iterator" to your tsconfig.json `compilerOptions.lib`

// array of files
const files = await api.files();

// get buffer with relative path
const bufferByPath = await api.getData('relative/path/to/file.txt');
const bufferByName = await api.findData('file.txt');
```

### FileEntry interface

```ts
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
```

### Extends the API

NB: default export of `data-test-api` is an alias for `new DataTestApi(root, filter)`.

```ts
import { join } from 'node:path';

import { DataTestApi } from 'data-test-api';

export class JdxDataTestApi extends DataTestApi {
  constructor() {
    super(
      join(import.meta.dirname, '../data/jdx'),
      (dirent) => dirent.isFile() && dirent.name.endsWith('.jdx'),
    );
  }

  // you can override methods or add new ones
}
```

### Working relatively with working directory

```js
// ls-recursive.js

import init from 'data-test-api';
const api = init('./', () => true);

for await (const file of api.filesAsyncValues()) {
  console.log(file.path); // path is relative to cwd
}
```
