import { Context, State, owner, currentContext } from "./reactive";
export const trackScope = (fn) => {
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
export const cleanup = (context) => {
    context.dispose();
};
export const onCleanup = (fn) => {
    const context = currentContext();
    if (!context)
        return;
    return context.onDispose(fn);
};
export const createSignal = (value) => {
    const current = new State(value);
    return [
        () => current.read(),
        (value) => current.write(typeof value === "function"
            ? value(current._read())
            : value),
    ];
};
export const createEffect = (fn) => {
    const cleanup = trackScope(() => {
        fn();
        const current = currentContext();
        if (!current)
            return;
        current.addEffect(fn);
    });
    onCleanup(cleanup);
};
export const derived = (fn) => {
    const [value, setValue] = createSignal(null);
    let prevCleanup = null;
    let updateCleanup = undefined;
    const handleDerived = () => {
        if (prevCleanup)
            prevCleanup();
        const cleanup = trackScope(() => {
            setValue(fn());
            const current = currentContext();
            if (!current)
                return;
            current.addEffect(handleDerived);
        });
        prevCleanup = cleanup;
        updateCleanup?.(cleanup);
    };
    handleDerived();
    updateCleanup = onCleanup(prevCleanup);
    return value;
};
export const getSignalInternals = (fn) => {
    let res = null;
    const cleanup = () => trackScope(() => {
        fn();
        const current = currentContext();
        if (!current)
            return;
        res = current.getOwned()[0];
    });
    cleanup();
    return res;
};
