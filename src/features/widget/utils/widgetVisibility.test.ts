import test from "node:test";
import assert from "node:assert/strict";
import { shouldHideWidget } from "./widgetVisibility.ts";

test("shouldHideWidget hides login and register pages", () => {
  assert.equal(shouldHideWidget("/login"), true);
  assert.equal(shouldHideWidget("/register"), true);
});

test("shouldHideWidget hides password reset routes with token", () => {
  assert.equal(shouldHideWidget("/reset-password/abc123"), true);
});

test("shouldHideWidget keeps widget visible on private pages", () => {
  assert.equal(shouldHideWidget("/tasks"), false);
  assert.equal(shouldHideWidget("/settings"), false);
});
