# Patrones de Descomposición en React 19 y Next.js

Este documento detalla los patrones arquitectónicos para desacoplar componentes complejos en aplicaciones React.

---

## 1. Patrón Contenedor / Presentacional Moderno (Hooks + Pure UI)

En lugar del patrón heredado de componentes de orden superior (HOCs) o clases contenedor, el enfoque moderno de React 19 separa:

1. **Headless Hook (Lógica sin UI):**
   ```typescript
   // hooks/useCalculatorEngine.ts
   export function useCalculatorEngine(rates: Record<string, RateData>) {
     const [input, setInput] = useState('');
     const [result, setResult] = useState('');

     const numericResult = useMemo(() => {
       const parsed = parseFloat(result);
       return isNaN(parsed) ? 0 : parsed;
     }, [result]);

     const pressKey = (key: string) => {
       triggerHaptic();
       // Lógica de sanitización y matemática...
     };

     return {
       input,
       result,
       numericResult,
       pressKey,
     };
   }
   ```

2. **Componente Presentacional Puro:**
   ```typescript
   // components/CalculatorKeypad.tsx
   interface CalculatorKeypadProps {
     onPressKey: (key: string) => void;
   }

   export function CalculatorKeypad({ onPressKey }: CalculatorKeypadProps) {
     return (
       <div className="grid grid-cols-4 gap-2">
         {/* Botones declarativos con microinteracciones */}
       </div>
     );
   }
   ```

3. **Orquestador (Vista Raíz):**
   ```typescript
   // components/CalculatorView.tsx
   export default function CalculatorView({ rates }: CalculatorViewProps) {
     const engine = useCalculatorEngine(rates);

     return (
       <div className="h-[100dvh] flex flex-col">
         <CalculatorDisplay input={engine.input} result={engine.result} />
         <CalculatorKeypad onPressKey={engine.pressKey} />
       </div>
     );
   }
   ```

---

## 2. Derivación Pura vs. Anti-Patrón `useEffect`

### ❌ Anti-Patrón Común (Sincronización manual en efectos)
```typescript
// MAL: Genera re-renders en cascada y estados inconsistentes
const [selectedRates, setSelectedRates] = useState([]);
useEffect(() => {
  if (rates) {
    setSelectedRates(Object.keys(rates).slice(0, 3));
  }
}, [rates]);
```

### ✅ Patrón Correcto (Derivación pura en render)
```typescript
// BIEN: Instantáneo, sin ciclos de render extras ni parpadeos
const selectedRates = useMemo(() => {
  if (userPreferences?.length) return userPreferences;
  return Object.keys(rates).slice(0, 3);
}, [userPreferences, rates]);
```

---

## 3. Manejo de Gestos y Referencias sin Romper la Encapsulación

Al extraer la UI a subcomponentes, los elementos que requieran mediciones del DOM (como el ancho de scroll de la pantalla de cálculo para mostrar indicadores `‹` y `›`) deben exponer su nodo mediante `ref` o un callback ref:

```typescript
// El hook provee el ref y la lógica de scroll
const inputRef = useRef<HTMLDivElement>(null);
const { canScrollLeft, canScrollRight, checkScroll } = useScrollIndicators(inputRef);

// El subcomponente simplemente recibe el ref
<CalculatorDisplay ref={inputRef} onScroll={checkScroll} />
```
