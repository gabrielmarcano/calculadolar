/**
 * Utility to prepare expressions containing percentage (%) for mathjs evaluation.
 * In consumer calculators (Android, iOS, Casio), % is a context-aware percentage operator:
 * - A + B% => A + (A * B / 100)
 * - A - B% => A - (A * B / 100)
 * - A * B% => A * (B / 100)
 * - A / B% => A / (B / 100)
 * - B%     => (B / 100)
 *
 * In mathjs, % followed by + or - can be parsed greedily as binary modulo (A mod (+B)).
 * By wrapping any subexpression ending in % followed by an additive operator in parentheses ((...%)),
 * mathjs is guaranteed to parse % as postfix percentage without ambiguity.
 */
export function prepareExpressionForEvaluation(expr: string): string {
  if (!expr) return '';

  // Standardize multiplication and division characters
  const s = expr.replace(/×/g, '*').replace(/÷/g, '/');
  if (!s.includes('%')) return s;

  let current = '';
  for (let i = 0; i < s.length; i++) {
    current += s[i];
    if (s[i] === '%') {
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      // If % is followed by + or -, wrap the preceding subexpression in parentheses
      if (j < s.length && /[+\-]/.test(s[j])) {
        current = '(' + current + ')';
      }
    }
  }

  return current;
}
