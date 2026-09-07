# Heurísticas de Ergonomía Móvil (Apple HIG & Material Design 3)

Este documento condensa los estándares de referencia de la industria para diseño táctil de aplicaciones móviles y PWAs.

---

## 1. Apple Human Interface Guidelines (HIG)

### A. Touch Targets (Objetivos Táctiles)
- **Área mínima:** 44×44 pt (puntos lógicos). En pantallas de alta densidad (@2x/@3x), esto equivale a 88×88 px o 132×132 px físicos.
- **Espaciado perimetral:** Al menos 8 pt de separación entre elementos que ejecutan acciones destructivas o diferentes para mitigar el error de dedo gordo (*fat-finger effect*).

### B. Gestos e Interacciones
- **Feedback Háptico:** Inspirado en `UIFeedbackGenerator`. En interfaces táctiles web, debe usarse `navigator.vibrate([10])` o `[15]` para pulsaciones ligeras (teclado), y `[30]` para confirmaciones o cambios de estado importantes.
- **Desactivación de Comportamientos Web Inoportunos:**
  ```css
  -webkit-touch-callout: none; /* Desactiva la burbuja de copiado por defecto de iOS */
  user-select: none;           /* Evita resaltados de texto accidentales al teclear rápido */
  -webkit-tap-highlight-color: transparent; /* Elimina el cuadro gris parpadeante nativo al tocar */
  ```

### C. Safe Areas (Pantallas con Muesca / Dynamic Island)
- Todo elemento anclado al perímetro superior o inferior debe considerar las variables CSS del entorno:
  - `env(safe-area-inset-top)`
  - `env(safe-area-inset-bottom)`
  - `env(safe-area-inset-left)`
  - `env(safe-area-inset-right)`
- Utilizar `max()` para garantizar un espaciado base en dispositivos sin safe area:
  ```css
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  ```

---

## 2. Google Material Design 3 (M3)

### A. Touch Target Size y Fitts's Law
- **Dimensión estándar:** 48×48 dp. Permite un índice de precisión superior al 98% en usuarios diestros y zurdos con operación a una sola mano.
- **Padding perimetral invisible:** Cuando el icono mide 24×24 dp, el contenedor debe tener padding suficiente para alcanzar los 48×48 dp de área táctil interactiva.

### B. State Layer & Microinteracciones
- Cada elemento debe contar con una capa de estado visible:
  - **Hover:** En móviles no se utiliza, no depender de `hover:` para mostrar información o funciones críticas.
  - **Pressed / Active:** Escala reducida (`scale(0.96)`) con un oscurecimiento o aclarado del 12% sobre la superficie de base. Duración de salida inmediata (<100 ms).

### C. Bottom Sheet Pattern (Gaveta Inferior)
- Sustituye a los menús contextuales y modales flotantes superiores.
- Permite acceder a opciones y ajustes sin que el usuario deba desplazar la mano hacia arriba ni arriesgar la estabilidad del dispositivo.

---

## 3. Principios Tipográficos para Calculadoras y Finanzas

- **Tabular Figures (`tabular-nums`):** Los números de fuentes proporcionales varían de ancho (el número "1" es mucho más estrecho que el "8"). En una calculadora, esto provoca que toda la cifra se desplace horizontalmente al alternar dígitos. Se debe forzar siempre:
  ```css
  font-variant-numeric: tabular-nums;
  ```
  O en Tailwind CSS:
  ```html
  <span className="tabular-nums font-mono">1,250.00 Bs</span>
  ```
