export class DataTestApiError extends Error {}

export class FileNotFoundError extends DataTestApiError {
  constructor(name: string, root: string) {
    super(`File not found: ${name} into ${root}`);
  }
}

export class FileNotExistsError extends DataTestApiError {
  constructor(relativePath: string, root: string) {
    super(`File does not exist: ${relativePath} into ${root}`);
  }
}
