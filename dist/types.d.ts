export type Accessor<T> = () => T;
export type Setter<T> = (currentValue: T | ((currentValue: T) => T)) => void;
