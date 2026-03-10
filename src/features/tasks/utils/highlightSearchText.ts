export interface TextPart {
  text: string;
  highlighted: boolean;
}

export function splitHighlightedText(text: string, terms: string[]): TextPart[] {
  if (!text) {
    return [];
  }

  const normalizedTerms = Array.from(
    new Set(
      terms
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length > 0)
        .sort((a, b) => b.length - a.length)
    )
  );

  if (normalizedTerms.length === 0) {
    return [{ text, highlighted: false }];
  }

  const parts: TextPart[] = [];
  const lowerText = text.toLowerCase();
  let index = 0;

  while (index < text.length) {
    let matchedTerm: string | null = null;

    for (const term of normalizedTerms) {
      if (lowerText.startsWith(term, index)) {
        matchedTerm = term;
        break;
      }
    }

    if (matchedTerm) {
      parts.push({
        text: text.slice(index, index + matchedTerm.length),
        highlighted: true,
      });
      index += matchedTerm.length;
      continue;
    }

    const nextIndex = normalizedTerms
      .map((term) => lowerText.indexOf(term, index))
      .filter((position) => position >= 0)
      .sort((a, b) => a - b)[0];

    const endIndex = nextIndex === undefined ? text.length : nextIndex;
    parts.push({
      text: text.slice(index, endIndex),
      highlighted: false,
    });
    index = endIndex;
  }

  return parts.filter((part) => part.text.length > 0);
}
