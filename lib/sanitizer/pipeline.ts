import { evaluate } from 'mathjs';
import { CURRENCY_PATTERNS, LABEL_PATTERNS, OPERATOR_REPLACEMENTS } from './rules';
import { SanitizeResult, SanitizerOptions } from './types';

/**
 * Fase 1: Normaliza Unicode y maneja saltos de línea / caracteres invisibles.
 */
export function normalizeUnicode(raw: string, options?: SanitizerOptions): string {
  if (!raw) return '';

  // Normalización estándar Unicode (convierte caracteres compuestos y formas compatibles)
  let text = raw.normalize('NFKC');

  // Reemplazar espacios no separables y caracteres invisibles comunes en copias web/móvil
  text = text.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');

  // Tratamiento de saltos de línea
  if (options?.joinLinesWithAddition !== false) {
    // Si contiene múltiples líneas con montos (ej. listas de compras), se unen con '+'
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length > 1) {
      text = lines.reduce((acc, current) => {
        if (!acc) return current;
        // Si la línea anterior ya termina con operador o la actual empieza con operador, no duplicar '+'
        if (/[+\-*/÷×]$/.test(acc) || /^[+\-*/÷×]/.test(current)) {
          return `${acc} ${current}`;
        }
        return `${acc} + ${current}`;
      }, '');
    }
  } else {
    text = text.replace(/\r?\n/g, ' ');
  }

  return text.trim();
}

/**
 * Fase 2: Remueve etiquetas de texto ("Total a pagar:", "Monto:") y símbolos/códigos de moneda.
 */
export function stripNoiseAndCurrencies(text: string): string {
  let result = text;

  // Remover etiquetas de comercio y transferencias
  for (const pattern of LABEL_PATTERNS) {
    result = result.replace(pattern, ' ');
  }

  // Remover códigos y símbolos de divisas
  for (const pattern of CURRENCY_PATTERNS) {
    result = result.replace(pattern, ' ');
  }

  return result;
}

/**
 * Fase 3: Desambigua formatos de números locales (separadores de miles vs. decimales).
 * Ejemplos:
 *  - "1.250,50" -> "1250.50" (formato venezolano/europeo con miles y decimales)
 *  - "1,250.50" -> "1250.50" (formato internacional US)
 *  - "1.250" -> "1250" (miles con punto, sin decimales)
 *  - "45,50" -> "45.50" (coma como decimal)
 */
export function resolveNumberFormat(text: string): string {
  let result = text;

  // 1. Formato con punto de miles y coma decimal: 1.250,50 o 10.000.000,25
  result = result.replace(/\b(\d{1,3}(?:\.\d{3})+),(\d+)\b/g, (_, thousands, decimals) => {
    return `${thousands.replace(/\./g, '')}.${decimals}`;
  });

  // 2. Formato con coma de miles y punto decimal: 1,250.50 o 10,000,000.25
  result = result.replace(/\b(\d{1,3}(?:,\d{3})+)\.(\d+)\b/g, (_, thousands, decimals) => {
    return `${thousands.replace(/,/g, '')}.${decimals}`;
  });

  // 3. Formato con puntos de miles únicamente (grupos exactos de 3 dígitos precedidos por 1-3 dígitos): 150.000 -> 150000
  // Evita alterar números decimales como "1.25" o "3.1416"
  result = result.replace(/\b(\d{1,3}(?:\.\d{3})+)\b(?!\.)/g, (match) => {
    return match.replace(/\./g, '');
  });

  // 4. Comas restantes entre dígitos actúan como separador decimal: "45,50" -> "45.50"
  result = result.replace(/(\d+),(\d+)/g, '$1.$2');

  return result;
}

/**
 * Fase 4: Normaliza operadores de texto a operadores matemáticos estándar (*, /, -, +).
 */
export function normalizeOperators(text: string): string {
  let result = text;

  // Reemplazar operadores tipográficos
  for (const [pattern, replacement] of OPERATOR_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  // Manejo de 'x' o 'X' rodeada de espacios o números que no haya sido atrapada
  result = result.replace(/(?<=\d|\)|\s)[xX](?=\d|\(|\s)/g, '*');

  return result;
}

/**
 * Fase 5: Limpieza de tokens residuales, validación léxica y evaluación sintáctica con mathjs.
 */
export function validateAndParse(cleanText: string, original: string): SanitizeResult {
  // Filtrar exclusivamente caracteres permitidos en la calculadora
  let sanitized = cleanText.replace(/[^0-9+\-*/().%\s]/g, ' ');

  // Normalizar espacios intermedios y operadores repetidos inválidos
  sanitized = sanitized
    .replace(/\s+/g, ' ')
    .replace(/([+\-*/])\s*([+*/])/g, '$2') // Si hay "+ *" prevalece el último
    .trim();

  // Eliminar operadores flotantes iniciales o finales no deseados
  sanitized = sanitized
    .replace(/^\.\s+/, '') // Punto suelto inicial
    .replace(/^[*/%]+/, '') // No puede iniciar con *, /, %
    .replace(/[+\-*/.]+$/, '') // No puede terminar con operador
    .trim();

  // Validar si contiene al menos un dígito numérico
  if (!/\d/.test(sanitized)) {
    return {
      isValid: false,
      expression: '',
      displayExpression: '',
      previewValue: null,
      originalText: original,
      error: 'No se encontraron montos numéricos válidos en el texto',
    };
  }

  // Validación y evaluación con mathjs
  try {
    const evaluated = evaluate(sanitized);
    const numeric = typeof evaluated === 'number' && !isNaN(evaluated) ? evaluated : null;

    // Generar formato de pantalla para la calculadora (× y ÷)
    const displayExpression = sanitized
      .replace(/\*/g, '×')
      .replace(/\//g, '÷');

    return {
      isValid: true,
      expression: sanitized,
      displayExpression,
      previewValue: numeric,
      originalText: original,
    };
  } catch {
    // Si la expresión es sintácticamente incompleta o errónea
    return {
      isValid: false,
      expression: sanitized,
      displayExpression: sanitized.replace(/\*/g, '×').replace(/\//g, '÷'),
      previewValue: null,
      originalText: original,
      error: 'La expresión matemática no pudo ser evaluada',
    };
  }
}

/**
 * Ejecutor maestro de la tubería de sanitización de portapapeles.
 */
export function sanitizeClipboardExpression(rawText: string, options?: SanitizerOptions): SanitizeResult {
  if (!rawText || !rawText.trim()) {
    return {
      isValid: false,
      expression: '',
      displayExpression: '',
      previewValue: null,
      originalText: rawText || '',
      error: 'El portapapeles está vacío',
    };
  }

  const phase1 = normalizeUnicode(rawText, options);
  const phase2 = stripNoiseAndCurrencies(phase1);
  const phase3 = resolveNumberFormat(phase2);
  const phase4 = normalizeOperators(phase3);
  return validateAndParse(phase4, rawText);
}
