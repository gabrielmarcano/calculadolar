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
    - Resolucion de conflicto visual eliminando `animate-fade-in` de `components/RateView.tsx`, inyeccion directa de `@keyframes` en `app/page.tsx` y definicion de animaciones en linea (`style`) con claves de reconciliacion unicas (`key`) para blindar la ejecucion de `slide-in-left` ante anomalias de cache de empaquetador.
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

- [x] **Rediseno de identidad visual, logotipo y activos de marca**
  - **Descripcion**: Renovar la identidad grafica de CalculaDolar integrando el nuevo icono vectorial de calculadora financiera en todos los formatos de instalacion PWA, pantallas de bienvenida y metadatos del navegador.
  - **Alcance**:
    - Generacion del paquete de iconos estandar en alta resolucion (`public/web-app-manifest-512x512.png` y `public/web-app-manifest-192x192.png`).
    - Generacion de icono adaptativo Android (`public/icon-maskable-512.png`) con fondo solido `#0f111b` y zona segura del 80% para evitar esquinas transparentes recortadas.
    - Generacion de icono para iOS (`app/apple-icon.png`, 180x180) con fondo opaco según los estandares de Apple HIG.
    - Generacion de favicon multirresolucion (`app/favicon.ico`, 16/32/48px), icono Next.js (`app/icon1.png`, 96x96) y favicon vectorial (`app/icon0.svg`).
    - Actualizacion de `app/manifest.ts` incorporando iconos estandares y maskable con tema oscuro `#0a0a0a`.
  - **Investigacion previa**: Validada la zona segura del 80% (circulo central de 410px) en el icono maskable para prevenir deformaciones o recortes irregulares en capas de personalizacion de Android (One UI, Pixel Launcher, MIUI), y asegurada la opacidad total de fondo en el icono tactil de Apple conforme a las guias de diseno de iOS.

- [x] **Arquitectura de arranque sin parpadeo y erradicacion del splash screen artificial**
  - **Descripcion**: Eliminar la doble pantalla de carga mediante la supresion total del splash screen sintetico en React, implementando una arquitectura de doble vista en el DOM con script sincrono bloqueante de renderizado en el encabezado y estilos criticos para erradicar cualquier salto visual o contenido desestilizado al iniciar la aplicacion.
  - **Alcance**:
    - Inyeccion de script sincrono ultraligero en `<head>` (`app/layout.tsx`) para evaluar `calculadolar_last_view` en menos de 0.1 ms antes del primer cuadro de pintura y definir el atributo `data-initial-view` en el elemento raiz `<html>`.
    - Estilos criticos en linea en `<head>` con reglas inmediatas `!important` para gobernar la visibilidad inicial de `#view-dashboard` y `#view-calculator`.
    - Renderizado permanente de ambas vistas principales en el DOM con `suppressHydrationWarning`, permitiendo que el navegador pinte de forma instantanea la pantalla correspondiente al cerrar el splash screen nativo del sistema operativo.
    - Limpieza automatica de atributos temporales al completar la hidratacion de React 19 para ceder el control dinamico a las clases de utilidad de Tailwind CSS.
    - Configuracion de variables globales en `:root` (`app/globals.css`) con fondo oscuro `#0a0a0a` nativo para blindar la aplicacion contra destellos claros durante la recarga.
  - **Investigacion previa**: Analizado el comportamiento del motor Blink y WebAPK en Android: la pantalla de bienvenida nativa es renderizada a nivel de sistema operativo en C++/Java usando metricas fisicas del dispositivo, provocando inevitablemente discrepancias de escala contra cualquier componente HTML intermedio. Validada la tecnica de ejecucion sincrona en `<head>` previa al arbol de renderizado (utilizada en PWAs de alto rendimiento como Telegram Web y Twitter Lite), eliminando en su totalidad la necesidad de pantallas de carga secundarias y garantizando transiciones limpias sin CLS.

- [x] **Estabilizacion de cotizaciones con esqueletos de carga y blindaje dimensional de layout**
  - **Descripcion**: Erradicar el parpadeo de la seccion negra de cotizaciones y el estiramiento vertical del teclado durante el pull-to-refresh y el retorno de segundo plano mediante filas esqueleto de carga y fijacion estricta de alturas en la franja superior de la calculadora.
  - **Alcance**:
    - Incorporacion de placeholders esqueleto animados con pulso sutil (`animate-pulse`) en `CalculatorRates` cuando las cotizaciones no estan disponibles en el render inicial de HTML, preservando la geometria de filas (`min-h-[34px]`) y eliminando el vacio negro.
    - Fijacion estricta e inmutable de dimensiones en la franja superior (`CalculatorTopBar` a 64px, visores de entrada a 58px y resultado a 72px, contenedor de tasas a 116px con `flex-shrink-0`), garantizando que la altura total superior sea estrictamente invariable (358px).
    - Desacoplamiento de la regla conflictiva `flex-1 h-[100dvh]` en el contenedor intermedio de `app/page.tsx`, sustituyendola por `h-full` para delegar el control de altura a la raiz y prevenir el redimensionamiento del teclado en pull-to-refresh sin deshabilitar el gesto nativo.
  - **Investigacion previa**: Comprobado que el renderizado estatico inicial de Next.js SSR carece de acceso a `localStorage`, dejando la seccion de cotizaciones en blanco hasta la hidratacion del cliente. Al renderizar esqueletos identicos en dimension y fijar la altura de los componentes superiores, la altura asignada al teclado (`flex-1`) permanece invariable tanto en reposo como en eventos de recarga.

- [x] **Inyeccion y persistencia de safe-area insets para erradicacion del micropestaneo y estiramiento en mobile**
  - **Descripcion**: Erradicar el desfase de layout (~64px) y micropestaneo visual que se manifestaba exclusivamente en dispositivos moviles (Android WebAPK/PWA) durante el pull-to-refresh y el retorno de segundo plano, causado por la resolucion asincrona inicial de `env(safe-area-inset-*)` a 0px en el motor Blink.
  - **Alcance**:
    - Creacion del Custom Hook `hooks/useSafeArea.ts` con observador `ResizeObserver` sobre un elemento sonda inerte (`#safe-area-probe`), capturando y persistiendo los valores exactos en pixeles (`calculadolar_sat` y `calculadolar_sab`) en `localStorage`.
    - Inyeccion sincrona render-blocking en `<head>` (`app/layout.tsx`) para evaluar y sembrar `--sat` y `--sab` en `document.documentElement` antes del primer cuadro de pintura (frame 0).
    - Definicion de variables compuestas criticas `--safe-area-top: max(var(--sat, 0px), env(safe-area-inset-top, 0px))` y `--safe-area-bottom: max(var(--sab, 0px), env(safe-area-inset-bottom, 0px))` aplicadas inmediatamente sobre `#app-main`.
    - Mantenimiento estricto del soporte de pull-to-refresh nativo sin recurrir a bloqueos de `overscroll-behavior`.
  - **Investigacion previa**: Identificada la causa raiz en el motor Chromium sobre Android: las variables CSS `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` se evaluan a 0px en el cuadro inicial mientras el hilo del renderizador procesa el IPC asincrono de `WindowInsets` del sistema operativo (~50-100ms). Esto provocaba que el contenedor principal careciera temporalmente de espaciado, provocando una caida de ~40px en el encabezado y un estiramiento transitorio de ~64px en el teclado (`flex-1`), dimension coincidente con la altura del encabezado. La siembra sincrona de variables en el `<head>` anula la discrepancia entre el frame 0 y el frame 1, produciendo una renderizacion invariable.

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

- [ ] **Auditoria y reemplazo de emojis por iconografia vectorial SVG**
  - **Descripcion**: Identificar y sustituir cualquier uso de emojis unicode en la interfaz por iconos vectoriales SVG estandarizados y accesibles, asegurando una apariencia profesional y uniforme en cualquier plataforma movil.
  - **Alcance**:
    - Auditar vistas y componentes en busqueda de caracteres emoji unicode (`app/`, `components/`).
    - Sustituir glifos o emojis del sistema por componentes SVG vectoriales limpios y coherentes con Tailwind.
    - Asegurar alineacion vertical, proporciones tactiles y compatibilidad estricta con lectores de pantalla (a11y).
  - **Investigacion previa**: Mapear todas las ocurrencias de caracteres unicode dependientes de fuentes del sistema operativo (que en iOS y Android presentan representaciones heterogeneas) y consolidar una libreria interna de iconos SVG reutilizables.
