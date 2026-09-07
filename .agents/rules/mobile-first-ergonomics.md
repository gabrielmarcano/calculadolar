# Mobile-First Ergonomics & PWA Standard (Apple HIG & Material Design 3)

Esta regla define los estándares obligatorios de diseño, ergonomía táctil y arquitectura de interfaz para este repositorio.

> **Premisa Fundamental:** Este proyecto es **100% móvil**. No existe ni importa el diseño de escritorio. Todo componente, vista o flujo debe concebirse exclusivamente para la mano, el pulgar y la pantalla táctil de un smartphone.

---

## 1. Ergonomía del Pulgar ("Thumb Zone First")

Basado en los estudios de ergonomía de Steven Hoober y las guías de *Google Material Design 3* y *Apple Human Interface Guidelines (HIG)*:

1. **Distribución por Zonas de Alcance:**
   - **Zona Natural / Confort (Tercio inferior):** Acciones críticas y repetitivas (teclado numérico, botones de operación, selector de moneda base). Deben operarse cómodamente con una sola mano sin forzar el agarre.
   - **Zona de Alcance Medio (Centro de pantalla):** Visores de resultados, montos convertidos y visualización de datos.
   - **Zona Difícil / Tensión (Tercio superior y esquinas):** Información de estado estática (indicador offline, logos). **Queda prohibido colocar controles interactivos frecuentes o menús desplegables complejos en las esquinas superiores.**

2. **Sustitución de Menús Superiores por Bottom Sheets:**
   - No utilizar menús desplegables hacia abajo (*dropdowns*) anclados a la barra superior.
   - Cualquier configuración, selección de múltiples divisas o menú secundario debe abrirse mediante una **gaveta deslizable inferior (Bottom Sheet)** o un modal anclado a la parte inferior de la pantalla.

---

## 2. Dimensiones Táctiles y Espaciado (Hit Targets & Fitts's Law)

1. **Tamaño Mínimo de Toque (Touch Target Size):**
   - Todo elemento interactivo (botones, iconos tocables, filas de tasas) debe tener un área táctil mínima de **48×48 px** (estándar Material 3 / WCAG 2.2 AA).
   - Si el elemento visual es menor (por ejemplo, un icono de 20×20 px), se debe expandir su área táctil mediante padding o contenedores invisibles (mínimo `p-3` o `min-h-[48px] min-w-[48px] flex items-center justify-center`).

2. **Espaciado Anti-Error:**
   - Separación mínima de **8 px** entre objetivos táctiles adyacentes para evitar pulsaciones erróneas involuntarias.

3. **Prevención de Retardo Táctil:**
   - Uso de `touch-action: manipulation` en todos los contenedores y botones para suprimir el retardo de 300 ms de doble toque en navegadores móviles.

---

## 3. Viewport Lock y Safe Area Insets

1. **Unidades de Altura de Viewport (`svh` con fallback `dvh`):**
   - Utilizar `100svh` (Small Viewport Height) con fallback a `100dvh` para el contenedor principal (`h-[100svh]`).
   - `100svh` garantiza la altura visible exacta con barras de navegación expandidas sin recalcularse dinámicamente en recargas o transiciones, erradicando saltos de diseño (FOUC) y estiramientos del teclado en Chrome Android y Safari iOS. En modo PWA instalada (standalone), `100svh` equivale de forma transparente al tamaño completo de pantalla.
   - Queda prohibido el uso de `100vh` en el marco raíz.

2. **Respeto Riguroso de Safe Areas (Muescas y Barras de Gestos):**
   - **Borde Inferior:** Todo elemento anclado al fondo o keypad debe incluir padding de seguridad:
     ```css
     padding-bottom: max(1rem, env(safe-area-inset-bottom, 16px));
     ```
   - **Borde Superior:** El encabezado debe respetar las muescas (*notches*) e islas dinámicas:
     ```css
     padding-top: max(0.75rem, env(safe-area-inset-top, 12px));
     ```

3. **Control de Desplazamiento y Rebote:**
   - Evitar el rebote elástico (*rubber-band scroll*) en contenedores estáticos aplicando `overscroll-behavior-y: none`.

---

## 4. Microinteracciones y Respuesta Sensorial

1. **Estado `:active` Inmediato y Visualmente Claro:**
   - Cada pulsación debe ofrecer respuesta visual instantánea: `active:scale-[0.96]` o `active:scale-95` acompañado de variación de brillo (`active:brightness-125` o `active:bg-...`).
   - La duración de la transición en el estado activo debe ser rápida (`duration-75` o `duration-100`) para evitar sensación de lentitud o "lag" al teclear.

2. **Retroalimentación Háptica (`triggerHaptic`):**
   - Disparar `triggerHaptic()` en cada pulsación del teclado, cambio de moneda y acción de portapapeles.
   - Mantener las funciones de vibración con salvaguardas para entornos donde la API no esté disponible o esté bloqueada por el sistema operativo (iOS Safari).

3. **Inhibición de Selección de Texto y Callouts:**
   - Aplicar `select-none` (`user-select: none`) y `-webkit-touch-callout: none` en botones, visores y tarjetas interactivas para prevenir la aparición involuntaria de lupas o menús contextuales nativos de iOS/Android al pulsar repetidamente.
   - El copiado y pegado debe gestionarse a través de interfaces diseñadas a medida (burbujas flotantes, toast y pulsaciones largas controladas).

---

## 5. Tipografía Numérica y Estabilidad de Layout (Zero Jitter)

1. **Números Tabulares Obligatorios:**
   - Todas las cantidades numéricas, tasas de cambio y expresiones de cálculo deben utilizar variantes tabulares: `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums` o fuentes monoespaciadas).
   - Esto garantiza que cifras como el `1` y el `8` ocupen exactamente el mismo ancho, erradicando el baile o temblor horizontal del texto mientras el usuario escribe.

2. **Prevención de Desbordamiento:**
   - El visor de cálculo no debe quebrar líneas verticalmente ni empujar el teclado hacia abajo. Debe mantener una sola línea con desplazamiento horizontal suave (`overflow-x-auto scrollbar-hide`) o reducción dinámica de escala tipográfica.

---

## 6. Ergonomía en Modo Oscuro (Dark Theme)

1. **Fondos y Contraste:**
   - Emplear la paleta oscura nativa: fondo base `#0a0a0a`, superficies elevadas `#121212` y `#1e1e1e`.
   - Ratio de contraste mínimo de **4.5:1** para texto regular y **7:1** para números principales y resultados (WCAG AAA).

2. **Diferenciación de Teclado:**
   - Teclas numéricas: superficie neutra oscura (`bg-[#2D2E36]`).
   - Teclas de función: tono distintivo (`bg-[#3F4050]`).
   - Tecla de acción principal (`=`): contraste elevado y acento visual claro (`!bg-[#FFD1E8] !text-black`).
