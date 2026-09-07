# Iconografía Vectorial y Estándar de Calidad Visual (Apple HIG & Material Design 3)

Esta regla define los estándares obligatorios de diseño iconográfico, fidelidad visual e integridad de componentes para CalculaDolar.

---

## 1. Prohibición Estricta de Emojis y Glifos Improvisados

1. **Cero Emojis en Código e Interfaz:**
   - Queda terminantemente prohibido el uso de caracteres emoji unicode (ej. 📱, 📊, 🚀, ⚙️, 💰, 📉, etc.) en la interfaz gráfica, componentes, etiquetas de botones, títulos, toasts, placeholders o mensajes de estado.
   - Los emojis degradan la percepción de calidad del producto, rompen la armonía tipográfica y se renderizan de forma inconsistente entre versiones de Android, iOS y navegadores web.

2. **Prohibición de Glifos Unicode Improvisados:**
   - No utilizar caracteres de texto como sustitutos de flechas o iconos interactivos (ej. `▼`, `▲`, `‹`, `›`, `→`, `&rsaquo;`, `>>`).
   - Todo indicador direccional, flecha, chevron o icono de acción debe implementarse exclusivamente mediante **vectores SVG limpios**.
   - **Excepción:** Se permite únicamente el uso de operadores matemáticos estándar en los botones de la calculadora (`÷`, `×`, `−`, `+`, `=`, `%`, `(`, `)`).

---

## 2. Estándar de Iconografía Vectorial SVG

1. **Diseño Vectorial Limpio y Coherente:**
   - Todos los iconos deben ser elementos SVG vectoriales con trazo (*stroke*) o relleno (*fill*) calibrado y uniforme.
   - Preferir estilos vectoriales consistentes inspirados en la biblioteca Lucide o Material Symbols.
   - Dimensiones de visualización estandarizadas: **20×20 px** o **24×24 px** para acciones generales; **16×16 px** para metadatos secundarios.
   - Mantener `strokeWidth={2}` y extremos redondeados (`strokeLinecap="round" strokeLinejoin="round"`).

2. **Accesibilidad e Interacción en Pantallas Táctiles:**
   - Si un icono es interactivo, debe envolverse en un contenedor con un área táctil mínima de **48×48 px** (`p-3` o `min-w-[48px] min-h-[48px] flex items-center justify-center`).
   - Los iconos deben incluir `aria-hidden="true"` y la acción padre debe contar con `aria-label` o `title` descriptivo en español.
   - Todos los iconos decorativos dentro de botones deben tener la clase `pointer-events-none` para no interceptar eventos táctiles.

---

## 3. Jerarquía Visual y Acabado de Primera Línea

1. **Paleta de Color y Superficies:**
   - Fondo de aplicación profundo: `#0a0a0a`.
   - Superficies de tarjetas y paneles elevados: `#121212` y `#1e1e1e`.
   - Bordes sutiles con translucidez: `border-white/5` a `border-white/10`.
   - Efectos de desenfoque de fondo (*glassmorphism*): `backdrop-blur-md` o `backdrop-blur-xl`.

2. **Tipografía y Estabilidad Numérica:**
   - Fuente sans-serif principal: Geist Sans.
   - Fuente monoespaciada para cifras y visores: Geist Mono.
   - Obligatorio `tabular-nums` en cualquier cotización, porcentaje, cálculo o valor monetario.

3. **Microinteracciones Inmediatas:**
   - Respuesta activa en `:active`: `active:scale-[0.98]` o `active:scale-95`.
   - Duración ultracorta: `duration-75` o `duration-100`.
   - Acompañamiento sensorial obligatorio mediante `triggerHaptic()`.
