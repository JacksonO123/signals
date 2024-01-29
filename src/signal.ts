type UpdateCb<T> = (currentValue: T) => T;

export const contexts: Context[] = [];

class Context {
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

class State<T> {
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

export const createSignal = <T>(value: T) => {
  const state = new State(value);

  return [
    () => state.read(),
    (value: T | UpdateCb<T>) =>
      state.write(
        typeof value === "function"
          ? (value as UpdateCb<T>)(state.value)
          : value,
      ),
  ] as const;
};

export const onCleanup = (fn: () => void) => {
  const currentContext = contexts[contexts.length - 1];

  if (!currentContext) return;

  currentContext.onDispose(fn);
};

export const cleanup = (context: Context) => {
  const index = contexts.indexOf(context);

  if (index === -1) return;

  const toClean = contexts.splice(index);
  toClean.forEach((context) => context.dispose());
};

export const trackDependencies = (fn: Function) => {
  const currentContext = new Context();

  contexts.push(currentContext);

  fn();

  currentContext.addDependency(fn);

  return () => cleanup(currentContext);
};

export const createEffect = (cb: () => void) => {
  const cleanupEffect = trackDependencies(cb);

  const temp = () => {
    cleanupEffect();
    console.log("here");
  };

  onCleanup(temp);
};
