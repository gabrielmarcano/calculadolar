export interface SanitizeResult {
  isValid: boolean;
  expression: string;
  displayExpression: string;
  previewValue: number | null;
  originalText: string;
  error?: string;
}

export interface SanitizerOptions {
  /**
   * Whether to treat multiline lists (e.g. "15\n20\n35") as additions ("15 + 20 + 35").
   * Default: true.
   */
  joinLinesWithAddition?: boolean;
}
