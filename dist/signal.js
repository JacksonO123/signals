"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEffect = exports.trackDependencies = exports.cleanup = exports.onCleanup = exports.createSignal = exports.contexts = void 0;
exports.contexts = [];
class Context {
    owned;
    disposeEvents;
    constructor() {
        this.owned = new Set();
        this.disposeEvents = [];
    }
    append(dep) {
        this.owned.add(dep);
    }
    addDependency(fn) {
        this.owned.forEach((item) => item.addDependency(fn));
    }
    dispose() {
        this.owned.forEach((item) => item.untrack());
        this.owned.clear();
    }
    onDispose(fn) {
        this.disposeEvents.push(fn);
    }
}
class State {
    value;
    deps;
    constructor(value) {
        this.value = value;
        this.deps = [];
    }
    read() {
        const currentContext = exports.contexts[exports.contexts.length - 1];
        if (currentContext)
            currentContext.append(this);
        return this.value;
    }
    write(newValue) {
        this.value = newValue;
        this.deps.forEach((item) => item());
    }
    addDependency(dep) {
        this.deps.push(dep);
    }
    untrack() {
        this.deps = [];
    }
}
const createSignal = (value) => {
    const state = new State(value);
    return [
        () => state.read(),
        (value) => state.write(typeof value === "function"
            ? value(state.value)
            : value),
    ];
};
exports.createSignal = createSignal;
const onCleanup = (fn) => {
    const currentContext = exports.contexts[exports.contexts.length - 1];
    if (!currentContext)
        return;
    currentContext.onDispose(fn);
};
exports.onCleanup = onCleanup;
const cleanup = (context) => {
    const index = exports.contexts.indexOf(context);
    if (index === -1)
        return;
    const toClean = exports.contexts.splice(index);
    toClean.forEach((context) => context.dispose());
};
exports.cleanup = cleanup;
const trackDependencies = (fn) => {
    const currentContext = new Context();
    exports.contexts.push(currentContext);
    fn();
    currentContext.addDependency(fn);
    return () => (0, exports.cleanup)(currentContext);
};
exports.trackDependencies = trackDependencies;
const createEffect = (cb) => {
    const cleanupEffect = (0, exports.trackDependencies)(cb);
    const temp = () => {
        cleanupEffect();
        console.log("here");
    };
    (0, exports.onCleanup)(temp);
};
exports.createEffect = createEffect;
