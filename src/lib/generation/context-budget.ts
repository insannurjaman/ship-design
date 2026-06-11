const DEFAULT_MAX_CONTEXT_CHARS = 12000;
const TRUNCATION_NOTE = "Context was shortened to fit provider limits.";

export function applyContextBudget(context: string) {
  const maxChars = readMaxContextChars();

  if (context.length <= maxChars) {
    return {
      context,
      truncated: false
    };
  }

  const note = `\n\n${TRUNCATION_NOTE}`;
  const availableChars = Math.max(0, maxChars - note.length);

  return {
    context: `${context.slice(0, availableChars).trim()}${note}`,
    truncated: true
  };
}

export function readMaxContextChars() {
  const parsed = Number.parseInt(process.env.MAX_CONTEXT_CHARS_PER_AGENT ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_CONTEXT_CHARS;
}

export { TRUNCATION_NOTE };
