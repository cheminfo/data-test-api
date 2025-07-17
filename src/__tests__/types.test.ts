import { createReadStream } from 'node:fs';

import { describe, expectTypeOf, it } from 'vitest';

import type { AbsolutePath, FileEntry, RelativePath } from '../types.js';

describe('RelativePath', () => {
  it('should accept ./ prefix', () => {
    expectTypeOf<RelativePath<'./test'>>().toExtend<'./test'>();
  });

  it('should accept ../ prefix', () => {
    expectTypeOf<RelativePath<'../test'>>().toExtend<'../test'>();
  });

  it('should accept no prefix', () => {
    expectTypeOf<RelativePath<'test'>>().toExtend<'test'>();
  });

  it('should accept with inner slash', () => {
    expectTypeOf<RelativePath<'test/test'>>().toExtend<'test/test'>();
    expectTypeOf<RelativePath<'./test/test'>>().toExtend<'./test/test'>();
    expectTypeOf<RelativePath<'../test/test'>>().toExtend<'../test/test'>();
  });

  it('should reject absolute paths', () => {
    expectTypeOf<RelativePath<'/'>>().toEqualTypeOf<never>();
    expectTypeOf<RelativePath<'/test'>>().toEqualTypeOf<never>();
  });
});

describe('AbsolutePath', () => {
  it('should accept absolute path', () => {
    expectTypeOf<'/'>().toExtend<AbsolutePath>();
    expectTypeOf<'/path/deep'>().toExtend<AbsolutePath>();
  });

  it('should reject relative path', () => {
    expectTypeOf('./test').not.toExtend<AbsolutePath>();
    expectTypeOf('./test/test').not.toExtend<AbsolutePath>();
    expectTypeOf('../test').not.toExtend<AbsolutePath>();
    expectTypeOf('../test/test').not.toExtend<AbsolutePath>();
    expectTypeOf('test').not.toExtend<AbsolutePath>();
    expectTypeOf('test/test').not.toExtend<AbsolutePath>();
  });
});

function inferFileEntry<S extends string>(file: FileEntry<S>): FileEntry<S> {
  return file;
}

describe('FileEntry', () => {
  it('should infer path', () => {
    const file = inferFileEntry({
      name: 'file.txt',
      basename: 'file',
      extension: '.txt',
      path: '/root/file.txt',
      relativePath: 'file.txt',
      stream: () => createReadStream(''),
      buffer: async () => Buffer.from(''),
    });

    expectTypeOf(file).toEqualTypeOf<FileEntry<'/root/file.txt'>>();
    expectTypeOf(file.path).toEqualTypeOf<'/root/file.txt'>();
  });
});
