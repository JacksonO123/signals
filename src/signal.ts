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

  context.onDispose(fn);
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

  const updateValue = () => {
    owner.lock();
    setValue(fn());
    owner.unlock();
  };

  const cleanup = trackScope(() => {
    setValue(fn());

    const current = currentContext();

    if (!current) return;

    current.addEffect(updateValue);
  });

  onCleanup(cleanup);

  return value;
};
