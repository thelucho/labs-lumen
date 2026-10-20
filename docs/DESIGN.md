# Design System — Estudio de Arquitectura

> Fuente de verdad visual del sitio. Antes de crear o modificar cualquier componente, seguí este documento.
> Si algo no está definido acá, elegí la opción más sobria, con más aire y menos decoración.

---

## 1. Concepto: "Hormigón y luz"

Tres referencias analizadas (Sukio Housing, Grafty, Architekta) comparten una misma lógica:
**la fotografía de arquitectura es la protagonista y la interfaz se retira**. La UI es casi
monocromática (negro, blanco, grises cálidos tipo piedra), con un único acento cálido que remite
a la luz interior de un edificio al atardecer.

Principios:

1. **La imagen manda.** Fotos grandes, a sangre o en tarjetas con bordes muy redondeados. Nada de ilustraciones genéricas ni gradientes de color.
2. **Tipografía como estructura.** Titulares enormes, interlineado apretado, tracking negativo. El texto se compone como una fachada: bloques, alineaciones claras, jerarquía fuerte.
3. **Aire generoso.** Secciones con mucho padding vertical. El vacío es un material más.
4. **Precisión técnica.** Numeración (01, 02, 03), etiquetas pequeñas en mayúsculas, líneas finas de 1px, flechas ↗. Evoca planos y fichas técnicas.
5. **Un solo acento.** El color de acento aparece poco: un badge, un dato destacado, un hover. Nunca en grandes superficies salvo un bloque puntual.

Qué evitar: sombras pesadas, gradientes de colores saturados, bordes de colores, emojis, iconos rellenos y coloridos, más de un color de acento, tarjetas con sombra "flotante" estilo dashboard SaaS, fuentes redondeadas o "amigables".

---

## 2. Análisis de las referencias

### Referencia 1 — "Sukio Housing" (bento layout)
- Hero en tarjeta con radio grande (~28px), foto a sangre, overlay oscuro sutil en la parte inferior para legibilidad.
- Titular blanco enorme sobre la foto, alineado abajo a la izquierda, 3 líneas, interlineado ~0.95.
- Navegación como **pills con borde 1px** blanco translúcido sobre la imagen (Home / About / Project).
- **Sticker circular festoneado** ("EXPLORE") blanco con texto negro rotado: detalle lúdico y de marca.
- Indicador de slide con puntos pequeños + número "01" y subtítulo del proyecto con una línea fina debajo.
- Grilla **bento** debajo del hero: 3 tarjetas con radio ~20px y fondo gris muy claro (#EFEFEF aprox.), una de ellas en **amarillo** (#F7DD6E aprox.) con el dato "130k+".
- Chips/tags: pill negra (activa) + pills blancas con borde (Architecture, Interior, Building…).
- Números grandes ("12", "130k+") en peso regular, no bold: elegancia por tamaño, no por peso.
- Lista de proceso como **pills anchas con borde**, icono a la izquierda y número "01/02/03" en círculo negro a la derecha.
- Testimonio sobre foto con **etiquetas negras de texto blanco** ("Don't Trust us, Trust Our Client") estilo cinta, badge estrellado amarillo con rating "4.7".
- Franja de logos de clientes en gris/negro, una línea.
- FAQ en tarjeta gris con acordeón de líneas finas.

### Referencia 2 — "Grafty" (editorial, una columna)
- Titulares **en MAYÚSCULAS, grotesca ancha y pesada**, tracking muy apretado, a menudo en dos tonos: primera parte negra, segunda en gris claro ("SOME OF OUR LATEST / PROJECTS").
- **Etiquetas de sección** pequeñas: `01 ——— ABOUT US` (número + línea + label en mayúsculas, tamaño ~11px).
- Fila de **estadísticas** en grilla 2×2 con divisores de 1px: label pequeño arriba a la izquierda + flecha ↗ fina, número gigante alineado a la derecha ("5.00", "12", "07", "370+").
- Bloque de proyectos sobre fondo gris claro con radio grande: lista de categorías a la izquierda (activa en negro, resto en gris) + imagen a la derecha.
- **Servicios como acordeón horizontal**: columnas verticales con texto rotado 90° (ARCHITECTURE, RESIDENTIAL, INTERIOR…), una expandida con imagen y descripción.
- Hero secundario full-width con foto oscura y título blanco centrado en mayúsculas ("JUNGLE VILLA HOUSING"), metadato "2780 SQFT" en esquina.
- Testimonio en tarjeta blanca + foto de la persona + badge estrellado negro "4.9 Rating".
- Logos de clientes dentro de **círculos con borde fino**.
- Footer negro: CTA gigante centrado "ANYTHING IN MIND? LET'S TALK", botón pill blanco, datos de contacto, y **wordmark gigante recortado** en el borde inferior.

### Referencia 3 — "Architekta" (hero cinematográfico)
- Foto full-bleed al atardecer: cielo azul grisáceo + interiores color ámbar. **Esta dualidad azul frío / ámbar cálido es una excelente fuente de paleta.**
- Palabra gigante de fondo ("BEYOND") en blanco con baja opacidad **detrás** del edificio (efecto de profundidad: texto entre cielo y edificio).
- Titular en sans neutral, peso regular, sentence case, blanco. Subtítulo en blanco 80%.
- Botones: primario negro sólido con radio pequeño (~6px) + flecha →; secundario blanco.
- Navegación limpia sobre la imagen, links blancos con chevrons.
- Miniaturas tipo carrusel con radio ~12px y borde blanco en la activa; flechas en círculos blancos.

### Denominador común a adoptar
| Aspecto | Decisión |
|---|---|
| Color base | Negro tinta + blanco + grises "piedra" cálidos |
| Acento | Uno solo, cálido (ámbar/luz interior) |
| Titulares | Grotesca, grande, tracking negativo, interlineado < 1 |
| Labels | Mayúsculas pequeñas, tracking positivo, numeradas |
| Formas | Tarjetas con radio grande; botones y chips en pill |
| Líneas | Bordes y divisores de 1px |
| Iconos | Lineales finos, flechas como motivo recurrente (↗ →) |
| Imágenes | Grandes, radio grande, overlay oscuro sutil para texto encima |

---

## 3. Tipografía

### Combinación recomendada (Google Fonts, gratis, auto-hosteable)

| Rol | Fuente | Uso |
|---|---|---|
| Display | **Archivo** (variable, ejes `wght` 100–900 y `wdth` 62–125) | Titulares hero y de sección. En mayúsculas usar `wdth` 112–125 y peso 700–800 (estilo Grafty). En sentence case, `wdth` 100 y peso 500. |
| Texto / UI | **Inter Tight** (o **Inter**) | Párrafos, navegación, botones, tarjetas. |
| Técnica | **JetBrains Mono** (o **IBM Plex Mono**) | Numeración 01/02, metadatos (m², año, ubicación), labels de sección. Da el carácter de "plano técnico". |

### Alternativa más "de autor" (Fontshare, gratis para uso comercial)
- Display: **Clash Grotesk** o **Clash Display**
- Texto: **General Sans** (es lo más parecido a la referencia 1)
- Técnica: mantener JetBrains Mono

> Elegir **una** de las dos combinaciones y no mezclar.

### Escala tipográfica (fluida, base 16px)

| Token | Tamaño (clamp) | Line-height | Tracking | Peso | Uso |
|---|---|---|---|---|---|
| `display-2xl` | `clamp(3.5rem, 9vw, 9rem)` | 0.9 | -0.04em | 700–800 | Hero, wordmark footer |
| `display-xl` | `clamp(2.75rem, 6vw, 6rem)` | 0.95 | -0.035em | 600–700 | Títulos de sección grandes, CTA |
| `display-lg` | `clamp(2rem, 4vw, 3.75rem)` | 1.0 | -0.03em | 500–600 | Títulos de sección |
| `heading` | `clamp(1.5rem, 2.2vw, 2.25rem)` | 1.1 | -0.02em | 500 | Subtítulos, nombres de proyecto |
| `stat` | `clamp(3rem, 6vw, 5.5rem)` | 1.0 | -0.04em | 400 | Números/estadísticas (peso regular, no bold) |
| `body-lg` | 1.125rem | 1.55 | -0.005em | 400 | Intro, lead |
| `body` | 1rem | 1.6 | 0 | 400 | Texto general |
| `small` | 0.875rem | 1.5 | 0 | 400 | Descripciones de tarjetas |
| `label` | 0.6875rem (11px) | 1.2 | +0.12em | 500, MAYÚSCULAS | Labels de sección, tags, metadatos (fuente mono) |

Reglas:
- Titulares de dos tonos: la segunda parte en `--color-stone-400`. Ej.: "Proyectos **recientes**" con "recientes" en gris.
- Nunca usar bold (700+) en párrafos. El énfasis se logra con tamaño y color.
- Ancho máximo de párrafo: `65ch`.

---

## 4. Color

Paleta "Hormigón y luz". Los grises son levemente cálidos (tono piedra/hormigón), no grises azulados de software.

### Neutros
| Token | Hex | Uso |
|---|---|---|
| `--color-ink` | `#111110` | Texto principal, botones primarios, fondos oscuros |
| `--color-ink-soft` | `#1C1B19` | Superficies oscuras secundarias (footer, tarjetas dark) |
| `--color-paper` | `#FAFAF8` | Fondo de página |
| `--color-white` | `#FFFFFF` | Tarjetas sobre fondo stone, botones secundarios |
| `--color-stone-50` | `#F4F3F0` | Fondo de tarjetas bento / secciones alternas |
| `--color-stone-100` | `#ECEAE5` | Fondo hover de tarjetas, chips |
| `--color-stone-200` | `#DEDBD4` | Bordes y divisores (1px) |
| `--color-stone-400` | `#A9A59C` | Texto secundario de titulares de dos tonos, placeholders |
| `--color-stone-600` | `#6E6A62` | Texto secundario / metadatos |
| `--color-stone-800` | `#3A3833` | Texto sobre fondos claros cuando ink es demasiado fuerte |

### Acento (elegir UNO)
| Opción | Hex | Carácter |
|---|---|---|
| **A — Ámbar luz interior** (recomendada) | `#E9A23B` | Cálido, sofisticado, sale directamente de la ref. 3 |
| B — Amarillo arquitectónico | `#F2D45C` | Más fresco y llamativo, como la ref. 1 |
| C — Terracota | `#C2643C` | Más terroso, ideal si el estudio trabaja materiales naturales |

`--color-accent` = el elegido. `--color-accent-ink` = `#111110` (el texto sobre el acento siempre es tinta, nunca blanco).

### Secundario frío (opcional, muy puntual)
`--color-dusk` = `#5E6B85` — azul atardecer de la ref. 3. Solo para overlays de imagen o un fondo de sección especial. Nunca para botones.

### Overlays sobre fotos
- Inferior para legibilidad: `linear-gradient(to top, rgb(17 17 16 / 0.65) 0%, rgb(17 17 16 / 0) 55%)`
- Texto sobre foto: blanco 100% para titulares, `rgb(255 255 255 / 0.8)` para subtítulos.
- Elementos de UI sobre foto (nav pills): borde `rgb(255 255 255 / 0.35)`, fondo `rgb(255 255 255 / 0.08)` + `backdrop-filter: blur(12px)`.

### Proporción de uso
~70% paper/blanco, ~20% stone, ~8% ink, ~2% acento.

---

## 5. Espaciado y layout

### Escala (base 4px)
`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 20px` · `--space-6: 24px` · `--space-8: 32px` · `--space-10: 40px` · `--space-12: 48px` · `--space-16: 64px` · `--space-20: 80px` · `--space-24: 96px` · `--space-32: 128px` · `--space-40: 160px`

### Secciones
- Padding vertical de sección: `clamp(80px, 12vw, 160px)`.
- Separación entre label de sección y título: 24px. Entre título y contenido: 48–64px.
- Hero: altura `min(100svh, 920px)`, con margen de 12–16px alrededor cuando va en tarjeta (estilo ref. 1).

### Contenedor y grilla
- Ancho máximo: `1440px`. Contenido de texto: `1200px`.
- Gutter lateral: `clamp(16px, 4vw, 48px)`.
- Grilla de 12 columnas, gap `24px` (desktop) / `16px` (mobile).
- Bento: gap de 12–16px entre tarjetas (más apretado que la grilla general, como la ref. 1).
- Encabezados de sección en layout **asimétrico**: label a la izquierda (columnas 1–4), título a la derecha (columnas 5–12). Esto aparece en la ref. 2 y da un aire editorial.

### Breakpoints
`sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`

---

## 6. Formas, bordes y elevación

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 6px | Botones rectangulares (estilo ref. 3), inputs |
| `--radius-sm` | 12px | Miniaturas, imágenes pequeñas |
| `--radius-md` | 20px | Tarjetas de proyecto, tarjetas bento |
| `--radius-lg` | 28px | Hero, secciones contenedoras, imágenes grandes |
| `--radius-full` | 9999px | Pills: nav, chips, botones principales, steps |

- Bordes: siempre **1px** `--color-stone-200` (fondo claro) o `rgb(255 255 255 / 0.2)` (fondo oscuro).
- **Sin sombras** por defecto. Única excepción: tarjetas flotando sobre una foto (testimonio) → `0 20px 40px -20px rgb(17 17 16 / 0.25)`.
- Elegir **un** estilo de botón primario para todo el sitio: pill (recomendado, más coherente con chips y nav) o rectangular con radius-xs.

---

## 7. Iconografía

**Librería recomendada: [Phosphor Icons](https://phosphoricons.com)** en peso `light` o `regular` (tiene variantes de peso, ideal para ajustar a la tipografía).
Alternativa: **[Lucide](https://lucide.dev)** con `stroke-width={1.5}`.

Reglas:
- Siempre lineales, nunca rellenos (salvo el icono dentro de un círculo negro, donde el icono va blanco).
- Tamaños: 16px (inline en texto/labels), 20px (botones), 24px (tarjetas/listas).
- Color: hereda `currentColor`.
- **La flecha es el motivo de marca**: `ArrowUpRight` (↗) en tarjetas de proyecto y stats, `ArrowRight` (→) en botones y CTAs. En hover la flecha se desplaza 2–4px en su dirección o rota de ↗ a →.
- Botones de icono: círculo de 40–48px, borde 1px o fondo ink con icono blanco.
- Iconos para servicios/proceso: usar los de la librería en contenedor circular de 40px con borde 1px (como la lista de proceso de la ref. 1). Ejemplos Phosphor: `ChatsCircle` (consulta), `Stack` (concepto), `PencilRuler` (diseño), `Compass`, `Ruler`, `HouseLine`, `Buildings`, `Cube`, `Blueprint`.

---

## 8. Componentes

### Navegación
- Sobre el hero (transparente) con links en **pills con borde** translúcido; logo a la izquierda en círculo o wordmark; botón CTA a la derecha.
- Al hacer scroll: fondo `paper` con `backdrop-blur`, borde inferior 1px, links en ink.
- Mobile: botón circular con icono de menú → overlay de pantalla completa negro con links en `display-lg`.

### Botones
| Variante | Estilo |
|---|---|
| Primario | Fondo ink, texto blanco, pill, padding 14px 24px, icono → a la derecha. Hover: el icono se desplaza; fondo `ink-soft`. |
| Secundario | Fondo transparente, borde 1px ink (o blanco sobre foto), mismo tamaño. Hover: invierte colores. |
| Sobre foto | Blanco sólido con texto ink. |
| Icono | Círculo 44px; flechas de carrusel. |
| Link | Texto + `ArrowUpRight`, subrayado de 1px que crece de izquierda a derecha en hover. |

### Chips / Tags
Pill, padding 6px 14px, fuente `label` o `small`. Default: fondo blanco + borde 1px stone-200. Activo: fondo ink + texto blanco. Sobre foto: fondo `rgb(255 255 255/0.15)` + blur.

### Label de sección
```
01 ———— SOBRE NOSOTROS
```
Fuente mono, `label`, color stone-600; número + línea de 48px × 1px + texto.

### Título de sección en dos tonos
"Proyectos" en ink + "recientes" en stone-400, mismo tamaño, una sola pieza tipográfica.

### Hero
- Variante A (tarjeta, ref. 1): foto en tarjeta radius-lg con margen 12px al viewport, titular abajo-izquierda, nav en pills arriba, metadato del proyecto abajo-derecha ("01 · Nombre del proyecto" + línea fina), sticker circular giratorio.
- Variante B (cinematográfica, ref. 3): full-bleed, palabra gigante de fondo con opacidad 0.25–0.35, titular sentence case, botón primario, miniaturas de otros proyectos abajo-derecha.
- Elegir una para el home. La otra puede usarse en la página de proyecto individual.

### Sticker circular giratorio
Círculo de 120–140px blanco (o acento), borde festoneado (SVG) o liso, texto en `textPath` circular en mayúsculas ("VER PROYECTOS · VER PROYECTOS ·"), rotación continua lenta (20s por vuelta), se detiene en hover. Detalle de marca: máximo uno por página.

### Estadísticas
Grilla 2×2 o 4×1 con divisores 1px. Cada celda: label (2 líneas, small) + `ArrowUpRight` arriba; número `stat` abajo a la derecha; descripción pequeña debajo. Animar el conteo al entrar en viewport.

### Tarjeta de proyecto
- Imagen radius-md, ratio 4:5 o 3:4 (verticales se ven más editoriales).
- Debajo: chips (tipología, año), nombre del proyecto en `heading` o `body-lg`, ubicación en mono stone-600, `ArrowUpRight` alineada a la derecha.
- Hover: zoom de imagen 1.04 en 600ms, flecha rota a →.

### Bento grid
Tarjetas stone-50 radius-md, padding 24–32px. Una única tarjeta con fondo acento por bloque. Contenido típico: años de experiencia + chips de servicios, testimonio corto, número de clientes/obras con avatares superpuestos.

### Lista de proceso
Pills anchas (radius-full), borde 1px, padding 16px 20px: icono en círculo con borde a la izquierda, texto `body-lg`, número "01" en círculo ink con texto blanco (fuente mono) a la derecha.

### Acordeón de servicios (ref. 2)
Columnas verticales en desktop: cerradas muestran número arriba y nombre rotado -90° abajo; la activa se expande con descripción + imagen. Transición de `flex-grow` de 500ms. En mobile se convierte en acordeón vertical clásico.

### Testimonio
Tarjeta blanca radius-md sobre foto o junto a una foto de la persona. Comillas grandes como glifo tipográfico (no icono), cita en `heading` peso 400, nombre + cargo en small, estrellas lineales. Badge de rating: estrella festoneada (SVG) en acento o ink, con número + "Rating".

### Logos de clientes / partners
En escala de grises (`filter: grayscale(1); opacity: .6`, 1 en hover), una fila o dentro de círculos con borde 1px. Opcional: marquee infinito lento.

### FAQ
Tarjeta stone-50 radius-lg, título a la izquierda, acordeón a la derecha con divisores 1px e icono `Plus` que rota 45° al abrir.

### Footer
Fondo ink. CTA gigante centrado en `display-xl` mayúsculas, botón pill blanco. Grilla de datos (email, teléfono, dirección) en texto blanco/60%. Abajo: **wordmark del estudio en `display-2xl` ancho completo, recortado por el borde inferior** (`overflow: hidden`, mostrar ~70% de la altura de las letras).

### Imágenes
- Siempre `object-fit: cover`, radius según contexto.
- Lazy loading y formato AVIF/WebP.
- Reveal al entrar en viewport: `clip-path: inset(10% 10% 10% 10% round 28px)` → `inset(0 round 28px)` + scale 1.1 → 1.

---

## 9. Movimiento

- Easing por defecto: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out expo suave).
- Duraciones: 200ms (hover UI), 400ms (componentes), 700–900ms (reveals de imagen y titulares).
- Titulares: reveal por línea (translateY 100% → 0 con máscara), stagger 80ms.
- Smooth scroll sutil (Lenis) opcional.
- Respetar `prefers-reduced-motion`: desactivar rotación del sticker, reveals y marquee.

---

## 10. Stack recomendado (todo gratuito)

| Necesidad | Herramienta |
|---|---|
| CSS | **Tailwind CSS v4** con tokens en `@theme` (o CSS variables puras si el proyecto no usa Tailwind) |
| Componentes (si es React) | **shadcn/ui** como base de accesibilidad (acordeón, dialog, sheet) re-estilado con estos tokens. Si no es React, componentes propios. |
| Iconos | **Phosphor Icons** (`@phosphor-icons/react` o web) / alternativa Lucide |
| Animación | **Motion** (ex Framer Motion) para React, o **GSAP** + ScrollTrigger (gratuito, incluidos plugins) |
| Smooth scroll | **Lenis** |
| Carruseles | **Embla Carousel** |
| Fuentes | Google Fonts auto-hosteadas (`@fontsource-variable/archivo`, `@fontsource-variable/inter-tight`, `@fontsource-variable/jetbrains-mono`) o `next/font` si es Next.js |

---

## 11. Tokens

### 11.0 Migración: el proyecto YA tiene variables CSS

El proyecto ya define tokens propios. **No crear un segundo sistema en paralelo.** Proceso obligatorio:

1. **Inventariar** todas las variables existentes (`:root`, `@theme`, `tailwind.config`, archivos de tema) y dónde se usan (cantidad de usos por variable).
2. **Mapear** cada variable existente a un token de este documento en una tabla `variable actual → token nuevo → acción`:
   - **Mantener nombre, cambiar valor**: si la variable cumple el mismo rol (ej. `--primary` → valor de `--color-ink`). Es la opción preferida: cambia el estilo sin tocar componentes.
   - **Alias**: si hay que renombrar, dejar temporalmente `--nombre-viejo: var(--token-nuevo);` para no romper nada, y migrar los usos después.
   - **Eliminar**: solo si queda sin usos.
   - **Agregar**: tokens de este documento que no tienen equivalente (ej. `--font-mono`, `--radius-lg`, `--color-accent`).
3. **Respetar la convención de nombres existente** (prefijos, kebab-case, semántico vs. literal). Si el proyecto usa nombres semánticos (`--background`, `--foreground`, `--muted`, `--border`, `--primary` como en shadcn/ui), mantenerlos y asignarles estos valores:

| Semántico típico | Valor de este sistema |
|---|---|
| `--background` | paper `#FAFAF8` |
| `--foreground` | ink `#111110` |
| `--card` | white `#FFFFFF` o stone-50 |
| `--muted` | stone-50 `#F4F3F0` |
| `--muted-foreground` | stone-600 `#6E6A62` |
| `--border` / `--input` | stone-200 `#DEDBD4` |
| `--primary` | ink `#111110` |
| `--primary-foreground` | white |
| `--secondary` | stone-100 `#ECEAE5` |
| `--accent` | acento elegido (ej. `#E9A23B`) |
| `--accent-foreground` | ink |
| `--ring` | ink o stone-400 |
| `--radius` | 20px (`--radius-md`) |

4. Hacer la migración en **dos pasos**: (a) solo tokens/valores y verificar visualmente; (b) después, componente por componente.

Los bloques de abajo son la **referencia de valores**, no algo para pegar encima de lo existente.

### 11.1 Referencia de tokens

### Tailwind v4 (`app.css` / `globals.css`)
```css
@import "tailwindcss";

@theme {
  /* Fuentes */
  --font-display: "Archivo Variable", "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter Tight Variable", "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace;

  /* Color */
  --color-ink: #111110;
  --color-ink-soft: #1c1b19;
  --color-paper: #fafaf8;
  --color-white: #ffffff;
  --color-stone-50: #f4f3f0;
  --color-stone-100: #eceae5;
  --color-stone-200: #dedbd4;
  --color-stone-400: #a9a59c;
  --color-stone-600: #6e6a62;
  --color-stone-800: #3a3833;
  --color-accent: #e9a23b;
  --color-accent-ink: #111110;
  --color-dusk: #5e6b85;

  /* Radios */
  --radius-xs: 6px;
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 28px;

  /* Tipografía */
  --text-display-2xl: clamp(3.5rem, 9vw, 9rem);
  --text-display-2xl--line-height: 0.9;
  --text-display-2xl--letter-spacing: -0.04em;
  --text-display-xl: clamp(2.75rem, 6vw, 6rem);
  --text-display-xl--line-height: 0.95;
  --text-display-xl--letter-spacing: -0.035em;
  --text-display-lg: clamp(2rem, 4vw, 3.75rem);
  --text-display-lg--line-height: 1;
  --text-display-lg--letter-spacing: -0.03em;
  --text-heading: clamp(1.5rem, 2.2vw, 2.25rem);
  --text-heading--line-height: 1.1;
  --text-heading--letter-spacing: -0.02em;
  --text-stat: clamp(3rem, 6vw, 5.5rem);
  --text-stat--line-height: 1;
  --text-stat--letter-spacing: -0.04em;
  --text-label: 0.6875rem;
  --text-label--line-height: 1.2;
  --text-label--letter-spacing: 0.12em;

  /* Movimiento */
  --ease-arch: cubic-bezier(0.22, 1, 0.36, 1);
}

@layer base {
  html { background: var(--color-paper); color: var(--color-ink); }
  body { font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  h1, h2, h3 { font-family: var(--font-display); font-weight: 600; text-wrap: balance; }
  p { text-wrap: pretty; }
}

@utility section-y { padding-block: clamp(80px, 12vw, 160px); }
@utility container-arch {
  width: 100%; max-width: 1440px; margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 48px);
}
@utility label-tech {
  font-family: var(--font-mono); font-size: var(--text-label);
  letter-spacing: var(--text-label--letter-spacing);
  text-transform: uppercase; color: var(--color-stone-600);
}
@utility display-wide { font-variation-settings: "wdth" 120; text-transform: uppercase; }
```

### CSS puro (si no hay Tailwind)
Usar los mismos valores como variables en `:root` con prefijo `--` (ej.: `--color-ink`, `--radius-md`, `--font-display`) y clases utilitarias equivalentes.

---

## 12. Checklist para cada componente

- [ ] ¿Usa solo tokens de este documento (sin hex sueltos ni tamaños arbitrarios)?
- [ ] ¿El acento aparece como máximo una vez en la vista?
- [ ] ¿Bordes de 1px y sin sombras innecesarias?
- [ ] ¿Titulares en fuente display con tracking negativo?
- [ ] ¿Labels/metadatos en mono, mayúsculas, pequeños?
- [ ] ¿Las flechas ↗/→ siguen el patrón de hover?
- [ ] ¿Funciona en 375px de ancho sin scroll horizontal?
- [ ] ¿Contraste AA en texto sobre foto (overlay aplicado)?
- [ ] ¿Respeta `prefers-reduced-motion`?
