export const contexts: Context[] = [];

export class Context {
  private owned: Set<State<any>>;
  private disposeEvents: (() => void)[];

  constructor() {
    this.owned = new Set();
    this.disposeEvents = [];
  }

  append(dep: State<any>) {
    this.owned.add(dep);
  }

  addDependency(fn: Function) {
    this.owned.forEach((item) => item.addDependency(fn));
  }

  dispose() {
    this.owned.forEach((item) => item.untrack());
    this.owned.clear();
  }

  onDispose(fn: () => void) {
    this.disposeEvents.push(fn);
  }
}

export class State<T> {
  value: T;
  private deps: Function[];

  constructor(value: T) {
    this.value = value;
    this.deps = [];
  }

  read() {
    const currentContext = contexts[contexts.length - 1];

    if (currentContext) currentContext.append(this);

    return this.value;
  }

  write(newValue: T) {
    this.value = newValue;
    this.deps.forEach((item) => item());
  }

  addDependency(dep: Function) {
    this.deps.push(dep);
  }

  untrack() {
    this.deps = [];
  }
}
