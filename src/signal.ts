import { Context, State, contexts } from "./reactive";
import { Accessor, Setter } from "./types";

export const trackDependencies = (fn: Function) => {
  const currentContext = new Context();

  contexts.push(currentContext);

  fn();

  currentContext.addDependency(fn);

  return () => cleanup(currentContext);
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

export const createSignal = <T>(value: T): [Accessor<T>, Setter<T>] => {
  const state = new State(value);

  return [
    () => state.read(),
    (value) =>
      state.write(
        typeof value === "function" ? (value as Function)(state.value) : value,
      ),
  ];
};

export const derived = <T>(cb: () => T) => {
  const [result, setResult] = createSignal<null | T>(null);

  const cleanupDerived = trackDependencies(() => setResult(cb()));

  onCleanup(cleanupDerived);

  return result;
};

export const createEffect = (cb: () => void) => {
  const cleanupEffect = trackDependencies(cb);

  onCleanup(cleanupEffect);
};
