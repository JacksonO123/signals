import { Context, Owner } from "../src";
import { test, expect } from "bun:test";

test("owner adds and removes contexts + locking", () => {
  const owner = new Owner();

  const context1 = new Context();
  const context2 = new Context();
  const context3 = new Context();

  owner.addContext(context1);
  owner.addContext(context2);

  owner.lock();

  expect(owner.getContext().length).toBe(2);

  owner.popContext();

  expect(owner.getContext().length).toBe(2);

  owner.addContext(context3);

  expect(owner.getContext().length).toBe(3);

  owner.unlock();
  owner.popContext();
  owner.popContext();
  owner.popContext();

  expect(owner.getContext().length).toBe(0);
});
