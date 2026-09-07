# Clean Architecture & React 19 / Next.js 16 Standard

Esta regla define los principios obligatorios de arquitectura de software, desacoplamiento y modularidad en este repositorio.

---

## 1. Arquitectura en Capas (Layered Architecture)

Todo código nuevo o refactorizado debe respetar la separación estricta en 4 capas:

```text
┌────────────────────────────────────────────────────────┐
│ 1. UI Presentacional (components/)                     │  <- "Dumb", sin efectos secundarios
├────────────────────────────────────────────────────────┤
│ 2. Orquestación y Estado (hooks/)                      │  <- Custom Hooks con useState/useRef
├────────────────────────────────────────────────────────┤
│ 3. Dominio y Utilidades Puras (lib/)                   │  <- Funciones puras (mathjs, sanitizers)
├────────────────────────────────────────────────────────┤
│ 4. Servicios y Datos (app/api/, lib/supabase.ts)       │  <- BD, APIs externas, scrapers
└────────────────────────────────────────────────────────┘
```

### Capa 1: Componentes Presentacionales (`components/`)
- **Responsabilidad única:** Renderizar interfaz a partir de `props` y emitir eventos mediante callbacks tipados.
- **Prohibiciones en componentes UI:**
  - Prohibido llamar directamente a `localStorage`, `navigator.clipboard` o `navigator.vibrate`.
  - Prohibido realizar cálculos matemáticos complejos dentro del JSX.
  - Prohibido anidar modales y controladores de estado ajenos a la presentación directa del componente.
- **Límite de complejidad:** Máximo **150–200 líneas por archivo**. Si un componente supera este umbral, debe descomponerse en subcomponentes atómicos.

### Capa 2: Custom Hooks (`hooks/`)
- Encapsulan toda la lógica de negocio, temporizadores, listeners de ventana/portapapeles y sincronización con `localStorage`.
- Exponen una API limpia con valores derivados y métodos de acción estables (`updateInput`, `toggleCurrency`, `dismissModal`).
- Ejemplo: La lógica de `CalculatorView` debe residir en hooks especializados (`useCalculatorEngine`, `useSelectedRates`, `useClipboardActions`).

### Capa 3: Dominio y Lógica Pura (`lib/`)
- Funciones puras, deterministas y completamente desacopladas de React y Next.js.
- Toda lógica de sanitización (`lib/sanitizer`), parsing y evaluación de expresiones (`mathjs`) y conversiones de divisas debe residir aquí.
- Deben ser 100% testeables con pruebas unitarias sin requerir mocks del DOM.

### Capa 4: Servicios y Datos (`app/api/`, `lib/supabase.ts`)
- Endpoints de App Router protegidos por `Authorization: Bearer CRON_SECRET`.
- Tipos de base de datos derivados estrictamente de `database.types.ts`.
- Clave de servicio (`SUPABASE_SERVICE_ROLE_KEY`) restringida exclusivamente al lado del servidor; jamás exponerla al cliente.

---

## 2. Reglas de React 19 y Next.js 16

1. **Derivación Pura de Estado (Anti-Pattern `useEffect`):**
   - Prohibido utilizar `useEffect` para actualizar un estado derivado de otro estado o de `props`. El cálculo debe realizarse directamente durante el cuerpo del render o memorizarse con `useMemo` solo si es computacionalmente pesado.

2. **Fronteras de Cliente (`'use client'`):**
   - Mantener `'use client'` exclusivamente en las hojas del árbol de componentes donde la interactividad (eventos, hooks de estado) sea indispensable.

3. **Prevención de Errores de Hidratación (Hydration-Safe):**
   - Cualquier lectura de `window`, `localStorage` o APIs de dispositivo debe ejecutarse tras el montaje (`useEffect`) o estar protegida con valores por defecto consistentes entre servidor y cliente.

---

## 3. Disciplina de TypeScript

1. **Cero Tolerancia a `any`:**
   - Prohibido el uso de `any` tanto explícito como implícito. Utilizar `unknown`, genéricos o interfaces precisas.

2. **Interfaces Explícitas para Props:**
   - Cada componente debe definir su interfaz con nombres descriptivos:
     ```typescript
     interface KeypadProps {
       onKeyPress: (value: string) => void;
       onBackspace: () => void;
       onClear: () => void;
     }
     ```

3. **Uniones Discriminadas para Estados de Interfaz:**
   - Modelar vistas o estados de carga mediante tipos estrictos (ej. `'loading' | 'success' | 'error' | 'offline'`).

---

## 4. Principios de Mantenibilidad y Refactor

- **Principio de Responsabilidad Única (SRP):** Un archivo debe tener una sola razón para cambiar.
- **Documentación e Integridad:** Conservar comentarios de arquitectura existentes en archivos tocados a menos que se especifique lo contrario.
- **Verificación Continua:** Todo cambio de arquitectura debe compilar con `npm run build` y pasar validación con `npm run lint`.
