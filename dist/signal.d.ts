type UpdateCb<T> = (currentValue: T) => T;
export declare const contexts: Context[];
declare class Context {
    private owned;
    private disposeEvents;
    constructor();
    append(dep: State<any>): void;
    addDependency(fn: Function): void;
    dispose(): void;
    onDispose(fn: () => void): void;
}
declare class State<T> {
    value: T;
    private deps;
    constructor(value: T);
    read(): T;
    write(newValue: T): void;
    addDependency(dep: Function): void;
    untrack(): void;
}
export declare const createSignal: <T>(value: T) => readonly [() => T, (value: T | UpdateCb<T>) => void];
export declare const onCleanup: (fn: () => void) => void;
export declare const cleanup: (context: Context) => void;
export declare const trackDependencies: (fn: Function) => () => void;
export declare const createEffect: (cb: () => void) => void;
export {};
