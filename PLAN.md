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

**Verificación:** ancho del canvas y posición del selector iguales con la ficha abierta y cerrada (1407 / 1375 px; antes 1422 / 1390 con la ficha abierta); autos vistos en recortes ampliados; Lighthouse desktop: Performance 95, Accesibilidad 96, Buenas prácticas 100, CLS 0.
