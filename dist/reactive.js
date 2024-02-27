export class Owner {
    contexts;
    constructor() {
        this.contexts = [];
    }
    currentContext() {
        return this.contexts[this.contexts.length - 1];
    }
    addContext(context) {
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
const track = (state) => {
    const current = currentContext();
    if (!current)
        return;
    current.own(state);
};
export class Context {
    owned;
    disposeEvents;
    constructor() {
        this.owned = [];
        this.disposeEvents = [];
    }
    own(state) {
        this.owned.push(state);
    }
    ownMany(states) {
        this.owned.push(...states);
    }
    dispose() {
        this.runDisposeEvents();
        this.owned = [];
    }
    runDisposeEvents() {
        this.disposeEvents.forEach((event) => event());
        this.disposeEvents = [];
    }
    onDispose(fn) {
        this.disposeEvents.push(fn);
        const index = this.disposeEvents.length - 1;
        return (newFn) => {
            if (this.disposeEvents.length > index) {
                this.disposeEvents[index] = newFn;
            }
        };
    }
    addEffect(fn) {
        this.owned.forEach((signal) => signal.addEffect(fn));
    }
    removeEffect(fn) {
        this.owned.forEach((signal) => signal.removeEffect(fn));
    }
    getOwned() {
        return this.owned;
    }
}
export class State {
    effects;
    value;
    constructor(state) {
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
    _write(newValue) {
        this.value = newValue;
    }
    write(newValue) {
        this._write(newValue);
        this.effects.forEach((effect) => effect());
    }
    dispose() {
        this.effects = [];
    }
    addEffect(fn) {
        this.effects.push(fn);
    }
    removeEffect(fn) {
        this.effects = this.effects.filter((effect) => effect !== fn);
    }
}
