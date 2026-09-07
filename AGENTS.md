# Instrucciones para Agentes de IA (AGENTS.md)

Este repositorio contiene **CalculaDolar**, una aplicación web progresiva (PWA) construida con **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 y Serwist**.

> **Alcance Exclusivo:** Esta aplicación está diseñada **única y exclusivamente para dispositivos móviles** (diseño en una sola columna, `max-w-md mx-auto`, `100dvh`). El soporte o diseño para pantallas de escritorio está expresamente fuera de alcance y no debe implementarse.

---

## 1. Reglas de Proyecto Activas (.agents/rules/)

Todo cambio de código debe cumplir estrictamente con las reglas especializadas ubicadas en `.agents/rules/`:

1. [mobile-first-ergonomics.md](file:///.agents/rules/mobile-first-ergonomics.md):
   - **Thumb-Zone First:** Acciones principales y menús accesibles en la mitad inferior de la pantalla. Prohibidos menús desplegables superiores; usar *Bottom Sheets* o gavetas inferiores.
   - **Objetivos Táctiles:** Área mínima de toque de **48×48 px** con al menos 8 px de separación.
   - **Safe Areas & svh/dvh:** Respeto estricto de `100svh` (con fallback `100dvh`), muescas superiores (`env(safe-area-inset-top)`) y barra de gestos inferior (`env(safe-area-inset-bottom)`).
   - **Estabilidad Numérica:** Uso obligatorio de `tabular-nums` en montos y expresiones para evitar temblores visuales (*jitter*).
   - **Microinteracciones:** Transición inmediata en `:active` (`scale(0.96)`), `select-none`, `-webkit-touch-callout: none` y `triggerHaptic()`.

2. [clean-architecture.md](file:///.agents/rules/clean-architecture.md):
   - **Separación en 4 Capas:** Presentacional (`components/`), Custom Hooks (`hooks/`), Dominio puro (`lib/`) y Servicios (`app/api/`, `lib/supabase.ts`).
   - **React 19:** Prohibido usar `useEffect` para derivar estados; calcular directamente en el cuerpo del render.
   - **Modularidad:** Componentes limitados a un máximo de **150–200 líneas**. Si crecen más allá, descomponerlos.
   - **TypeScript Estricto:** Prohibido el uso de `any` (explícito o implícito). Interfaces explícitas para props.

---

## 2. Habilidades del Espacio de Trabajo (.agents/skills/)

El repositorio cuenta con las siguientes habilidades estructuradas para flujos de trabajo especializados:

| Habilidad | Ubicación | Cuándo Utilizarla |
| :--- | :--- | :--- |
| **`mobile-ux-audit`** | [.agents/skills/mobile-ux-audit/SKILL.md](file:///.agents/skills/mobile-ux-audit/SKILL.md) | Evaluar y optimizar pantallas para usabilidad móvil a una sola mano (Apple HIG y Material Design 3). |
| **`component-decomposition`** | [.agents/skills/component-decomposition/SKILL.md](file:///.agents/skills/component-decomposition/SKILL.md) | Refactorizar vistas o componentes monolíticos extensos hacia Custom Hooks y componentes atómicos. |
| **`pwa-offline-audit`** | [.agents/skills/pwa-offline-audit/SKILL.md](file:///.agents/skills/pwa-offline-audit/SKILL.md) | Auditar la resiliencia offline de Serwist, almacenamiento local y caché en modo avión. |

---

## 3. Principios de Ingeniería No Negociables

1. **Robustez y calidad antes que rapidez:** Queda estrictamente prohibido realizar implementaciones apresuradas, adivinando requerimientos o asumiendo comportamientos sin contexto suficiente.
2. **Investigación previa obligatoria:** Si una tarea presenta incógnitas técnicas, dependencias complejas o carece de un plan de ejecución validado, debe investigarse a fondo antes de escribir código.
3. **Mantenimiento estricto de TODO.md:**
   - Sin emojis bajo ninguna circunstancia.
   - Formato de tareas con checkboxes (`- [ ]` / `- [x]`).
   - Plantilla obligatoria: **Título**, **Descripción**, **Alcance** y (si aplica) **Investigación previa**.
   - Redacción homogénea, técnica y en tercera persona.
