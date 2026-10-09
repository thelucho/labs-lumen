# SPEC — Demo inmobiliaria 3D "Lumen Residencias"

## 1. Objetivo
Landing de una sola página para **vender la demo a un cliente inmobiliario**. El protagonista es un edificio 3D interactivo (three.js) en el centro del hero: el usuario lo gira, pasa el mouse por las unidades y "se prende la luz" de la unidad apuntada; al hacer click se abre un panel lateral con la ficha de la unidad y un botón "Solicitar información" que abre un formulario en un modal.

Todo es estático: **sin backend, sin API, sin envío de emails, sin servicios externos**. Deploy en Vercel.

## 2. Stack
- **Next.js** (App Router, TypeScript, última versión estable).
- **Tailwind CSS** (última versión estable).
- **three.js** vía **@react-three/fiber** + **@react-three/drei** (OrbitControls, ContactShadows, Clouds o equivalente).
- **Lenis** (paquete `lenis`) para scroll suave de la página.
- Íconos: **Phosphor Icons** (`@phosphor-icons/react`), peso *light* o *regular*, consistente en todo el sitio.
- Tipografías vía `next/font/google`: **Instrument Serif** (títulos) + **Manrope** (texto, UI y datos con `font-variant-numeric: tabular-nums`).
- **Zustand** para el estado de UI compartido entre el canvas y la interfaz.
- **Vitest** (devDependency) para el test de datos (`npm test`).
- Sin librerías de componentes prefabricados (nada de shadcn por defecto, nada de templates).

## 3. Estructura de la página
1. **Hero (100vh)**: edificio 3D centrado. A la izquierda, bloque editorial breve (nombre del proyecto, dirección, 1 línea de propuesta, 3 datos clave). A la derecha del edificio, un **selector vertical de pisos** (SUM, 8…1, PB) que funciona como alternativa accesible al 3D y como navegación en mobile. Indicación sutil de uso: "Arrastrá para girar · Click en una unidad para ver su ficha".
2. **El proyecto**: texto corto + 3 o 4 datos (pisos, unidades, entrega, orientación).
3. **Amenities**: pileta, sauna, gimnasio, SUM con parrillas, solárium (lista con íconos, no cards genéricas).
4. **Ubicación**: dirección ficticia + bloque estático tipo plano/mapa ilustrado (sin Google Maps ni servicios externos).
5. **Contacto / footer**: datos ficticios de la desarrolladora y aviso "Demo — información ilustrativa".

## 4. El edificio 3D

### 4.1 Volumetría
- Orientación: **frente al norte**. El costado con balcones es el **lateral este**.
- Planta tipo: 22 m de frente × 14 m de fondo (escala relativa; 1 unidad three.js = 1 m).
- Alturas: **PB 4,2 m** (hall doble altura vidriado), **pisos 1 a 8: 3 m** cada uno, **SUM 3,5 m** retirado sobre la terraza.
- Niveles: PB (hall) + pisos 1–8 + **SUM (nivel 9)** en la azotea, con terraza y pileta descubierta al lado.
- División de unidades:
  - **Pisos 2 a 7**: 2 unidades por piso, divididas por un eje este-oeste. **A = lado este (con balcón)**, **B = lado oeste (sin balcón)**.
  - **Pisos 1 y 8**: piso completo (1 unidad), con balcón corrido sobre el lateral este.
- La división A/B debe leerse en fachada (bandeja/montante o cambio de carpintería), no solo en la lógica.

### 4.2 Nivel de detalle y estilo
Estilizado arquitectónico: **ni realista ni caricaturesco**. Referencia: maqueta arquitectónica digital limpia.
- Losas visibles en el canto de cada piso (bandas horizontales de hormigón claro).
- Carpinterías con montantes finos, vidrios levemente tintados y semitransparentes que dejan ver un interior simple (piso, pared de fondo, tabique divisorio entre A y B) para que la luz interior se lea.
- Balcones con losa en voladizo y baranda de vidrio o barrotes finos.
- PB: hall vidriado doble altura, marquesina de acceso, número de calle.
- Azotea: SUM como volumen más liviano (más vidrio), pileta con agua (material azul con algo de reflejo), deck, baranda perimetral, sala de máquinas pequeña.
- Materiales: hormigón claro, revestimiento cálido (símil madera o porcelanato) en algunos paños, carpintería grafito. Nada saturado.
- Paleta de materiales 3D: los tokens de §6.3 rigen la UI; el 3D usa su propia paleta desaturada (hormigón, madera, grafito, vidrio, agua, cielo, césped) definida en un único archivo de materiales. La luz de las unidades es cálida (≈ #F2C27B), en línea con `brass`.
- Bordes suaves (bevel leve o `RoundedBox` donde ayude), sombras suaves.

### 4.3 Entorno
- Suelo simple: plano amplio color piedra/césped desaturado, vereda frente al edificio, borde que se funde con el fondo (fog o gradiente).
- **Sol** visible desde un costado (noreste), con una `directionalLight` cálida alineada a él que proyecta sombras.
  - *Decisión*: como la cámara inicial mira frente + lateral este (desde el noreste), un sol real al noreste quedaría detrás de la cámara. La luz viene del noreste (frente y balcones iluminados, sombras al sudoeste) y el **disco** del sol se ubica en el cielo para que aparezca arriba, a un costado del edificio, en la vista inicial. No es físicamente coherente al girar; se acepta como licencia de encuadre.
- 3–5 **nubes** low-poly (sin texturas externas), con movimiento lento.
- Cielo con gradiente suave (no azul saturado).
- `ContactShadows` o sombra real bajo el edificio.

### 4.4 Interacción
- **Rotación**: OrbitControls solo en el eje horizontal (o con ángulo polar muy limitado), sin pan, zoom limitado o deshabilitado. Rotación inicial mostrando frente + lateral este (balcones). Damping activado. Auto-rotación muy lenta mientras no hay interacción (se detiene al primer hover/drag).
- **Hover** (desktop): al apuntar una unidad se "prende su luz" — interior con emisivo cálido (≈ #F2C27B) + una luz puntual dentro de esa unidad. Solo una unidad encendida a la vez; al moverse a otra, la anterior se apaga con transición corta (~150 ms). Cursor `pointer` sobre unidades. Tooltip pequeño con nombre de la unidad ("4° A").
- **Click**: selecciona la unidad (queda encendida aunque el mouse salga) y abre el **panel lateral**. Un drag de rotación **no** debe contar como click (umbral de movimiento).
- PB y SUM también son interactivos y abren su propio panel.
- **Mobile/touch**: tap = seleccionar (no hay hover). El selector de pisos es la vía principal. El panel se abre como bottom sheet.
- El selector de pisos y el 3D están sincronizados (hover en el selector enciende la unidad en el 3D y viceversa).
- Teclado: el selector de pisos es navegable con Tab/flechas; Enter abre la ficha; Esc cierra panel/modal.

## 5. Datos (ficticios pero coherentes)
Todos los datos viven en `src/data/building.ts`, tipados. Ningún dato hardcodeado en componentes.

### 5.1 Proyecto
- Nombre: **Lumen Residencias**
- Dirección: **Los Aromos 1240** (ficticia)
- Desarrolladora: **Arce & Molina Desarrollos** (ficticia)
- Entrega estimada: **diciembre 2027**
- 14 unidades · 8 pisos + PB + SUM · frente norte

### 5.2 Equipamiento común a todas las unidades
- Caldera dual individual (agua caliente + calefacción).
- Preinstalación de aire acondicionado split frío/calor en living y dormitorios.
- Carpinterías de aluminio con DVH.
- Cocina integrada con isla (unidades A y pisos completos) o semi-integrada (unidades B).

### 5.3 Unidades tipo (pisos 2 a 7)
| | **A — lateral este** | **B — lateral oeste** |
|---|---|---|
| Superficie cubierta | 112 m² | 98 m² |
| Balcón | Sí, 12 m² (lateral este) | No |
| Superficie total | 124 m² | 98 m² |
| Ambientes | 4 | 3 |
| Dormitorios | 3 | 2 |
| Dormitorios en suite | 1 | 1 |
| Baños | 2 + toilette | 2 |
| Vista | Frente y lateral este | Frente y lateral oeste |
| Losa radiante | Sí | No |
| Calefacción | Losa radiante (caldera dual) | Radiadores (caldera dual) |
| Cocheras incluidas | 1 | 1 |
| Baulera | Sí | Sí |

### 5.4 Pisos completos (pisos 1 y 8)
- Superficie cubierta 210 m² + balcón corrido 24 m² (lateral este) = 234 m² totales.
- 5 ambientes · 4 dormitorios · 2 en suite · 3 baños + toilette · lavadero independiente.
- Vista: frente, lateral este y lateral oeste (piso 8: además vista abierta, último piso).
- Losa radiante · calefacción por losa radiante (caldera dual).
- 2 cocheras + baulera.
- Ascensor con acceso directo a palier privado.

### 5.5 Precios (USD)
Regla: superficie ponderada = cubierta + 50 % del balcón. Valor del m² sube 2,5 % por piso desde USD 2.900 (piso 2), en forma **lineal** sobre esa base (+USD 72,5/m² por piso, no compuesto). Precio = superficie ponderada × valor del m², **redondeado al millar más cercano**. Pisos completos con valor propio.

| Piso | A (118 m² pond.) | B (98 m² pond.) |
|---|---|---|
| 2 | 342.000 | 284.000 |
| 3 | 351.000 | 291.000 |
| 4 | 359.000 | 298.000 |
| 5 | 368.000 | 306.000 |
| 6 | 376.000 | 313.000 |
| 7 | 385.000 | 320.000 |

- **Piso 1 completo** (222 m² pond. × USD 3.000): **USD 666.000**
- **Piso 8 completo** (222 m² pond. × USD 3.500): **USD 777.000**

### 5.6 Estado comercial (para que la demo se vea "viva")
- Vendidas: 2° B, 3° A, 5° B.
- Reservadas: 6° A, Piso 8.
- Resto: disponibles.
- Unidades vendidas: se pueden ver pero sin precio ("Vendida") y sin botón de solicitar info; el 3D las muestra con luz más tenue/neutra al hover.

### 5.7 Planta baja — Hall
- Hall de acceso doble altura con recepción.
- Seguridad 24 h y control de acceso con tarjeta.
- 2 ascensores (uno con acceso directo a pisos completos).
- Subsuelo: 16 cocheras + 14 bauleras.
- Bicicletero y sala de residuos.
- Acceso accesible (rampa) y portón automático a cocheras.

### 5.8 SUM — Nivel 9 (azotea)
- SUM cubierto de 120 m² con cocina y 2 parrillas.
- 2 baños (uno accesible) + vestuarios.
- Terraza de 180 m² con pileta descubierta de 8 × 3,5 m y solárium con deck.
- Gimnasio equipado (45 m²) y sauna seco.
- Vista 360°.

## 6. UI

### 6.1 Panel lateral (ficha de unidad)
- Se desliza desde la derecha en desktop (≈ 420 px), bottom sheet en mobile.
- Encabezado: nombre de la unidad ("Piso 4 · Unidad A"), estado (Disponible / Reservada / Vendida) como etiqueta discreta.
- Precio destacado en USD con separador de miles (`USD 359.000`).
- Datos en lista de dos columnas (etiqueta / valor), números tabulares, separadores finos. Íconos Phosphor solo donde aportan (m², dormitorios, baño, balcón, vista, calefacción).
- Mini plano esquemático de la planta resaltando la unidad (SVG simple: rectángulo de planta con la mitad A o B marcada, flecha de norte).
- Botón primario "Solicitar información" (oculto si está vendida).
- Navegación "Piso anterior / siguiente" dentro del panel.
- Fichas distintas para PB y SUM (datos de 5.7 y 5.8, sin precio ni formulario de unidad; el SUM puede tener "Consultar por amenities").
- Cerrar con X, Esc o click fuera. El scroll interno del panel no debe ser capturado por Lenis (`data-lenis-prevent`).

### 6.2 Modal "Solicitar información"
Campos: nombre y apellido, email, teléfono, unidad (precargada, solo lectura), cómo prefiere que lo contacten (WhatsApp / llamada / email), mensaje (opcional, con texto sugerido), checkbox de aceptación.
- Validación visual básica en el cliente (requeridos, formato de email).
- Al enviar: `preventDefault`, **no se envía nada**, se muestra un estado de confirmación con el aviso "Esto es una demo: el formulario no envía datos".
- Focus trap, Esc para cerrar, foco devuelto al botón que lo abrió. Lenis detenido mientras el modal está abierto.

### 6.3 Dirección visual (anti "AI slop")
Tono: **estudio de arquitectura / desarrolladora premium**, editorial, sobrio.

Paleta (definir como tokens de Tailwind):
| Token | Hex | Uso |
|---|---|---|
| `paper` | #F2EFEA | Fondo principal |
| `stone` | #D9D3C7 | Fondos secundarios, bordes |
| `graphite` | #23262A | Texto principal, carpinterías |
| `slate` | #6B6F73 | Texto secundario |
| `brass` | #B8833E | Acento: luz encendida, CTA, selección |
| `sage` | #5E6B5A | Estado "Disponible" |
| `clay` | #A2643F | Estado "Reservada" |

Reglas:
- Prohibido: gradientes violeta/azul, glassmorphism, emojis, "✨", sombras grandes en todo, cards con `rounded-2xl` repetidas, hero con texto centrado en gradiente, frases de marketing genéricas ("Descubrí tu hogar ideal", "Viví la experiencia").
- Sí: líneas finas de 1 px, mucho espacio en blanco, etiquetas en versalitas pequeñas con tracking amplio, cifras grandes en serif, radios chicos (2–4 px) o rectos, animaciones cortas y sobrias.
- Textos escritos como los de una desarrolladora real: concretos, con datos.
- El acento `brass` es el mismo color que la luz de las unidades: conecta 3D y UI.

## 7. Requisitos no funcionales
- Lighthouse (desktop) ≥ 90 en Performance, Accessibility y Best Practices.
- 60 fps en una laptop media; `dpr` limitado a [1, 2]; geometrías repetidas con instancing o merge; una sola luz puntual que se mueve a la unidad activa (no una luz por unidad).
- El canvas se carga solo en cliente (`dynamic` sin SSR) con un placeholder estático mientras carga.
- Responsive desde 360 px. En mobile el edificio ocupa el ancho y el texto del hero va debajo.
- `prefers-reduced-motion`: sin auto-rotación ni scroll suave.
- `npm run build` y `npm run lint` sin errores. Deploy en Vercel sin configuración extra.

## 8. Fuera de alcance
Backend, APIs, envío de emails, analytics, CMS, i18n, mapas de terceros, login, modelos 3D externos (.glb) — todo el edificio se modela por código.

## 9. Criterios de aceptación
1. El edificio aparece centrado en el hero con suelo, sol y nubes.
2. Se puede girar con el mouse/touch para ver los cuatro costados.
3. Hover sobre una unidad la ilumina; solo una a la vez; al cambiar de unidad la anterior se apaga.
4. Pisos 2–7 tienen 2 unidades; pisos 1 y 8 son piso completo; todas las unidades del lateral este y los pisos 1 y 8 tienen balcón visible.
5. Click en cualquier unidad, en PB o en el SUM abre su ficha con los datos de la sección 5.
6. "Solicitar información" abre el modal, valida y muestra la confirmación de demo sin enviar nada.
7. Selector de pisos sincronizado con el 3D y usable con teclado.
8. Funciona en mobile (tap + bottom sheet).
9. Build limpio y deployado en Vercel.
