export class Owner {
  private contexts: Context[];

  constructor() {
    this.contexts = [];
  }

  currentContext(): Context | undefined {
    return this.contexts[this.contexts.length - 1];
  }

  addContext(context: Context) {
    this.contexts.push(context);
  }

  popContext() {
    return this.contexts.pop();
  }

  getContext() {
    return this.contexts;
  }
}

export const owner = new Owner();

export const currentContext = () => owner.currentContext();

const track = (state: State<any>) => {
  const current = currentContext();

  if (!current) return;

  current.own(state);
};

export class Context {
  private owned: Set<State<any>>;
  private disposeEvents: (() => void)[];

  constructor() {
    this.owned = new Set();
    this.disposeEvents = [];
  }

  own(state: State<any>) {
    this.owned.add(state);
  }

  ownMany(states: State<any>[]) {
    states.forEach((state) => {
      this.owned.add(state);
    });
  }

  dispose() {
    this.runDisposeEvents();
    this.owned.clear();
  }

  runDisposeEvents() {
    this.disposeEvents.forEach((event) => event());
    this.disposeEvents = [];
  }

  onDispose(fn: () => void) {
    this.disposeEvents.push(fn);
    const index = this.disposeEvents.length - 1;

    return (newFn: () => void) => {
      if (this.disposeEvents.length > index) {
        this.disposeEvents[index] = newFn;
      }
    };
  }

  addEffect(fn: () => void) {
    this.owned.forEach((signal) => signal.addEffect(fn));
  }

  removeEffect(fn: () => void) {
    this.owned.forEach((signal) => signal.removeEffect(fn));
  }

  getOwned() {
    return [...this.owned];
  }
}

export class State<T> {
  private effects: (() => void)[];
  private value: T;

  constructor(state: T) {
    this.value = state;
    this.effects = [];
  }

  _read() {
    return this.value;
  }

  read() {
    track(this);

    return this._read();
  }

  _write(newValue: T) {
    this.value = newValue;
  }

  write(newValue: T) {
    this._write(newValue);

    this.effects.forEach((effect) => effect());
  }

  dispose() {
    this.effects = [];
  }

  addEffect(fn: () => void) {
    this.effects.push(fn);
  }

  removeEffect(fn: () => void) {
    this.effects = this.effects.filter((effect) => effect !== fn);
  }
}
