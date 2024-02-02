import { createSignal, getSignalInternals } from "../src";

const [value] = createSignal(2);

const test = getSignalInternals(value);

console.log(test);
