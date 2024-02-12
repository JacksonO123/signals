import { Context } from "./reactive";
import { Accessor, Setter } from "./types";
export declare const trackScope: (fn: () => void) => () => void;
export declare const cleanup: (context: Context) => void;
export declare const onCleanup: (fn: () => void) => ((newFn: () => void) => void) | undefined;
export declare const createSignal: <T>(value: T) => [Accessor<T>, Setter<T>];
export declare const createEffect: (fn: () => void) => void;
export declare const derived: <T>(fn: () => T) => Accessor<T | null>;
export declare const getSignalInternals: <T>(fn: Accessor<T>) => null;
