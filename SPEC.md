# SPEC — Demo inmobiliaria 3D "Lumen Residencias"

## 1. Objetivo
Landing de una sola página para **vender la demo a un cliente inmobiliario**. El protagonista es un edificio 3D interactivo (three.js) en el centro del hero: el usuario lo gira, pasa el mouse por las unidades y "se prende la luz" de la unidad apuntada; al hacer click se abre la ficha de la unidad a pantalla completa (§6.1), con fotos y un botón "Solicitar información" que abre un formulario en un modal.

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
1. **Hero (100vh)**: edificio 3D centrado. A la izquierda, bloque editorial breve (nombre del proyecto, dirección, 1 línea de propuesta, 3 datos clave). A la derecha del edificio, un **selector vertical de pisos** (SUM, 12…1, PB) que funciona como alternativa accesible al 3D y como navegación en mobile. Indicación sutil de uso: "Arrastrá para girar · Click en una unidad para ver su ficha".
2. **El proyecto**: texto corto + 3 o 4 datos (pisos, unidades, entrega, orientación).
3. **Amenities**: pileta, sauna, gimnasio, SUM con parrillas, solárium (lista con íconos, no cards genéricas).
4. **Ubicación**: dirección ficticia + bloque estático tipo plano/mapa ilustrado (sin Google Maps ni servicios externos).
5. **Contacto / footer**: datos ficticios de la desarrolladora y aviso "Demo — información ilustrativa".

## 4. El edificio 3D

### 4.1 Volumetría
- Orientación: **frente al norte**. El costado con balcones es el **lateral este**.
- Planta tipo: 22 m de frente × 14 m de fondo (escala relativa; 1 unidad three.js = 1 m).
- *Decisión (fase 15)*: el edificio crece a **12 pisos**: departamentos del 1 al 8 y **oficinas del 9 al 12**; el SUM sigue en la azotea.
- Alturas: **PB 4,2 m** (hall doble altura), **pisos 1 a 8: 3 m** cada uno, **pisos 9 a 12 (oficinas): 3,4 m** (piso técnico y cielorraso), **SUM 3,5 m** retirado sobre la terraza. Altura total: 45,3 m.
- Niveles: PB (hall) + pisos 1–12 + **SUM (nivel 13)** en la azotea, con terraza y pileta descubierta al lado.
- División de unidades:
  - **Pisos 1 a 8**: 2 departamentos por piso, divididos por un eje este-oeste. **A = lado este (con balcón)**, **B = lado oeste (sin balcón)**. *Fase 15*: ya no hay pisos completos.
  - **Pisos 9 a 12**: una oficina por piso en planta libre (piso entero), con fachada de vidrio casi de piso a techo y aleros horizontales de grafito en frente y oeste: se leen como una banda distinta sobre los departamentos.
- La división A/B debe leerse en fachada (bandeja/montante o cambio de carpintería), no solo en la lógica.

### 4.2 Nivel de detalle y estilo
Estilizado arquitectónico: **ni realista ni caricaturesco**. Referencia: maqueta arquitectónica digital limpia.
- *Decisión (fase 11)*: "maqueta rica". Mismo lenguaje de maqueta pero con materia: texturas procedurales generadas en canvas (hormigón con juntas de encofrado, madera en tablas, asfalto con árido, bacheos y fisuras, baldosa vainilla de vereda, revoque, pasto) proyectadas en coordenadas de mundo (triplanar), sin archivos ni modelos externos. Se descartaron el mapa de entorno (reflejos) y el postprocesado: suman programas de shader y bajaban Lighthouse por debajo de 90.
- Losas visibles en el canto de cada piso (bandas horizontales de hormigón claro).
- Carpinterías con montantes finos, vidrios levemente tintados y semitransparentes que dejan ver un interior simple (piso, pared de fondo, tabique divisorio entre A y B) para que la luz interior se lea.
- Balcones con losa en voladizo y baranda de vidrio o barrotes finos.
- PB: hall vidriado doble altura, marquesina de acceso, número de calle.
- Azotea: SUM como volumen más liviano (más vidrio), pileta con agua (material azul con algo de reflejo), deck, baranda perimetral, sala de máquinas pequeña.
- Materiales: hormigón claro, revestimiento cálido (símil madera o porcelanato) en algunos paños, carpintería grafito. Nada saturado.
- Paleta de materiales 3D: los tokens de §6.3 rigen la UI; el 3D usa su propia paleta desaturada (hormigón, madera, grafito, vidrio, agua, cielo, césped y vegetación: `foliage`, `foliageLight`, `foliageDark`, `shrub`, `trunk`, verdes emparentados con `sage`) definida en un único archivo de materiales. La luz de las unidades es cálida (≈ #F2C27B), en línea con `brass`.
- Bordes suaves (bevel leve o `RoundedBox` donde ayude), sombras suaves.
- *Decisión (fase 14)*: más arquitectura, sin cambiar los volúmenes de las unidades.
  - **Marco de hormigón saliente** (0,9 m) que abraza las unidades A del frente en los pisos tipo: esa parte "sale" respecto del resto de la fachada.
  - **Parasoles verticales de madera** en el frente de las unidades B y en todo el lateral oeste (sol de la tarde).
  - **Núcleo de escalera y ascensores** de hormigón que sobresale en el contrafrente y sube hasta la sala de máquinas, con una ranura vidriada.
  - **Hall (PB)**: macizo de madera con el vidrio concentrado en el acceso; pórtico de hormigón y puerta pivotante grande con marco grafito; en los laterales, vidrio solo en los módulos cercanos al frente.
  - **SUM**: vidrio hacia el frente y hacia la pileta; hormigón al fondo y al oeste, con un único paño vidriado.

### 4.3 Entorno
- *Decisión (fase 11)*: el edificio se ve como un plano 3D de varias manzanas. Ocupa una manzana chica con jardín (lote de 52 × 34 m; *fase 14*: el edificio queda **retirado 6 m de la vereda**, con un jardín de acceso), con **calle al frente, a los dos costados y atrás** (calzada de 9 m, veredas de 4 m con cordón). Alrededor, una grilla regular de manzanas hasta ~290 m, donde la niebla ya tapa todo.
- Suelo: pasto desaturado que se funde con el horizonte por la niebla; encima, calzadas de asfalto y veredas de baldosa.
- **Calles**: sendas peatonales (cebra) y línea de detención en cada cruce, línea central discontinua, tapas de servicio y bocas de tormenta. Columnas de alumbrado cuyo cabezal se enciende de noche con el slider (emisivo, sin luces reales: se mantiene una sola luz puntual). Bancos y canteros en las veredas de la manzana del edificio. Pocos autos estacionados contra el cordón (*decisión fase 12*: 11 % de los lugares, unos 65 autos), en colores apagados; nunca frente al acceso ni al portón de cocheras. *Decisión (fase 13)*: modelo de auto por código, no cajas: perfil lateral con capó, parabrisas, techo, luneta, baúl y pasaruedas, extruido con bordes redondeados y habitáculo más angosto; vidrios que siguen el perfil y ruedas cilíndricas. Miran para uno u otro lado. La pintura, los autos y el mobiliario llegan hasta 150 m del centro.
- **Manzanas vecinas**: casas bajas de una o dos plantas sobre los lados largos, en lotes de 8–11 m con retiro variable, azotea plana o techo de tejas, ventanas a la calle (algunas encendidas de noche) y árboles en los patios. Coherente con §3 Ubicación: barrio de casas bajas, sin vecinos en altura.
- **Anillo bajo** de 60 m alrededor del edificio: casas de una planta y árboles de hasta 6,5 m. En mobile la cámara se aleja hasta ~210 m y la visual a la PB pasa a pocos metros del suelo al cruzar las manzanas vecinas.
- **Jardín de acceso** (retiro de frente, *fase 14*): solado de baldosas grandes desde la vereda hasta la puerta, con explanada bajo la marquesina; entrada vehicular de hormigón al portón de cocheras; tres canteros bajos de hormigón con arbustos y flores de tonos suaves; balizas a los lados del camino que se encienden de noche; tótem de hormigón junto a la vereda con el nombre y el número; un árbol columnar en la esquina oeste (al este taparía el hall desde la cámara). Generado por código (`frontYardLayout.ts`), determinístico y testeado.
- **Frente despejado**: sin árboles ni columnas en la vereda del edificio, la calle de enfrente ni la vereda opuesta; sin árboles en las veredas laterales (se leen los balcones al este).
- **Horizonte**: silueta de ciudad lejana dibujada en el shader del cielo (más alta hacia el sur, baja hacia el norte), apenas más oscura que el horizonte y siguiendo la hora.
- **Sol** con una `directionalLight` cálida alineada a él que proyecta sombras. Su posición depende de la hora elegida en el control "Luz del día" (§4.5); el disco y la luz siempre coinciden.
  - *Decisión (fase 9)*: reemplaza la licencia de encuadre anterior (disco del sol en un lugar y luz en otro). A la hora por defecto el sol queda **detrás de la cámara inicial** (azimut 35°, ≈ 10:44 h): ilumina frente y balcones y el disco no se ve hasta girar o cambiar la hora.
- 3–5 **nubes** low-poly (sin texturas externas), con movimiento lento.
- **Vegetación** low-poly: copas de varios lóbulos con superficie irregular y oclusión pintada (más oscuras abajo). En el jardín del edificio, 8 árboles (copa redondeada y columnar) y 18 arbustos en laterales y contrafrente; además, arbolado de vereda cada ~10 m y árboles en los patios vecinos. Todo determinístico (semilla fija) y testeado.
- Cielo con gradiente suave (no azul saturado).
- `ContactShadows` o sombra real bajo el edificio.

### 4.4 Interacción
- *Decisión (fase 17, reemplaza la de la fase 16)*: **loader y entrada con fundido**. Al cargar, un loader a pantalla completa muestra el isologo (el dibujo del favicon: torre, pisos y una unidad encendida en `brass`, con los pisos trazándose y la ventana encendiéndose), "Lumen Residencias", la dirección y una línea con el avance real de la escena (etapas compiladas). Mientras tanto no se muestra nada del 3D (sin silueta de placeholder). Con todo compilado y las sombras calculadas, la transición es en capas encadenadas (*fase 18*): primero sale el contenido del loader (se desvanece y sube 8 px, 600 ms), después se disuelve su fondo (1,3 s) mientras la escena aparece con un fundido largo (2,2 s), y recién con la escena casi visible entran los paneles (desde ~0,9 s, 1,3 s cada uno, desplazamientos de 28 px): el bloque editorial y la luz del día desde la izquierda, el selector desde la derecha con sus filas de abajo hacia arriba, y la indicación de uso al final. Respaldo: el loader se va igual a los 8 s; sin JS, un `<noscript>` muestra todo. Sin animaciones con `prefers-reduced-motion`. El título del loader es el LCP (0,5–0,6 s).
- **Rotación**: OrbitControls solo en el eje horizontal (o con ángulo polar muy limitado), sin pan, zoom limitado o deshabilitado. Rotación inicial mostrando frente + lateral este (balcones). Damping activado. Auto-rotación muy lenta mientras no hay interacción (se detiene al primer hover/drag).
- **Hover** (desktop): al apuntar una unidad se "prende su luz" — interior con emisivo cálido (≈ #F2C27B) + una luz puntual dentro de esa unidad. Solo una unidad encendida a la vez; al moverse a otra, la anterior se apaga con transición corta (~150 ms). Cursor `pointer` sobre unidades. Tooltip pequeño con nombre de la unidad ("4° A").
- **Click**: selecciona la unidad (queda encendida aunque el mouse salga) y abre la **ficha fullscreen** (§6.1). Un drag de rotación **no** debe contar como click (umbral de movimiento).
- PB y SUM también son interactivos y abren su propia ficha.
- **Mobile/touch**: tap = seleccionar (no hay hover). El selector de pisos es la vía principal.
- El selector de pisos y el 3D están sincronizados (hover en el selector enciende la unidad en el 3D y viceversa).
- Teclado: el selector de pisos es navegable con Tab/flechas; Enter abre la ficha; Esc cierra modal, visor de fotos o ficha (de la capa de arriba hacia abajo).

### 4.5 Luz del día
- Slider horizontal **continuo** de 06:00 a 22:00 (paso de 1 minuto, sin posiciones fijas), con la hora actual en números tabulares.
- Debajo, 4 referencias con ícono Phosphor (peso *light*): **Mañana** 07:30, **Mediodía** 13:00, **Tarde** 18:00, **Noche** 21:30. Solo orientan; al hacer click llevan el slider a esa hora.
- Recorrido del sol en Buenos Aires (modelo simple, sin estaciones): sale por el este (06:30), al mediodía solar (13:00) está al norte a 58° de altura y se pone por el oeste (19:30).
- Al mover el slider la escena acompaña con una transición corta (inmediata con `prefers-reduced-motion`): posición, color e intensidad del sol (más cálido y tenue cerca del horizonte), sombras, cielo, niebla, nubes y luz ambiente. De noche, luz de luna fría y tenue (sin sombras) y cielo grafito azulado.
- *Decisión (fase 11)*: desde lg el bloque editorial del hero va en una caja `paper` con borde fino, como el selector y el slider, para leerse igual sobre el barrio de día o de noche (reemplaza el cambio de color del texto con la escena oscura). La indicación de uso sí pasa a `stone` de noche.
- Ubicación: desde lg, abajo a la izquierda alineado con el bloque editorial, sobre fondo `paper` con borde fino (como el selector de pisos); en mobile, debajo del 3D.

## 5. Datos (ficticios pero coherentes)
Todos los datos viven en `src/data/building.ts`, tipados. Ningún dato hardcodeado en componentes.

### 5.1 Proyecto
- Nombre: **Lumen Residencias**
- Dirección: **Los Aromos 1240** (ficticia)
- Desarrolladora: **Thelucho Desarrollos** (ficticia)
- Entrega estimada: **diciembre 2027**
- 20 unidades (16 departamentos + 4 oficinas) · 12 pisos + PB + SUM · frente norte

### 5.2 Equipamiento común a todos los departamentos
- Caldera dual individual (agua caliente + calefacción).
- Preinstalación de aire acondicionado split frío/calor en living y dormitorios.
- Carpinterías de aluminio con DVH.
- Cocina integrada con isla (unidades A) o semi-integrada (unidades B).

### 5.3 Departamentos (pisos 1 a 8)
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

### 5.4 Oficinas (pisos 9 a 12)
- Una por piso, en planta libre: **286 m² cubiertos** (22 × 13 m), sin balcón.
- Planta libre de 171 m², sala de reuniones (24 m²), privado (28 m²), recepción, office con kitchenette y 2 sanitarios.
- Vista: frente, lateral este y lateral oeste (piso 12: además vista abierta, último piso).
- Climatización por sistema VRV frío/calor; piso técnico y cielorraso registrable.
- 2 cocheras + baulera. Ascensor propio para oficinas.

### 5.5 Precios (USD)
Regla: superficie ponderada = cubierta + 50 % del balcón. Departamentos: el valor del m² sube 2,5 % por piso desde USD 2.900 (piso 2), en forma **lineal** sobre esa base (+USD 72,5/m² por piso, no compuesto; el piso 1 queda por debajo de la base). Oficinas: misma regla con base propia, USD 2.600/m² en el piso 9. Precio = superficie ponderada × valor del m², **redondeado al millar más cercano**.

| Piso | A (118 m² pond.) | B (98 m² pond.) |
|---|---|---|
| 1 | 334.000 | 277.000 |
| 2 | 342.000 | 284.000 |
| 3 | 351.000 | 291.000 |
| 4 | 359.000 | 298.000 |
| 5 | 368.000 | 306.000 |
| 6 | 376.000 | 313.000 |
| 7 | 385.000 | 320.000 |
| 8 | 394.000 | 327.000 |

| Piso | Oficina (286 m²) |
|---|---|
| 9 | 744.000 |
| 10 | 762.000 |
| 11 | 781.000 |
| 12 | 799.000 |

### 5.6 Estado comercial (para que la demo se vea "viva")
- Vendidas: 2° B, 3° A, 5° B, 7° A.
- Reservadas: 6° A, 8° B, Oficina 10.
- Resto: disponibles.
- Unidades vendidas: se pueden ver pero sin precio ("Vendida") y sin botón de solicitar info; el 3D las muestra con luz más tenue/neutra al hover.

### 5.7 Planta baja — Hall
- Hall de acceso doble altura con recepción.
- Seguridad 24 h y control de acceso con tarjeta.
- 3 ascensores: dos para departamentos y uno para oficinas.
- Subsuelo: 24 cocheras + 20 bauleras.
- Bicicletero y sala de residuos.
- Acceso accesible (rampa) y portón automático a cocheras.

### 5.8 SUM — Nivel 13 (azotea, sobre el piso 12)
- SUM cubierto de 120 m² con cocina y 2 parrillas.
- 2 baños (uno accesible) + vestuarios.
- Terraza de 180 m² con pileta descubierta de 8 × 3,5 m y solárium con deck.
- Gimnasio equipado (45 m²) y sauna seco.
- Vista 360°.

## 6. UI

### 6.1 Ficha fullscreen (unidad, PB y SUM)
*Decisión (fase 10)*: reemplaza al panel lateral / bottom sheet. Cada unidad, PB y SUM tiene una mini landing a pantalla completa, con el contenido centrado en un contenedor (máx. 1152 px).
- `<dialog>` nativo con `showModal()`: el resto de la página queda inerte, Esc cierra y el foco vuelve a donde estaba. La página reserva siempre el lugar de la barra de scroll (`scrollbar-gutter: stable`): al abrir y cerrar no se corre nada. El 3D deja de dibujarse mientras está abierta. Scroll propio con `data-lenis-prevent`.
- Barra fija arriba: "Volver al edificio", nombre del proyecto y unidad, y navegación piso anterior / siguiente (mantiene el lado A/B).
- Orden: ubicación ("Piso 4 · Lateral este") y título grande en serif ("4° A"), línea de presentación, estado como etiqueta discreta, precio en USD con separador de miles (`USD 359.000`) y "Solicitar información" (oculto si está vendida; en el SUM, "Consultar por amenities") → **portada** (foto ilustrativa del espacio principal) → cifras destacadas en serif (superficies, ambientes, dormitorios, baños; en PB y SUM, las suyas) → descripción + ficha técnica (lista etiqueta/valor, números tabulares, separadores finos, íconos Phosphor solo donde aportan) → **galería** de espacios → mini plano de planta (SVG) y corte esquemático del edificio con la unidad resaltada + equipamiento común → cierre con consulta y tarjetas de piso anterior/siguiente (estado y precio).
- Galería: grilla de fotos numeradas con el nombre del espacio; cada una abre un visor a pantalla completa (flechas, Esc cierra solo el visor, el foco vuelve a la foto).
- *Decisión (fase 12)*: movimiento suave y sobrio, con la Web Animations API (sin dependencias). La ficha entra con un fundido y sube 24 px (650 ms, curva *ease-out* larga); el fondo se funde desde el edificio. Sale con un fundido de 300 ms y recién entonces se cierra el diálogo (con un respaldo por tiempo si el navegador no corre la animación). El contenido aparece escalonado (70 ms entre piezas): textos que suben 18 px, la portada que se descubre de abajo hacia arriba con un zoom de 1,08 a 1, y lo que está más abajo, al entrar en pantalla con el scroll. Al cambiar de piso el contenido vuelve a entrar. El visor de fotos entra con un fundido y cada foto se asienta apenas. Todo se omite con `prefers-reduced-motion`.
- Textos, fotos y cifras viven en `showcases` de `src/data/building.ts`, por tipología (A, B, oficina) y por espacio común.
- *Decisión (fase 15)*: **plano tipo folleto** de cada unidad, dibujado en SVG a partir de `floorPlans` de `building.ts` (no imágenes de stock, que no coincidirían con las superficies): muros, ventanas sobre las fachadas, muebles esquemáticos, nombre, m² y medidas de cada ambiente, cotas totales, balcón rayado y norte, con la planilla de superficies debajo. Los ambientes suman exactamente la superficie cubierta (112, 98 y 286 m²); un test lo verifica. El esquema de ubicación en la planta del piso queda como referencia chica junto al corte del edificio.
- Fotos: ilustrativas, de Unsplash (licencia libre), descargadas a `public/images/units` y servidas con `next/image` (sin requests a servicios externos). Aviso visible: "Imágenes ilustrativas de referencia: no corresponden a la unidad", con los autores.

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
- *Decisión (fase 8)*: `slate` sobre `paper` (4,42:1) y `clay` sobre `paper` (4,13:1) quedan por debajo del contraste AA (4,5:1) en texto chico. Se mantienen los hex de la tabla a propósito; se evaluó oscurecerlos (`#686C70`, `#975E3B`) y se descartó.

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
4. Pisos 1–8 tienen 2 departamentos (todas las A con balcón visible al este); pisos 9–12, una oficina en planta libre.
5. Click en cualquier unidad, en PB o en el SUM abre su ficha con los datos de la sección 5.
6. "Solicitar información" abre el modal, valida y muestra la confirmación de demo sin enviar nada.
7. Selector de pisos sincronizado con el 3D y usable con teclado.
8. Funciona en mobile (tap + ficha fullscreen).
9. Build limpio y deployado en Vercel.
