import {
  createSignal,
  trackDependencies,
  contexts,
  createEffect,
} from "../src";
import { test, expect } from "bun:test";

test("working signal", () => {
  const [getValue, setValue] = createSignal(2);

  expect(getValue()).toBe(2);

  setValue(4);

  expect(getValue()).toBe(4);
});

test("track dependencies", () => {
  const [getValue, setValue] = createSignal(2);

  let timesRan = 0;
  const cleanup = trackDependencies(() => {
    console.log(getValue());
    timesRan++;
  });

  setValue(4);
  expect(getValue()).toBe(4);
  expect(contexts.length).toBe(1);

  cleanup();

  setValue(6);
  expect(getValue()).toBe(6);
  expect(contexts.length).toBeEmpty();
  expect(timesRan).toBe(2);
});

test("effects", () => {
  const [getValue, setValue] = createSignal(2);

  const cleanup = trackDependencies(() => {
    createEffect(() => console.log("1) " + getValue()));

    createEffect(() => {
      createEffect(() => {
        createEffect(() => {
          createEffect(() => {
            console.log("2) " + (getValue() + 1));
          });
        });
      });
    });
  });

  setValue(4);

  expect(getValue()).toBe(4);
  expect(contexts.length).toBe(6);

  cleanup();

  expect(contexts).toBeEmpty();
});