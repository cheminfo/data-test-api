export class DataTestApi {
  #root: string;

  constructor(root: string) {
    this.#root = root;
  }

  get root() {
    return this.#root;
  }
}
