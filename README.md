# Generic implementation for signals

A lightweight generic signals implementation that can be used for fine-grain reactivity, or general purpose observer pattern use cases.

# Docs

Signals are a reactivity primitive built on the observer pattern.

I use the term "tracked scopes" frequently and means any "scope" (usually a callback function) that is being observed by the library. All of the bellow functions track dependencies:

- `trackScope`
- `createEffect`
- `derived`

It is important that both `createEffect` and `derived` are used within a `trackScope` call so that they are able to be disposed.

## Tracking dependencies

To enable the signals to be observed, use the `trackScope` function to dispose dependencies.

```ts
const cleanup = trackScope(() => {
  // more code here
});
```

## Creating signals

To create a new signal use the `createSignal` function.

```ts
// creates a signal with the default value of 2
const [value, setValue] = createSignals(2);
```

`createSignal` returns an array with a getter and setter function.

The setter can take a new value with the type of the signal or a callback to update using the current value.

```ts
// updates value to 4
setValue(4);

// adds 1 to the value
setValue((prev) => prev + 1);
```

To get the value of the signal call the getter function.

```ts
const currentValue = value();
```

**Note** The getter function must be called within a tracked scope for the signal to be observed.

## Effects

Use the `createEffect` function to run an effect when signals change.

```ts
createEffect(() => {
  console.log("value changed to: ", value());
});
```

## Controlled effects

Use the `createEffectOn` method to create an effect that relies specifically on a dependency array for more control over the effect. This function does not execute the callback until a dependency changes.

```ts
const [value, setValue] = createSignal(2);

createEffectOn(() => {
  console.log("value was updated");
}, [value]);
```

This functionality also means that you an add signals to the dependency array without them being used in the callback, or leave dependencies out for different behavior of the effect.

## Derived signals

Use the `derived` function to create a new signal where the value depends on multiple other signals.

```ts
const [value1, setValue1] = createSignal(2);
const [value2, setValue2] = createSignal(false);

// new signal based on value1 and value2 signals
const newValue = derived(() => `value1: ${value1()}, value2: ${value2()}`);
```

The return type is a getter function to the derived signal.

## Custom cleanup logic

You can specify custom cleanup logic using the `onCleanup` function within a tracked scope.

```ts
const cleanup = trackScope(() => {
  onCleanup(() => console.log("this has been cleaned up"));
});

cleanup(); // above console.log will run
```

## Signal internals

Each signal stores a `State` object that tracks dependencies and effects for the signal.

To get this `State` object call the `getSignalInternals` function and pass in the getter function of the signal.

```ts
const [value, setValue] = createSignal(2);

const internalState = getSignalInternals(value);
```

This api is intended for low level signal control funny business.
