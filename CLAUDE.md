# CLAUDE.md — Lumen Residencias (demo inmobiliaria 3D)

## Contexto
Landing de una página con un edificio 3D interactivo para vender una demo a un cliente inmobiliario. La especificación completa está en `SPEC.md` y el plan de trabajo en `PLAN.md`. Leé ambos antes de empezar cualquier tarea.

## Forma de trabajo
- Trabajá **una fase de PLAN.md por vez**. Al terminar: `npm run build`, `npm run lint`, verificar los criterios de la fase, marcar checkboxes en PLAN.md y hacer commit.
- Si algo de SPEC.md es ambiguo o contradictorio, preguntá antes de decidir.
- Si cambia una decisión, actualizá SPEC.md o PLAN.md, no la dejes solo en el chat.
- No agregues dependencias fuera de las listadas en SPEC §2 sin preguntar.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (tiene que pasar siempre)
- `npm run lint` — lint

## Reglas técnicas
- Next.js App Router + TypeScript estricto. Tailwind para todos los estilos.
- three.js solo a través de @react-three/fiber y @react-three/drei. El canvas se carga en cliente con `dynamic` sin SSR.
- El edificio se genera **por código a partir de `src/data/building.ts`**. Ningún dato de unidades hardcodeado en componentes 3D o UI.
- Una sola luz puntual para la unidad activa; reutilizar geometrías y materiales; `dpr` limitado a [1, 2].
- Lenis para scroll; detenerlo con ficha/modal abiertos; `data-lenis-prevent` en zonas con scroll propio.
- **Sin backend, sin API routes, sin fetch a servicios externos, sin envío de emails.** El formulario hace `preventDefault` y muestra un estado de demo.

## Reglas de diseño (no negociables)
- El sistema visual es `docs/DESIGN.md` ("Hormigón y luz"), resumido en SPEC §6.3. Leelo antes de tocar la UI.
- Usar solo los tokens de `globals.css` (ink, paper, white, stone-50…800, un único acento ámbar). Tipografías: Archivo (titulares), Inter Tight (texto y UI) y JetBrains Mono (labels, numeración y metadatos).
- Íconos: solo Phosphor, peso *light*. Flechas ↗ y → como motivo.
- Nada de gradientes llamativos (solo el overlay oscuro sutil sobre fotos), emojis, sombras, bordes de color ni frases de marketing genéricas. El blur translúcido queda solo para las pills chicas sobre la escena 3D.
- Tarjetas con radios grandes (20–28 px), botones y chips en pill, bordes de 1 px. El acento ámbar va en puntos concretos (ver SPEC §6.3), nunca en grandes superficies ni como color de texto sobre fondos claros.
- No tocar el render 3D al cambiar la UI: la paleta 3D vive en `src/components/scene/materials.ts`.
- Textos en español rioplatense, concretos y con datos.

## Estructura sugerida
```
src/
  app/            layout, page, estilos globales
  components/
    scene/        Canvas, Building, Level, Unit, Environment, Clouds
    ui/           FloorSelector, UnitDetail (ficha fullscreen), InquiryModal, secciones
  data/           building.ts
  lib/            formato, helpers, store
```
