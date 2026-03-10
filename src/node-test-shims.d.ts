declare module "node:test" {
  export type TestContext = unknown;

  export type TestFn = (
    name: string,
    fn: (context: TestContext) => void | Promise<void>
  ) => void;

  const test: TestFn & {
    afterEach: (fn: () => void | Promise<void>) => void;
  };

  export const afterEach: (fn: () => void | Promise<void>) => void;
  export default test;
}

declare module "node:assert/strict" {
  const assert: {
    equal: (actual: unknown, expected: unknown, message?: string) => void;
    deepEqual: (actual: unknown, expected: unknown, message?: string) => void;
  };

  export default assert;
}
