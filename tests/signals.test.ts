import {
  createEffect,
  createSignal,
  derived,
  onCleanup,
  trackScope,
} from "../src";
import { test, expect } from "bun:test";

test("signals update", () => {
  const [value, setValue] = createSignal(2);

  expect(value()).toBe(2);

  setValue(4);

  expect(value()).toBe(4);

  setValue((prev) => prev + 1);

  expect(value()).toBe(5);
});

test("signals are tracked", () => {
  const [value] = createSignal(2);

  let cleaned = false;
  const cleanup = trackScope(() => {
    console.log(`value is: ${value()}`);

    trackScope(() => {
      onCleanup(() => (cleaned = true));
    });
  });

  cleanup();

  expect(cleaned).toBeTrue();
});

test("effects", () => {
  const [value, setValue] = createSignal(2);

  let cleaned = false;
  let timesCalled = 0;
  let timesCleaned = 0;
  const cleanup = trackScope(() => {
    createEffect(() => {
      console.log("- " + value());

      timesCalled++;

      onCleanup(() => {
        timesCleaned++;
        cleaned = true;
      });
    });
  });

  setValue(4);

  setValue(6);

  cleanup();

  setValue(8);

  expect(timesCalled).toBe(3);
  expect(cleaned).toBeTrue();
  expect(timesCleaned).toBe(1);
});

test("derived signals", () => {
  const cleanup = trackScope(() => {
    const [value1, setValue1] = createSignal(2);
    const [value2, setValue2] = createSignal(true);

    let timesCleaned = 0;

    const newValue = derived(() => {
      createEffect(() => {
        onCleanup(() => {
          timesCleaned++;
          console.log("cleaned in derived");
        });
      });

      return `num: ${value1()}, thing: ${value2()}`;
    });

    createEffect(() => {
      console.log(newValue());
    });

    expect(newValue()).toBe("num: 2, thing: true");

    setValue1(4);

    expect(newValue()).toBe("num: 4, thing: true");

    setValue2(false);

    expect(newValue()).toBe("num: 4, thing: false");
    expect(timesCleaned).toBe(2);
  });

  cleanup();
});
