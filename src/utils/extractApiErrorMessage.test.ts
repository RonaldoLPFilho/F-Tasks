import test from "node:test";
import assert from "node:assert/strict";
import { extractApiErrorMessage } from "./extractApiErrorMessage.ts";

test("extractApiErrorMessage returns api message when present", () => {
  const error = {
    response: {
      data: {
        message: "Credenciais inválidas",
      },
    },
  };

  assert.equal(
    extractApiErrorMessage(error, "Erro genérico"),
    "Credenciais inválidas"
  );
});

test("extractApiErrorMessage falls back when shape is unknown", () => {
  assert.equal(extractApiErrorMessage(new Error("boom"), "Erro genérico"), "Erro genérico");
  assert.equal(extractApiErrorMessage(null, "Erro genérico"), "Erro genérico");
});
