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
- [x] Store de UI (Zustand): `hoveredId`, `selectedId`, `isPanelOpen`, `isModalOpen`.
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
- [ ] Selector vertical (SUM, 8…1, PB) sincronizado con el 3D en ambos sentidos.
- [ ] Panel de ficha (desktop: lateral; mobile: bottom sheet) según SPEC §6.1, con mini plano SVG.
- [ ] Fichas específicas de PB y SUM.
- [ ] Estados vendida/reservada.
- [ ] Teclado: Tab/flechas en selector, Enter abre, Esc cierra.

**Verificación:** abrir la ficha de las 16 entradas (14 unidades + PB + SUM) y comparar contra SPEC §5.

## Fase 6 — Modal de solicitud
- [ ] Formulario de SPEC §6.2 con validación en cliente.
- [ ] Submit sin envío + estado de confirmación de demo.
- [ ] Focus trap, Esc, retorno de foco.

**Verificación:** confirmar en la pestaña Network que no hay ninguna request al enviar.

## Fase 7 — Resto de la landing + Lenis
- [ ] Hero completo (bloque editorial + 3D + selector + indicación de uso).
- [ ] Secciones: El proyecto, Amenities, Ubicación (plano ilustrado estático), Footer con aviso de demo.
- [ ] Lenis para scroll suave; detenerlo con panel/modal abiertos; `data-lenis-prevent` en zonas con scroll propio; desactivado con `prefers-reduced-motion`.
- [ ] Que el scroll de la página no gire el edificio y que el drag del edificio no scrollee la página.
- [ ] Mobile: OrbitControls pone `touch-action: none` en el canvas y el hero (100svh) no deja scrollear con el dedo; permitir scroll vertical (p. ej. `pan-y` y rotación solo con gesto horizontal).

**Verificación:** revisión visual contra las reglas anti-slop de SPEC §6.3.

## Fase 8 — Pulido y deploy
- [ ] Responsive 360 px → 1920 px.
- [ ] Performance: `dpr` limitado, instancing/merge, pausar render cuando el hero no está visible.
- [ ] Accesibilidad: contraste, labels, roles, foco visible.
- [ ] Metadata, favicon, Open Graph.
- [ ] Lighthouse ≥ 90 (SPEC §7).
- [ ] Deploy en Vercel.

**Verificación:** todos los criterios de aceptación de SPEC §9.
