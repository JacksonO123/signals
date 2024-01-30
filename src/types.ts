export type Accessor<T> = () => T;

type UpdateCb<T> = (currentValue: T) => T;

export type Setter<T> = (currentValue: T | UpdateCb<T>) => void;
