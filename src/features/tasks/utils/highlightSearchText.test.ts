import test from "node:test";
import assert from "node:assert/strict";
import { splitHighlightedText } from "./highlightSearchText.ts";

test("splitHighlightedText highlights matched terms preserving order", () => {
  const parts = splitHighlightedText("Corrigir login com JWT", ["login", "jwt"]);

  assert.deepEqual(parts, [
    { text: "Corrigir ", highlighted: false },
    { text: "login", highlighted: true },
    { text: " com ", highlighted: false },
    { text: "JWT", highlighted: true },
  ]);
});

test("splitHighlightedText returns plain text when no terms are provided", () => {
  const parts = splitHighlightedText("Sem destaque", []);

  assert.deepEqual(parts, [{ text: "Sem destaque", highlighted: false }]);
});
