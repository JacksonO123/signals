# Generic implementation for signals

A lightweight generic signals implementation that can be used for fine-grain reactivity, or general purpose observer pattern use cases.

# Docs

Signals are a reactivity privative built on the observer pattern.

The term "tracked scopes" is used frequently and means any "scope" (usually a callback function) that is being observed by the library. All of the bellow functions track dependencies:

- `trackScope`
- `createEffect`
- `derived`

## Tracking dependencies

To track enable the signals to be observed, use the `trackScope` function. While a few other functions track dependencies, `trackScope` is important because it returns a cleanup function to dispose of the observed signals.

```ts
const cleanup = trackScope(() => {
  // more code here
});
```

## Creating signals

To create a new signal use the `createSignal` function. This is not required to be called inside of a tracked scope for reactivity to work.

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

The `createEffect` function can be called on its own, without being nested in a tracked scope function for reactivity to work. However calling it in a tracked scope will allow for the observed signals to be cleaned up.

## Derived signals

Use the `derived` function to create a new signal where the value depends on multiple other signals.

```ts
const [value1, setValue1] = createSignal(2);
const [value2, setValue2] = createSignal(false);

// new signal based on value1 and value2 signals
const newValue = derived(() => `value1: ${value1()}, value2: ${value2()}`);
```

The return type is a getter function to the derived signal.

The `derived` function can be called on its own, without being nested in a tracked scope for reactivity to work. However wrapping it in a tracked scope will allow for the observed signals to be cleaned up.

## Custom cleanup logic

When tracked scopes are cleaned up, you can specify custom cleanup logic using the `onCleanup` function.

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
