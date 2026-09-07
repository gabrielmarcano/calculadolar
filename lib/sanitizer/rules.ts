/**
 * Sanitization rules, patterns, and dictionaries.
 */

// Símbolos y códigos de moneda (locales e internacionales)
export const CURRENCY_PATTERNS = [
  // Bolívares y variantes (maneja 'Bs.', 'Bs', 'Bs.S', 'Bs.D', etc. seguidos de espacio o puntuación)
  /\bbs\.?(?:[sfd])?(?!\w)/gi,
  /\b(?:ves|bolivares|bolívares)\b/gi,
  // Dólares y variantes
  /\b(?:usd|usdt|dolares|dólares|bucks?)\b/gi,
  // Euros
  /\b(?:eur|euros?)\b/gi,
  // Símbolos monetarios
  /[$€£¥]/g,
];

// Etiquetas bancarias y de comercio comunes ("Total a pagar: 150", "Monto: 45")
export const LABEL_PATTERNS = [
  /\b(?:total(?:\s+a\s+pagar)?|monto(?:\s+a\s+transferir)?|subtotal|precio|cuenta|pago|saldo|importe|tarifa)\s*[:=-]?\s*/gi,
  /\b(?:ref|referencia)\s*[:=-]?\s*/gi,
];

// Operadores de texto que deben normalizarse
export const OPERATOR_REPLACEMENTS: [RegExp, string][] = [
  // Multiplicación: '×', 'x' o 'X'
  [/[×xX]/g, '*'],
  // División: '÷' o dos puntos ':' cuando está rodeado de números o espacios
  [/[÷]/g, '/'],
  [/(?<=\d|\))\s*:\s*(?=\d|\()/g, '/'],
  // Guiones y signos menos tipográficos: en-dash, em-dash, minus sign (\u2212)
  [/[\u2013\u2014\u2212–—]/g, '-'],
];
