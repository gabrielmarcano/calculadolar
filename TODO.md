# TODO

## Tareas Completadas

- [x] **Establecer la calculadora como pantalla principal**
  - **Descripcion**: Configurar la calculadora como la vista inicial predeterminada para evitar pasos previos de navegacion al abrir la aplicacion.
  - **Alcance**:
    - Vista `calculator` por defecto en `app/page.tsx`.
    - Persistencia de la ultima vista en `localStorage` (`calculadolar_last_view`).
    - Boton "Tasas" en la barra superior de `CalculatorView` para navegar a la pantalla secundaria.

- [x] **Remover boton de navegacion superior en pantalla de tasas**
  - **Descripcion**: Eliminar el boton secundario "< Calc" del encabezado de la vista de tasas, manteniendo el boton flotante inferior como unico acceso de retorno a la calculadora.
  - **Alcance**:
    - Remover boton y espaciador en el encabezado de `dashboard` en `app/page.tsx`.
    - Centrar el titulo principal en el encabezado.

- [x] **Pegar cuenta desde el portapapeles**
  - **Descripcion**: Permitir la insercion de expresiones matematicas o montos numericos copiados desde aplicaciones externas directamente en la calculadora sin botones estaticos adicionales en la UI.
  - **Alcance**:
    - Modulo modular de sanitizacion en 5 fases (`lib/sanitizer/`) para divisas (Bs, USD, EUR, etc.), separadores decimales locales (1.250,50) y operadores.
    - Accion contextual tipo burbuja flotante (`[ Copiar | Pegar ]`) activable por toque en el visor de calculo.
    - Sugerencia flotante no intrusiva al reanudar la app desde segundo plano.
    - Integracion de `navigator.clipboard.readText()` con retroalimentacion haptica y notificaciones toast.

- [x] **Correccion de sincronizacion de tasas, portapapeles en HTTP y manejo de cero**
  - **Descripcion**: Resolver problemas en la carga inicial de tasas en la calculadora, excepciones al copiar en entornos HTTP de red local y discrepancias en el valor cero entre visores y teclado.
  - **Alcance**:
    - Derivacion pura en render de `selectedRates` resolviendo el vacio inicial y eliminando efectos secundarios de estado en React 19.
    - Utilidad `lib/clipboard.ts` con fallback mediante `execCommand` para pruebas en red local bajo protocolo HTTP.
    - Formateo uniforme de cero (`0` en lugar de `0.00`) en visores y tarjetas, evitando desfases decimales al escribir digitos posteriores.

- [x] **Centralizacion semantica de gestos tactiles y resolucion del conflicto de portapapeles**
  - **Descripcion**: Diferenciar y encapsular la logica de pulsacion prolongada (long-press) segun la semantica del elemento (solo lectura vs. entrada editable), previniendo la sobrescritura accidental del portapapeles al intentar pegar.
  - **Alcance**:
    - Abstraccion unificada en `hooks/useLongPressCopy.ts` con metodos semanticos `bindDirectCopy` y `bindContextMenu`.
    - Elementos de solo lectura (resultados, tasas): long-press ejecuta copiado directo con pulso haptico y notificacion toast.
    - Visor de calculo editable: long-press despliega exclusivamente la burbuja contextual (`[ Copiar | Pegar ]`), protegiendo el contenido previo del portapapeles del sistema.
    - Supresion de eventos de click sintetico (`onClickCapture`) tras la liberacion del puntero en pulsaciones largas.

- [x] **Ajuste de jerarquia de capas z-index para toasts y burbuja contextual**
  - **Descripcion**: Garantizar que los avisos tipo toast y la burbuja flotante de acciones contextuales se muestren siempre por encima de cualquier otro elemento de la interfaz sin ser recortados ni solapados.
  - **Alcance**:
    - Reestructuracion del contexto de apilamiento en `CalculatorView.tsx` elevando el visor de calculo a `relative z-20` por encima del encabezado (`z-10`).
    - Elevacion del portal de `Toast.tsx` a `z-[9999]` sobre el cuerpo del documento.
    - Incremento del espaciado superior (`pt-3`) para prevenir solapamiento visual con la barra superior.

- [x] **Mejora tipografica y estilizacion visual de interfaz**
  - **Descripcion**: Sustituir las fuentes del sistema por una tipografia de interfaz profesional (Geist) e integrar escala tipografica calibrada en teclado y visores sin dependencias externas de red.
  - **Alcance**:
    - Incorporacion de `GeistSans` y `GeistMono` empaquetadas localmente para soporte offline estricto en PWA.
    - Calibracion de jerarquia en botones del teclado emulando proporciones de Android Stock (~45-50% de altura de tecla con `text-[32px]`).
    - Sustitucion del caracter unicode de borrado por icono vectorial SVG optimizado para pantallas tactiles.

- [x] **Optimizacion de carga y persistencia en cache de imagenes locales**
  - **Descripcion**: Erradicar el parpadeo visual (flicker) de los iconos de tasas y recursos graficos al abrir la aplicacion o alternar entre pantallas mediante precarga, cache inmutable y derivacion sincrona de estado.
  - **Alcance**:
    - Inicializacion sincrona de estado en `app/page.tsx` desde `localStorage`, eliminando el marco en blanco inicial.
    - Configurado `unoptimized: true` y `priority` en componentes `<Image />`, evitando peticiones dinamicas a `/_next/image` y sirviendo directamente los archivos estaticos precacheados.
    - Estrategia `CacheFirst` en Serwist (`app/sw.ts`) con expiracion a 30 dias para imagenes locales.
    - Enlaces de precarga `<link rel="preload" as="image">` en el `<head>` de `app/layout.tsx`.
    - Cabeceras `Cache-Control: public, max-age=31536000, immutable` en `next.config.ts`.
    - Unificacion de iconos de cotizaciones a vectores SVG limpios (`public/bcv.svg` y `public/binance.svg`), eliminando bordes blancos artificiales y artefactos de ruido visual.

- [x] **Modal de configuracion con boton de engranaje y reorganizacion de barra superior**
  - **Descripcion**: Sustituir el selector flotante superior por un icono tactil de engranaje con gaveta inferior (bottom sheet) ergonómica, centrar y calibrar el interruptor USD/VES, y blindar la seccion de cotizaciones contra desplazamientos horizontales y toques accidentales.
  - **Alcance**:
    - Creacion de `components/SettingsModal.tsx` con arquitectura de bottom sheet en zona del pulgar (thumb-zone) para gestionar cotizaciones visibles y preferencias.
    - Barra superior reestructurada en 3 columnas equilibradas: boton "Tasas" (izquierda), interruptor de divisas ampliado y centrado (centro), y acceso a configuracion (derecha).
    - Blindaje de la fila de cotizaciones con `overflow-x-hidden`, truncado con puntos suspensivos (`...`) en cifras extensas y proteccion rigurosa de iconos.
    - Supresion de eventos tap durante gestos de arrastre/swipe en `hooks/useLongPressCopy.ts`, erradicando el cambio involuntario de divisa.

- [x] **Panel de calculo interactivo con cursor por toque, barra parpadeante y optimizacion de espacio**
  - **Descripcion**: Transformar el visor de la expresion matematica en un panel interactivo con barra parpadeante de escritura (estilo calculadora de Android), donde el usuario pueda tocar para posicionar el cursor con precision y editar cualquier parte de la cuenta sin perder el desplazamiento horizontal por arrastre (pan/drag), optimizando ademas la altura del visor al erradicar el espacio vacio sobrante del selector de cotizaciones.
  - **Alcance**:
    - Gestion bidireccional de posicion del cursor dentro de la cadena de entrada (`cursorIndex`).
    - Barra de cursor parpadeante (`animate-cursor-blink`) que acompana la insercion y auto-desplaza el visor para mantenerse visible.
    - Desacoplamiento de gestos: pulsacion simple (*tap*) calcula la coordenada exacta del caracter entre spans y ubica el cursor; deslizamiento horizontal (*pan/drag*) permite inspeccionar expresiones extensas sin saltos involuntarios de cursor ni teclado virtual nativo.
    - Insercion, borrado (backspace) y pegado en la posicion activa del cursor.
    - Optimizacion espacial de la interfaz: compactar la seccion de cotizaciones a su altura util estricta (~116px) eliminando el vacio inferior y transfiriendo los pixeles ganados al panel de calculo y resultado sin estirar las filas de tasas.
    - Descomposicion modular de `CalculatorView.tsx` (>590 lineas) en Custom Hook (`useCalculatorLogic`) y subcomponentes presentacionales atómicos (`CalculatorDisplay`, `CalculatorRates`, `CalculatorKeypad`) bajo el estandar de <200 lineas.
  - **Investigacion previa**: Validado el mecanismo de deteccion geometrica de caracteres mediante coordenadas relativas `(clientX - span.left)` sobre elementos `[data-char-idx]`, permitiendo resolucion subpixel independientemente de la tipografia tabular. Verificado el filtro de umbral de movimiento (>8px) para aislar el evento nativo de arrastre `touch-pan-x` de la pulsacion corta, y calculada la reduccion de 26px sobrantes en el contenedor de cotizaciones para oxigenar verticalmente el visor de calculo.

- [x] **Transicion animada continua entre pantallas con reconocimiento de ultima vista**
  - **Descripcion**: Implementar navegacion lateral fluida entre Calculadora y Dashboard activada por botones ("Tasas" y "CALCULADORA") mediante renderizado condicional con animaciones direccionales de entrada en GPU (`slide-in-right` y `slide-in-left`), persistencia de pantalla inicial, portaleo al root para modales y maxima prioridad al rendimiento de escritura del teclado numerico.
  - **Alcance**:
    - Sustitucion de carriles continuos o capas absolutas permanentes por renderizado condicional limpio y desacoplado en `app/page.tsx`, erradicando desfases de subpixel, recortes laterales y capturas accidentales de puntero.
    - Animaciones direccionales fluidas por GPU (`animate-slide-in-right` al ir a calculadora y `animate-slide-in-left` al regresar a tasas) gestionadas mediante estado de orientacion (`navDirection`).
    - Portaleo global de `components/SettingsModal.tsx` al `document.body` via `createPortal` con verificacion de cliente segura mediante `useSyncExternalStore`, asegurando cobertura total del viewport y eliminando atrapamiento por transforms o paddings de ancestros.
    - Manejadores de accion `onClick` estandar con pulso haptico en el boton "Tasas", selector USD/VES, boton de configuracion y boton flotante "CALCULADORA", erradicando bloqueos del hilo de eventos tactiles causados por `preventDefault` en `pointerdown`.
    - Extraccion atomica de `components/CalculatorTopBar.tsx` (122 lineas) y compactacion de `components/CalculatorView.tsx` (110 lineas) en estricto cumplimiento del estandar de arquitectura limpia (<200 lineas).
    - Persistencia sincronizada en `localStorage` (`calculadolar_last_view`) e inicializacion sincrona de estado para abrir directamente en la ultima pantalla utilizada sin parpadeos visuales.
  - **Investigacion previa**: Evaluada la navegacion por gestos de swipe tactil en toda la pantalla; descartada tras comprobar el conflicto inevitable entre el barrido de pantalla y el teclado numerico de alta velocidad (donde el usuario requiere respuesta inmediata en `pointerdown`). Se adopto la arquitectura de vistas condicionales animadas por botones que preserva la estetica y fluidez visual, eliminando por completo cualquier riesgo de redondeo subpixel en pantallas moviles de alta densidad.

- [x] **Sistema de microinteracciones y animaciones fluidas de alto rendimiento**
  - **Descripcion**: Incorporar transiciones y animaciones interactivas ligeras que aporten dinamismo y elegancia a la interfaz sin degradar la respuesta tactil ni la tasa de cuadros por segundo (60 fps), auditando y sustituyendo clases CSS no operativas por animaciones aceleradas por hardware en GPU.
  - **Alcance**:
    - Declaracion de fotogramas clave y utilidades de animacion por GPU en `app/globals.css` (`fade-in`, `toast-in`, `bubble-pop`, `slide-in-right`, `slide-in-top`) con curva natural `cubic-bezier(0.16, 1, 0.3, 1)` y respeto de accesibilidad via `@media (prefers-reduced-motion: reduce)`.
    - Microinteracciones de pulsacion inmediata (`transition-transform duration-75 ease-out active:scale-95 will-change-transform`) en teclado, botones superiores, filas de tasas y burbuja flotante, erradicando retardos por `transition-all`.
    - Aceleracion por hardware del interruptor USD/VES mediante desplazamiento `translateX` en GPU en lugar de propiedades de reflujo de maquetacion (`left`).
    - Transicion fluida tipo push movil nativo para la apertura de la vista de historial (`animate-slide-in-right`).
    - Animaciones de entrada escalonada para toasts (`animate-toast-in`) y burbuja de portapapeles (`animate-bubble-pop`).
  - **Investigacion previa**: Comprobado que Tailwind CSS v4 no emite por defecto las clases de transicion de plugins heredados (`tailwindcss-animate`), lo que provocaba renderizaciones instantaneas sin transicion. Definidas curvas de aceleracion cubica identicas a las especificaciones de movimiento de Material Design 3 y iOS, asegurando cero cambios acumulados de diseno (CLS = 0) al restringir las animaciones estrictamente a transformaciones y opacidad.

## Tareas Pendientes

- [ ] **Historial de operaciones de calculo**
  - **Descripcion**: Registrar y almacenar localmente las operaciones realizadas por el usuario para su posterior consulta y reutilizacion (inspirado en la calculadora stock de Android).
  - **Alcance**:
    - Estructura de almacenamiento local en `localStorage` para registros previos (expresion, resultado, fecha).
    - Componente de panel deslizable o gaveta para visualizar el historial.
    - Acciones para restaurar una cuenta al visor activo, copiar valores y vaciar el historial.
  - **Investigacion previa**: Definir el limite maximo de registros y politica de desalojo (FIFO) en `localStorage` para evitar degradacion de rendimiento, y analizar el patron de animacion para la gaveta deslizable asegurando fluidez a 60 fps en movil.

- [ ] **Optimizacion ergonomica y respuesta tactil de teclado**
  - **Descripcion**: Perfeccionar la distribucion espacial del teclado numerico y la respuesta sensorial de las teclas para emular la ergonomia de la calculadora stock de Android.
  - **Alcance**:
    - Proporciones dinamicas de teclas segun la altura de la pantalla del dispositivo.
    - Microinteracciones de pulsacion (estados activos, feedback haptico calibrado).
    - Prevencion de saltos de layout durante la introduccion de datos.
  - **Investigacion previa**: Investigar la variacion de altura de viewport con unidades `dvh` en Chrome y Safari movil para prevenir solapamiento con barras de navegacion del sistema, y documentar los fallbacks tactiles para entornos donde `navigator.vibrate` no esta disponible (ej. iOS).

- [ ] **Garantia y auditoria del modo offline**
  - **Descripcion**: Asegurar la operatividad total de la aplicacion y de sus funciones de calculo en condiciones de red nula o intermitente.
  - **Alcance**:
    - Auditoria de cache en Serwist para todos los recursos estaticos y logica cliente.
    - Persistencia garantizada de la ultima cotizacion de tasas en `localStorage`.
    - Indicador de estado sin conexion claro y no intrusivo.
  - **Investigacion previa**: Auditar las estrategias de cache en runtime de `app/sw.ts` simulando desconexion total para validar que ningun script, hoja de estilos o asset bloquee la renderizacion inicial de la PWA en modo avion.

- [ ] **Suite de pruebas unitarias automatizadas**
  - **Descripcion**: Implementar un conjunto de pruebas unitarias para blindar la logica de calculo, conversion de monedas y flujos principales ante futuras refactorizaciones.
  - **Alcance**:
    - Configuracion de Vitest en el proyecto.
    - Pruebas para combinaciones de operadores matematicos, orden de operaciones y casos de borde.
    - Pruebas para conversion bidireccional entre tasas oficiales, paralelas y bolivares.
    - Pruebas de algoritmos auxiliares (downsampling de historico de precios).
  - **Investigacion previa**: Validar la compatibilidad de Vitest con Next.js 16 (Turbopack) y resolver la configuracion de aliases de TypeScript (`@/*`) sin requerir dependencias redundantes o configuraciones fragiles.

- [ ] **Sistema de notificaciones push configurables**
  - **Descripcion**: Implementar notificaciones Web Push para alertar al usuario sobre cambios significativos en cotizaciones y eventos clave de mercado, con control total de activacion/desactivacion.
  - **Alcance**:
    - Generacion de llaves VAPID y registro de service worker para recepcion push.
    - Tabla de suscripciones en Supabase y endpoints de despacho.
    - Panel de configuracion con interruptores (opt-in / opt-out) para tipos de alertas y umbrales.
  - **Investigacion previa**: Investigar el soporte y limitaciones de Web Push en iOS Safari (requiere que la PWA este instalada en pantalla de inicio a partir de iOS 16.4), las politicas de retencion de suscripciones invalidas en Supabase, y el costo/latencia de ejecucion desde el cron de despacho.

- [ ] **Rediseno de identidad visual, logotipo y activos de marca**
  - **Descripcion**: Crear una identidad grafica renovada y profesional para CalculaDolar, integrando nuevo logotipo, isotipo, favicon y el paquete completo de iconos de instalacion PWA.
  - **Alcance**:
    - Diseno de nuevo logotipo e isotipo vectorial optimizado para pantallas moviles de alta densidad y tema oscuro.
    - Generacion del conjunto completo de activos para instalacion: favicon (`favicon.ico`), icono tactil de Apple (`apple-icon.png`), e iconos adaptativos para Android (`web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`, maskable).
    - Actualizacion de la pantalla de carga inicial (Splash Screen) y elementos de marca en encabezados.
  - **Investigacion previa**: Validar los requisitos de zona segura (safe zone del 80%) para iconos maskable de Android para evitar recortes irregulares en diferentes capas de personalizacion (One UI, MIUI, Pixel Launcher), y asegurar compatibilidad de contrastes WCAG AAA sobre fondos `#0a0a0a`.

- [ ] **Auditoria y reemplazo de emojis por iconografia vectorial SVG**
  - **Descripcion**: Identificar y sustituir cualquier uso de emojis unicode en la interfaz por iconos vectoriales SVG estandarizados y accesibles, asegurando una apariencia profesional y uniforme en cualquier plataforma movil.
  - **Alcance**:
    - Auditar vistas y componentes en busqueda de caracteres emoji unicode (`app/`, `components/`).
    - Sustituir glifos o emojis del sistema por componentes SVG vectoriales limpios y coherentes con Tailwind.
    - Asegurar alineacion vertical, proporciones tactiles y compatibilidad estricta con lectores de pantalla (a11y).
  - **Investigacion previa**: Mapear todas las ocurrencias de caracteres unicode dependientes de fuentes del sistema operativo (que en iOS y Android presentan representaciones heterogeneas) y consolidar una libreria interna de iconos SVG reutilizables.
