# Instrucciones del Proyecto (GEMINI.md)

Este proyecto cuenta con configuración unificada para agentes de IA.

Consulta [AGENTS.md](file:///Users/gabriel/Code/personal/calculadolar/AGENTS.md) para ver la guía completa de arquitectura, convenciones, reglas y habilidades.

## Reglas Principales Activas
- [mobile-first-ergonomics.md](file:///Users/gabriel/Code/personal/calculadolar/.agents/rules/mobile-first-ergonomics.md): Diseño y ergonomía 100% móvil (Thumb Zone, 48px hit targets, Safe Areas `svh/dvh`, `tabular-nums`, microinteracciones y hápticos). Prohibido desktop.
- [clean-architecture.md](file:///Users/gabriel/Code/personal/calculadolar/.agents/rules/clean-architecture.md): Arquitectura en 4 capas (components, hooks, lib, api/services). Componentes de máximo 150-200 líneas, TypeScript estricto sin `any`, React 19 derivación pura.
- [iconography-and-visual-integrity.md](file:///Users/gabriel/Code/personal/calculadolar/.agents/rules/iconography-and-visual-integrity.md): Cero emojis y glifos improvisados. Iconografía vectorial SVG limpia, accesible y uniforme.

## Habilidades Disponibles
- `mobile-ux-audit`: [.agents/skills/mobile-ux-audit/SKILL.md](file:///Users/gabriel/Code/personal/calculadolar/.agents/skills/mobile-ux-audit/SKILL.md)
- `component-decomposition`: [.agents/skills/component-decomposition/SKILL.md](file:///Users/gabriel/Code/personal/calculadolar/.agents/skills/component-decomposition/SKILL.md)
- `pwa-offline-audit`: [.agents/skills/pwa-offline-audit/SKILL.md](file:///Users/gabriel/Code/personal/calculadolar/.agents/skills/pwa-offline-audit/SKILL.md)
