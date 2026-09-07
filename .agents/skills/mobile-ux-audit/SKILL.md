---
name: mobile-ux-audit
description: >-
  Audita y optimiza pantallas, componentes y flujos de interfaz exclusivamente móvil y PWA,
  aplicando los estándares de Apple Human Interface Guidelines (HIG) y Google Material Design 3.
  Úsalo cuando el usuario solicite evaluar o mejorar la UI/UX móvil, revisar la ergonomía táctil,
  adaptar componentes para uso con una sola mano (Thumb Zone), ajustar Safe Areas o refinar microinteracciones.
---

# Mobile UX & Ergonomics Audit (Apple HIG & Material Design 3)

Esta habilidad proporciona un flujo estructurado de auditoría y mejora para interfaces 100% móviles en aplicaciones web progresivas (PWA) y Next.js.

Para una guía detallada de las heurísticas y especificaciones formales, consulta [heuristics.md](./references/heuristics.md).

---

## Procedimiento de Auditoría Paso a Paso

Cuando se active esta habilidad sobre un componente, pantalla o flujo, sigue este procedimiento riguroso:

### Paso 1: Mapeo de la Zona del Pulgar (Thumb Zone Analysis)
1. Analizar la disposición vertical de los controles interactivos:
   - **Tercio inferior (Zona Natural):** Teclado, botones primarios de acción, interruptores de modo.
   - **Tercio medio (Zona de Alcance):** Visor de valores, gráficos y tarjetas de datos.
   - **Tercio superior (Zona de Tensión):** Títulos, indicador offline y logotipos.
2. **Bandera roja:** ¿Hay menús desplegables o botones de acción primaria en la mitad superior de la pantalla?
   - Si existen, rediseñarlos hacia un **Bottom Sheet (gaveta inferior)** o ubicarlos en la barra inferior.

### Paso 2: Verificación de Dimensiones Táctiles (Hit Target & Fitts's Law)
1. Medir el área táctil de cada elemento interactivo:
   - Todo botón, enlace o elemento interactivo debe tener un área táctil mínima de **48×48 px** (Material 3) o **44×44 pt** (Apple HIG).
   - Comprobar que los iconos pequeños cuenten con padding perimetral (ej. `min-w-[48px] min-h-[48px] p-2.5`).
2. Verificar una separación mínima de **8 px** entre elementos táctiles adyacentes para prevenir toques involuntarios.
3. Asegurar `touch-action: manipulation` para eliminar retardos de pulsación de 300 ms.

### Paso 3: Auditoría de Viewport Lock y Safe Area Insets
1. Verificar que el contenedor de pantalla use `h-[100dvh]` y nunca `100vh` ni `100%`.
2. Verificar protección perimetral de hardware:
   - Superior: `pt-[max(0.75rem,env(safe-area-inset-top))]` (protección para muescas e isla dinámica).
   - Inferior: `pb-[max(1rem,env(safe-area-inset-bottom))]` (protección para barra de gestos nativa).
3. Verificar `overscroll-behavior-y: none` en áreas que no deban rebotar elásticamente.

### Paso 4: Evaluación de Microinteracciones y Respuesta Sensorial
1. **Respuesta visual `:active`:**
   - Comprobar que todos los botones cambien visiblemente de estado (`active:scale-[0.96]` o `active:scale-95`).
   - La transición debe ser inmediata (`duration-75` o `duration-100`).
2. **Retroalimentación háptica:**
   - Verificar llamada a `triggerHaptic()` en cada toque interactivo relevante.
   - Asegurar que la ausencia de soporte de vibración (Safari iOS) no arroje excepciones en consola.
3. **Inhibición de artefactos web nativos:**
   - Verificar `select-none` y `-webkit-touch-callout: none` para impedir selección de texto accidental o menús del sistema.

### Paso 5: Estabilidad Numérica y Prevención de Jittering
1. Verificar que todo número o monto desplegado utilice `tabular-nums` (`font-variant-numeric: tabular-nums`).
2. Comprobar que los visores mantengan una sola línea con scroll horizontal (`overflow-x-auto scrollbar-hide`) o reducción fluida de escala tipográfica, sin romper verticalmente la cuadrícula del teclado.

---

## Formato del Reporte de Auditoría

Al completar la auditoría, genera un reporte estructurado con las siguientes secciones:

```markdown
### 📱 Reporte de Auditoría Móvil: [Nombre de la Vista o Componente]

#### 1. Diagnóstico de Ergonomía y Usabilidad
| Factor | Estado (🟢/🟡/🔴) | Hallazgo Técnico |
| :--- | :--- | :--- |
| **Thumb Zone** | 🟢/🟡/🔴 | [Descripción del alcance con una mano] |
| **Hit Targets** | 🟢/🟡/🔴 | [Medidas de botones y espaciados encontrados] |
| **Safe Areas & dvh** | 🟢/🟡/🔴 | [Respeto de muescas y barra de navegación] |
| **Microinteracciones** | 🟢/🟡/🔴 | [Estados active, haptics y transiciones] |
| **Estabilidad Numérica** | 🟢/🟡/🔴 | [Uso de tabular-nums y prevención de saltos] |

#### 2. Plan de Refactorización / Código Propuesto
[Bloque de código con clases Tailwind y componentes ajustados]
```
