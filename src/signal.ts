import { Context, State, owner, currentContext } from "./reactive";
import { Accessor, Setter } from "./types";

export const trackScope = (fn: () => void) => {
  const current = new Context();
  owner.addContext(current);

  fn();

  owner.popContext();

  const outerContext = currentContext();

  if (outerContext) {
    onCleanup(() => cleanup(current));
  }

  return () => cleanup(current);
};

export const cleanup = (context: Context) => {
  context.dispose();
};

export const onCleanup = (fn: () => void) => {
  const context = currentContext();
  if (!context) return;

  return context.onDispose(fn);
};

export const createSignal = <T>(value: T): [Accessor<T>, Setter<T>] => {
  const current = new State(value);

  return [
    () => current.read(),
    (value) =>
      current.write(
        typeof value === "function"
          ? (value as Function)(current._read())
          : value,
      ),
  ];
};

export const createEffect = (fn: () => void) => {
  const cleanup = trackScope(() => {
    fn();

    const current = currentContext();
    if (!current) return;

    current.addEffect(fn);
  });

  onCleanup(cleanup);
};

export const derived = <T>(fn: () => T) => {
  const [value, setValue] = createSignal<T | null>(null);

  let prevCleanup: (() => void) | null = null;
  let updateCleanup: ((newFn: () => void) => void) | undefined = undefined;

  const handleDerived = () => {
    if (prevCleanup) prevCleanup();

    const cleanup = trackScope(() => {
      setValue(fn());

      const current = currentContext();
      if (!current) return;

      current.addEffect(handleDerived);
    });

    prevCleanup = cleanup;
    updateCleanup?.(cleanup);
  };

  handleDerived();

  updateCleanup = onCleanup(prevCleanup!);

  return value;
};

export const getSignalInternals = <T>(fn: Accessor<T>) => {
  let res: State<T> | null = null;

  const cleanup = trackScope(() => {
    fn();

    const current = currentContext();
    if (!current) return;

    const owned = current.getOwned();

    if (owned.length === 0) {
      throw new Error("Error finding internals, no signal detected");
    }

    res = current.getOwned()[0];
  });

  cleanup();

  return res as unknown as State<T>;
};

export const createEffectOn = (cb: () => void, deps: Accessor<any>[]) => {
  const cleanup = trackScope(() => {
    deps.forEach((dep) => dep());

    const current = currentContext();
    if (!current) return;

    current.addEffect(cb);
  });

  onCleanup(cleanup);
};
