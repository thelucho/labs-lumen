# PLAN — Lumen Residencias

Una fase por vez. Al terminar cada fase: correr `npm run build` y `npm run lint`, verificar los criterios de la fase, marcar los checkboxes y hacer un commit (`fase N: ...`). No avanzar si la fase anterior no cumple sus criterios.

## Fase 0 — Setup
- [x] Crear proyecto Next.js (App Router, TypeScript, ESLint, Tailwind, carpeta `src/`).
- [x] Instalar `three`, `@react-three/fiber`, `@react-three/drei`, `lenis`, `@phosphor-icons/react`.
- [x] Configurar fuentes (Instrument Serif + Manrope) con `next/font/google`.
- [x] Definir tokens de color de SPEC §6.3 en Tailwind.
- [x] Layout base con fondo `paper` y una página vacía con el título del proyecto.

**Verificación:** `npm run dev` levanta, se ven las fuentes y colores correctos, build limpio.

## Fase 1 — Datos y estado
- [x] `src/data/building.ts` con tipos (`Unit`, `Level`, `UnitStatus`, etc.) y todos los datos de SPEC §5.
- [x] Helpers: formato de precio (`USD 359.000`), etiqueta de unidad ("4° A", "Piso 1 completo").
- [x] Store de UI (Zustand): `hoveredId`, `selectedId`, `isPanelOpen` (hoy `isDetailOpen`, fase 10), `isModalOpen`.
- [x] Datos de geometría por nivel/unidad que necesita el 3D: `kind`, `height`, `side` (A/B/completo), `hasBalcony`.
- [x] Test unitario con Vitest (`npm test`) que verifique: 14 unidades, pisos 1 y 8 completos, todas las A y los pisos completos con balcón, precios = regla de SPEC §5.5.

**Verificación:** el test pasa; los datos coinciden con SPEC.

## Fase 2 — Edificio 3D estático
- [x] Componente `Scene` cargado con `dynamic(..., { ssr: false })` y placeholder.
- [x] Generar el edificio por código desde los datos (no hardcodear pisos): PB, pisos 1–8, SUM + terraza + pileta.
- [x] Losas, carpinterías, vidrios, interiores simples, tabique A/B, balcones en lateral este (incluidos pisos 1 y 8).
- [x] Materiales según SPEC §4.2.
- [x] Cámara inicial mostrando frente + lateral este.

**Verificación:** captura de pantalla desde frente, lateral este, lateral oeste y contrafrente (en dev: `?cam=front|east|west|back`); se distinguen las 2 unidades en pisos 2–7 y el piso completo en 1 y 8.

## Fase 3 — Entorno
- [x] Suelo, vereda, cielo con gradiente, fog suave.
- [x] Sol visible al noreste + `directionalLight` alineada con sombras.
- [x] Nubes con movimiento lento.
- [x] Sombras de contacto.

**Verificación:** captura; la escena se ve como maqueta arquitectónica, sin colores saturados; fps estables (medir en navegador real: headless usa render por software).

## Fase 4 — Interacción 3D
- [x] OrbitControls con límites de SPEC §4.4, damping, auto-rotación lenta que se detiene al interactuar.
- [x] Hover por unidad: emisivo cálido + luz puntual única que se mueve a la unidad activa; transición corta.
- [x] Tooltip con nombre de unidad.
- [x] Click con umbral para no confundir con drag; selección persistente.
- [x] Interacción en PB y SUM.
- [x] Tap en touch.

**Verificación:** recorrer todas las unidades con el mouse: nunca hay dos encendidas; drag no abre fichas; probar en viewport mobile.

## Fase 5 — Panel lateral y selector de pisos
- [x] Selector vertical (SUM, 8…1, PB) sincronizado con el 3D en ambos sentidos.
- [x] Panel de ficha (desktop: lateral; mobile: bottom sheet) según SPEC §6.1, con mini plano SVG.
- [x] Fichas específicas de PB y SUM.
- [x] Estados vendida/reservada.
- [x] Teclado: Tab/flechas en selector, Enter abre, Esc cierra.

**Verificación:** abrir la ficha de las 16 entradas (14 unidades + PB + SUM) y comparar contra SPEC §5.

## Fase 6 — Modal de solicitud
- [x] Formulario de SPEC §6.2 con validación en cliente.
- [x] Submit sin envío + estado de confirmación de demo.
- [x] Focus trap, Esc, retorno de foco.

**Verificación:** confirmar en la pestaña Network que no hay ninguna request al enviar.

## Fase 7 — Resto de la landing + Lenis
- [x] Hero completo (bloque editorial + 3D + selector + indicación de uso).
- [x] Mobile: hoy el selector flota sobre el edificio y tapa la mitad derecha; reubicarlo (debajo del 3D o como tira) sin perder el orden vertical SUM → PB.
- [x] Secciones: El proyecto, Amenities, Ubicación (plano ilustrado estático), Footer con aviso de demo.
- [x] Lenis para scroll suave; detenerlo con panel/modal abiertos; `data-lenis-prevent` en zonas con scroll propio; desactivado con `prefers-reduced-motion`.
- [x] Que el scroll de la página no gire el edificio y que el drag del edificio no scrollee la página.
- [x] Mobile: OrbitControls pone `touch-action: none` en el canvas y el hero (100svh) no deja scrollear con el dedo; permitir scroll vertical (p. ej. `pan-y` y rotación solo con gesto horizontal).

**Verificación:** revisión visual contra las reglas anti-slop de SPEC §6.3.

## Fase 8 — Pulido y deploy
- [x] Responsive 360 px → 1920 px.
- [x] Performance: `dpr` limitado, instancing/merge, pausar render cuando el hero no está visible.
- [x] Accesibilidad: contraste, labels, roles, foco visible. (Contraste: `slate`/`clay` quedan bajo AA por decisión, ver SPEC §6.3.)
- [x] Metadata, favicon, Open Graph.
- [x] Lighthouse ≥ 90 (SPEC §7). Escritorio, build de producción: Performance 99, Accesibilidad 96, Buenas prácticas 100, SEO 100.
- [x] Deploy en Vercel.

**Verificación:** todos los criterios de aceptación de SPEC §9.

## Fase 9 — Luz del día
- [x] Slider continuo de hora (06:00–22:00) con referencias Mañana / Mediodía / Tarde / Noche (SPEC §4.5).
- [x] Recorrido del sol (este → norte → oeste); disco y `directionalLight` alineados; por defecto detrás de la cámara inicial.
- [x] Color e intensidad del sol, cielo, niebla, nubes y luz ambiente según la hora; luna de noche.
- [x] Sombras recalculadas al mover la hora (el mapa sigue congelado mientras no cambia).
- [x] Texto del hero legible con la escena oscura.
- [x] Test de recorrido solar (`src/lib/daylight.test.ts`).

**Verificación:** capturas a 07:30, 10:44, 13:00, 18:00, 19:30 y 21:00 en desktop y mobile; el slider se mueve de forma continua con mouse, touch y teclado.

## Fase 10 — Ficha fullscreen con fotos
- [x] Reemplazar el panel lateral / bottom sheet por una ficha fullscreen (`<dialog>`) con contenido centrado (SPEC §6.1).
- [x] Estructura de mini landing: título, precio y CTA; portada; cifras; descripción y ficha técnica; galería; planta y corte del edificio; cierre con consulta y pisos vecinos.
- [x] Fotos ilustrativas de Unsplash en `public/images/units`, por tipología (A, B, piso completo), PB y SUM; textos y fotos en `showcases` de `building.ts`.
- [x] Galería con visor a pantalla completa (flechas, Esc, retorno de foco).
- [x] Quitar el encuadre de cámara y los corrimientos que dependían del panel; pausar el 3D con la ficha abierta.
- [x] Tests: cada ficha tiene portada en su galería y todas las fotos existen.

**Verificación:** capturas de 4° A, piso 1, PB y SUM en desktop y mobile; Esc cierra modal → visor → ficha en ese orden; el foco vuelve al selector de pisos.

## Fase 11 — Maqueta rica y entorno urbano
- [x] Texturas procedurales en canvas con proyección triplanar en coordenadas de mundo (hormigón, madera, asfalto, baldosa, revoque, pasto).
- [x] Trazado urbano generado por código (`cityLayout.ts`): calles al frente, costados y atrás; veredas con cordón; grilla de manzanas.
- [x] Señalización vial (sendas, detención, línea central), tapas y bocas de tormenta; columnas de alumbrado que se encienden de noche; bancos y canteros.
- [x] Casas bajas con techos planos o de tejas y ventanas (algunas encendidas de noche); autos estacionados.
- [x] Árboles con copas de varios lóbulos y oclusión; arbolado de vereda y de patios; jardín del edificio dentro del lote.
- [x] Silueta de ciudad en el horizonte (en el shader del cielo).
- [x] Frente despejado y anillo bajo de 60 m para que la PB se vea también desde la cámara lejana de mobile.
- [x] Bloque editorial del hero en caja `paper`.
- [x] Lighthouse ≥ 90: de 30 a 20 programas de shader (color por instancia siempre, suelo instanciado, sin mapa de entorno, sin `flatShading`) y canvas con `willReadFrequently`.
- [x] Tests del trazado (`cityLayout.test.ts`) y del jardín.

**Verificación:** capturas de día, atardecer y noche, vista frontal, lateral este y contrafrente, desktop y mobile. Lighthouse desktop sobre build de producción: Performance 96, Accesibilidad 96, Buenas prácticas 100.

## Fase 12 — Menos autos y ficha animada
- [x] Autos estacionados al ~20 % (de 309 a 65), con test.
- [x] Apertura y cierre animados de la ficha fullscreen (diálogo y fondo), con respaldo por tiempo en el cierre.
- [x] Contenido escalonado (`data-reveal`): textos, portada con descubrimiento y zoom, cifras, galería y secciones al hacer scroll; se repite al cambiar de piso.
- [x] Visor de fotos con fundido de entrada y entre fotos.
- [x] Sin animaciones con `prefers-reduced-motion`.

**Verificación:** estados intermedios capturados adelantando las animaciones (0, 150, 350, 700, 1400 ms y cierre a 150 ms); al terminar no queda nada oculto en pantalla; Esc cierra modal → visor → ficha; con movimiento reducido abre y cierra al instante.

## Fase 13 — Autos con forma y sin salto al cerrar
- [x] Modelo de auto por código (perfil extruido con bisel, pasaruedas, habitáculo angosto, vidrios y ruedas); `Box` admite giro sobre Y.
- [x] `scrollbar-gutter: stable` en `html`: abrir o cerrar la ficha (o el modal) no corre la página.

**Verificación (fase 13):** ancho del canvas y posición del selector iguales con la ficha abierta y cerrada (1407 / 1375 px; antes 1422 / 1390 con la ficha abierta); autos vistos en recortes ampliados; Lighthouse desktop: Performance 95, Accesibilidad 96, Buenas prácticas 100, CLS 0.

## Fase 14 — Más arquitectura y jardín de acceso
- [x] Marco de hormigón saliente en las unidades A del frente; parasoles de madera en el frente de las B y en el lateral oeste.
- [x] Núcleo de escalera y ascensores saliente en el contrafrente, hasta la sala de máquinas.
- [x] Hall: menos vidrio, pórtico de hormigón y puerta pivotante grande.
- [x] SUM: paredes de hormigón al fondo y al oeste (un paño vidriado).
- [x] Edificio retirado 6 m de la vereda (lote corrido); jardín aleatorio solo en laterales y contrafrente.
- [x] Jardín de acceso (`frontYardLayout.ts`): solado, entrada vehicular, canteros con flores, balizas, tótem y árbol columnar; con tests.

**Verificación:** capturas desde la cámara inicial, frente, contrafrente y lateral oeste, con recortes ampliados del acceso. Lighthouse desktop: Performance 95, Accesibilidad 96, Buenas prácticas 100, CLS 0.

## Fase 15 — 12 pisos con oficinas y planos tipo folleto
- [x] Datos: pisos 1–8 con departamentos A/B (16), pisos 9–12 con una oficina en planta libre (4); SUM en el nivel 13. Precios por regla (oficinas con base propia), estados, cocheras y bauleras (SPEC §5).
- [x] 3D: niveles de oficina con vidrio casi de piso a techo y aleros de grafito; cámara más lejos para el edificio de 45 m.
- [x] Ficha de oficina: cifras, ficha técnica y fotos propias (Unsplash, en `public/`).
- [x] Plano tipo folleto en SVG (`FloorPlanBrochure`) desde `floorPlans`: ambientes con m² y medidas, muebles, ventanas, cotas, balcón y norte; planilla de superficies.
- [x] Textos de la landing, README e imagen Open Graph actualizados.
- [x] Tests de datos reescritos y tests de planos (superficies, superposición, dormitorios y baños).

**Verificación:** capturas del hero (desktop y mobile) y de los planos de A, B y oficina. Lighthouse desktop: Performance 96, Accesibilidad 96, Buenas prácticas 100, CLS 0.

## Fase 16 — Entrada animada del hero
- [x] Edificio que se construye piso por piso al cargar (`rise.ts`): frente de obra con easing por nivel, 1,7 s; cajas instanciadas recortadas a la altura del frente; interiores y número de calle acompañan.
- [x] Arranca con todas las etapas de la escena compiladas; sombras recalculadas cada 3 pisos y las de contacto una sola vez al terminar.
- [x] Entrada de la interfaz del hero (CSS, `data-intro`): bloque editorial y luz del día desde la izquierda, selector desde la derecha con filas sincronizadas con los pisos; respaldo por tiempo (0,9 s) y sin JS.
- [x] Sin animaciones con `prefers-reduced-motion`.

**Verificación:** secuencia de carga grabada con screencast (lote vacío → edificio a medio construir → completo); estado final con y sin movimiento reducido. Lighthouse desktop en 4 corridas: Performance 98 / 91 / 91 / 97 (la versión anterior, medida igual: 96 / 88 / 95), Accesibilidad 96, Buenas prácticas 100, LCP 0,5–0,6 s.

## Fase 17 — Loader y entrada con fundido (reemplaza la construcción de la fase 16)
- [x] Fuera la animación de construcción piso por piso y la silueta de placeholder.
- [x] Loader con isologo animado, nombre, dirección y avance real de la escena (`src/lib/intro.ts`, `Loader`).
- [x] La escena aparece con un fundido cuando está completa y con sombras; los paneles entran después (CSS, `data-intro`), también la indicación de uso.
- [x] Respaldo de 8 s y `<noscript>`; sin animaciones con `prefers-reduced-motion`.
- [x] Panel izquierdo (y luz del día) de 21 a 23rem: "Desde" ya no toca el separador de "Entrega".

**Verificación:** estados capturados adelantando animaciones y transiciones (0, 300, 700, 1400 ms) sobre el build de producción; página sin JS. Lighthouse desktop en 3 corridas: Performance 93 / 95 / 94, Accesibilidad 96, Buenas prácticas 100, LCP 0,5–0,6 s (título del loader), CLS 0. Nota: el `next dev` que estaba corriendo servía un CSS global viejo (no recargó globals.css); hay que reiniciarlo para ver estos cambios.

## Fase 18 — Transición suave entre el loader y la escena
- [x] Capas encadenadas: contenido del loader (600 ms) → fondo del loader (1,3 s) mientras la escena aparece con un fundido de 2,2 s → paneles desde ~0,9 s (1,3 s, desplazamientos de 28 px) → indicación de uso al final.
- [x] Solo opacidad y desplazamientos chicos (nada que redimensione el canvas); sin transiciones con `prefers-reduced-motion`.

**Verificación:** estados capturados adelantando animaciones y transiciones (0, 400, 900, 1500, 2600 ms) sobre el build de producción.

## Fase 19 — Rediseño de la UI: "Hormigón y luz" (docs/DESIGN.md)
- [x] Tokens nuevos en `globals.css` (ink, paper, white, stone-50…800, acento ámbar #E9A23B), radios de 6/12/20/28 px, escala tipográfica `display-*`, `heading`, `stat`, `label` y utilidades `label-tech`, `display-wide`, `container-arch`, `section-y`. Fuera graphite/slate/brass/sage/clay.
- [x] Tipografías Archivo (eje de ancho) + Inter Tight + JetBrains Mono vía `next/font/google`.
- [x] Isologo nuevo (torre escalonada con una unidad encendida en ámbar), favicon y loader en clave de ficha técnica (wordmark en dos tonos, porcentaje en mono, línea de 1 px).
- [x] Hero en tarjeta con radio de 28 px y 12 px de margen; navegación en pills con logo en círculo y "Consultar"; menú mobile en overlay negro. Paneles en tarjetas blancas; selector con chips en pill y estados por forma (lleno, contorno, tachado). Indicación de uso en pill, centrada en la franja libre.
- [x] Secciones con encabezado asimétrico (label numerado + título en dos tonos), cifras 2×2 con conteo, sticker giratorio, bento de amenities con la foto de la azotea, plano en tarjeta, nueva sección "Cómo comprar" (`purchaseSteps`) y footer negro con CTA al showroom y wordmark recortado. Aparición al hacer scroll.
- [x] Ficha fullscreen, galería, visor, modal y planos con el sistema nuevo: botones en pill con →, chips de estado, cierre oscuro, portada que se abre desde un recorte con radio.
- [x] Sin cambios en el render 3D (solo el tooltip HTML de la unidad, que es UI). Sin dependencias nuevas.
- [x] SPEC (§2, §3, §4.4, §4.5, §6.1, §6.3), CLAUDE.md, README e imagen Open Graph actualizados.

**Verificación:** capturas del build de producción a 1440, 1024 y 390 px (loader, hero, cada sección, menú mobile, ficha, modal con errores). Lighthouse escritorio: Accessibility 100, Best Practices 100; Performance 65–67 con TBT alto, igual que el commit anterior medido en el mismo momento (69–70): la máquina estaba cargada. LCP 1,1 s (antes 0,6 s) por la fuente Archivo con eje de ancho.

## Fase 20 — Ajustes del rediseño
- [x] Wordmark del footer en SVG con `textLength`: entra completo a cualquier ancho.
- [x] Bloque editorial del hero y luz del día de 23 a 25rem; columna de "Desde" más ancha y separadores con más aire. Encuadre 3D e indicación de uso ajustados al ancho nuevo.
- [x] Más acento ámbar en piezas puntuales: cinta de "Residencias", slider de luz del día (control y tramo recorrido), línea de los labels de sección, celda de unidades disponibles, botón de la foto de la azotea, números de "Cómo comprar" y CTA del footer.

**Verificación:** capturas del build de producción a 1440 y 390 px (hero, cifras, cómo comprar, footer).
