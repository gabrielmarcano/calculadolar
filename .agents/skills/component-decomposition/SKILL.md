---
name: component-decomposition
description: >-
  Guía y procedimiento paso a paso para descomponer componentes React monolíticos (>200 líneas)
  en capas desacopladas: Custom Hooks (lógica de estado, gestos y efectos) y Componentes Presentacionales puros.
  Úsalo cuando el usuario pida refactorizar vistas complejas como CalculatorView, modularizar código
  o mejorar la arquitectura y mantenibilidad del frontend sin romper el comportamiento existente.
---

# Procedimiento de Descomposición de Componentes Monolíticos

Esta habilidad define un protocolo riguroso para transformar componentes React extensos y sobrecargados en una arquitectura limpia y modular de capas, previniendo regresiones en interactividad, gestos táctiles y portapapeles.

Para ejemplos de implementación y patrones de desacoplamiento, consulta [patterns.md](./references/patterns.md).

---

## Flujo de Trabajo en 4 Fases

### Fase 1: Mapeo de Responsabilidades y Dependencias
Antes de modificar cualquier archivo:
1. **Identificar el estado mutable y refs:**
   - Listar todos los `useState`, `useRef`, y llamadas a `localStorage`.
2. **Identificar listeners y efectos secundarios:**
   - Detectar `useEffect`, event listeners de ventana (`visibilitychange`, `resize`, `scroll`).
3. **Mapear la lógica de negocio y derivaciones:**
   - Separar el cálculo matemático/evaluación de expresiones de la representación visual.
4. **Diseñar los límites de corte:**
   - **Hook de lógica:** Extraerá el estado, la interacción con portapapeles y los cálculos.
   - **Subcomponentes visuales:** Recibirán exclusivamente props y emitirán callbacks.

### Fase 2: Extracción de Custom Hooks (Lógica y Orquestación)
1. Crear el nuevo archivo en `hooks/` (ej. `hooks/useCalculatorLogic.ts`).
2. Mover los estados, métodos de actualización y listeners al hook.
3. Definir una interfaz explícita de retorno:
   ```typescript
   export interface CalculatorState {
     input: string;
     result: string;
     hasError: boolean;
     isReversed: boolean;
     // Acciones
     handleClick: (value: string) => void;
     handleBackspace: () => void;
     handleClear: () => void;
   }
   ```
4. Asegurar que las callbacks no creen recreaciones innecesarias si se pasan a componentes memorizados.

### Fase 3: Descomposición en Componentes Presentacionales Puros
1. Crear subcomponentes especializados en `components/` (o una subcarpeta co-localizada):
   - **`CalculatorDisplay.tsx`:** Visor de expresión de entrada, resultados y sugerencias contextuales.
   - **`CalculatorKeypad.tsx`:** Cuadrícula de botones táctiles con estados `:active` y hápticos.
   - **`RatesConversionList.tsx`:** Lista de tasas calculadas con gestos de copiado.
2. Cada subcomponente debe:
   - Tener su propia interfaz de TypeScript para `props`.
   - Mantenerse por debajo del límite de **150 líneas**.
   - Carecer de llamadas a APIs del navegador (`localStorage`, `navigator`).

### Fase 4: Reensamblaje y Validación de No Regresión
1. El componente principal (ej. `CalculatorView.tsx`) pasa a ser un **orquestador limpio**:
   - Invoca el Custom Hook.
   - Conecta los retornos del hook con los subcomponentes mediante props.
   - Su tamaño debe reducirse drásticamente (de >550 líneas a <120 líneas).
2. **Verificaciones obligatorias:**
   - Ejecutar `npm run lint` para descartar advertencias de hooks o tipos.
   - Ejecutar `npm run build` para asegurar compilación exitosa.
   - Validar que los gestos de pulsación larga, copiado y feedback háptico se mantengan operativos.
