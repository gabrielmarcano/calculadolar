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
    - Compresion y optimizacion de `BCV.png` reduciendo su tamano en un 81% (de 154 KB a 29 KB).

## Tareas Pendientes

- [ ] **Modal de configuracion con boton de engranaje en calculadora**
  - **Descripcion**: Reemplazar el boton "n precios activos" de la barra superior por un icono de engranaje que despliegue un modal de configuracion general.
  - **Alcance**:
    - Crear componente de modal para ajustes de la aplicacion.
    - Trasladar el selector de precios activos como una opcion dentro del modal.
    - Preparar el modal para futuras configuraciones (notificaciones, preferencias visuales).

- [ ] **Panel de calculo interactivo con cursor por toque y desplazamiento por arrastre**
  - **Descripcion**: Transformar el visor de la expresion matematica en un panel interactivo donde el usuario pueda tocar para posicionar el cursor y editar cualquier parte de la cuenta, sin perder el desplazamiento horizontal por arrastre (inspirado en HiPER Calc Pro).
  - **Alcance**:
    - Gestion de posicion del cursor dentro de la cadena de entrada.
    - Compatibilidad entre gestos de toque (posicionar cursor) y arrastre (desplazamiento horizontal en expresiones largas).
    - Insercion y borrado de caracteres en la posicion activa del cursor.
  - **Investigacion previa**: Investigar la implementacion tecnica para desacoplar el gesto de pulsacion simple (tap para posicionar cursor en el caracter exacto) del gesto de desplazamiento horizontal (pan/drag para recorrer expresiones extensas), evitando conflictos con el teclado virtual nativo del sistema operativo y garantizando precision tactil en pantallas reducidas.

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

- [ ] **Sistema de microinteracciones y animaciones fluidas de alto rendimiento**
  - **Descripcion**: Incorporar transiciones y animaciones interactivas ligeras que aporten dinamismo y elegancia a la interfaz sin degradar la respuesta tactil ni la tasa de cuadros por segundo (60 fps).
  - **Alcance**:
    - Transiciones aceleradas por hardware utilizando exclusivamente `transform` y `opacity` (`will-change: transform`).
    - Animaciones de transicion suaves para cambios de vista, despliegue de modales y actualizacion de cifras.
    - Preservacion estricta de estabilidad visual para evitar desajustes acumulados de layout (CLS).
  - **Investigacion previa**: Comparar el rendimiento de animaciones CSS nativas frente a la View Transitions API en navegadores moviles WebKit y Chromium, definiendo una curva de aceleracion tipo cubic-bezier que replique la fisica de Material Design 3 sin retrasar la ejecucion de callbacks.

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
