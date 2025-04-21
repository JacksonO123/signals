export declare class Owner {
    private contexts;
    constructor();
    currentContext(): Context | undefined;
    addContext(context: Context): void;
    popContext(): Context | undefined;
    getContext(): Context[];
}
export declare const owner: Owner;
export declare const currentContext: () => Context | undefined;
export declare const globalState: {
    reading: boolean;
};
export declare class Context {
    private owned;
    private disposeEvents;
    constructor();
    own(state: State<any>): void;
    ownMany(states: State<any>[]): void;
    dispose(): void;
    runDisposeEvents(): void;
    onDispose(fn: () => void): (newFn: () => void) => void;
    addEffect(fn: () => void): void;
    removeEffect(fn: () => void): void;
    getOwned(): State<any>[];
}
export declare class State<T> {
    private effects;
    private value;
    constructor(state: T);
    _read(): T;
    read(): T;
    _write(newValue: T): void;
    write(newValue: T): void;
    dispose(): void;
    addEffect(fn: () => void): void;
    removeEffect(fn: () => void): void;
}
