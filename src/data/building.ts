/**
 * Única fuente de datos del proyecto (SPEC §5). El 3D y la UI se generan a
 * partir de este archivo: ningún componente debe repetir estos valores.
 */

export type UnitStatus = "available" | "reserved" | "sold";

/** A = lateral este (con balcón), B = lateral oeste, office = oficina en planta libre (piso entero). */
export type UnitSide = "A" | "B" | "office";

export type LevelKind = "ground" | "typical" | "office" | "roof";

export type CommonSpaceId = "pb" | "sum";

/** Cualquier cosa que se puede apuntar/seleccionar: una unidad, PB o SUM. */
export type SelectableId = string;

export interface Project {
  name: string;
  address: string;
  developer: string;
  /** Texto para mostrar, p. ej. "diciembre 2027". */
  delivery: string;
  orientation: string;
  /** Planta tipo en metros: frente (este-oeste) × fondo (norte-sur). */
  footprint: { width: number; depth: number };
}

export interface Unit {
  id: string;
  floor: number;
  side: UnitSide;
  status: UnitStatus;
  /** Superficies en m². */
  coveredArea: number;
  balconyArea: number;
  rooms: number;
  bedrooms: number;
  ensuites: number;
  bathrooms: number;
  hasToilette: boolean;
  hasLaundry: boolean;
  kitchen: string;
  view: string;
  radiantFloor: boolean;
  heating: string;
  parkingSpaces: number;
  hasStorage: boolean;
  extras: string[];
  /** Precio en USD (tabla de SPEC §5.5). */
  price: number;
}

export interface Level {
  id: string;
  /** 0 = PB, 1–8 = departamentos, 9–12 = oficinas, 13 = SUM. */
  index: number;
  kind: LevelKind;
  /** Etiqueta corta para el selector: "PB", "4", "SUM". */
  label: string;
  /** Altura de piso a piso en metros. */
  height: number;
  unitIds: string[];
  /** Solo PB y SUM. */
  commonSpaceId?: CommonSpaceId;
}

export interface CommonSpace {
  id: CommonSpaceId;
  levelIndex: number;
  title: string;
  features: string[];
}

export const project: Project = {
  name: "Lumen Residencias",
  address: "Los Aromos 1240",
  developer: "Thelucho Desarrollos",
  delivery: "diciembre 2027",
  orientation: "Frente norte",
  footprint: { width: 22, depth: 14 },
};

/** SPEC §5.2 */
export const commonEquipment: string[] = [
  "Caldera dual individual (agua caliente + calefacción)",
  "Preinstalación de aire acondicionado split frío/calor en living y dormitorios",
  "Carpinterías de aluminio con DVH",
];

/** SPEC §5.5 — regla de precios (el test verifica la tabla contra esta regla). */
export const pricing = {
  /** Superficie ponderada = cubierta + este porcentaje del balcón. */
  balconyWeight: 0.5,
  /** Departamentos: valor del m² en el piso base y aumento lineal por piso. */
  baseFloor: 2,
  basePricePerM2: 2900,
  stepPerFloor: 0.025,
  /** Oficinas: su propio valor del m² desde el primer piso de oficinas, con el mismo aumento. */
  office: { baseFloor: 9, basePricePerM2: 2600, stepPerFloor: 0.025 },
  roundTo: 1000,
};

/** SPEC §5.5 — tabla de precios en USD. */
const priceTable: Record<number, Partial<Record<UnitSide, number>>> = {
  1: { A: 334_000, B: 277_000 },
  2: { A: 342_000, B: 284_000 },
  3: { A: 351_000, B: 291_000 },
  4: { A: 359_000, B: 298_000 },
  5: { A: 368_000, B: 306_000 },
  6: { A: 376_000, B: 313_000 },
  7: { A: 385_000, B: 320_000 },
  8: { A: 394_000, B: 327_000 },
  9: { office: 744_000 },
  10: { office: 762_000 },
  11: { office: 781_000 },
  12: { office: 799_000 },
};

/** SPEC §5.6 */
const statusById: Record<string, UnitStatus> = {
  "2B": "sold",
  "3A": "sold",
  "5B": "sold",
  "7A": "sold",
  "6A": "reserved",
  "8B": "reserved",
  "10": "reserved",
};

type Typology = Omit<Unit, "id" | "floor" | "status" | "price">;

/** SPEC §5.3 y §5.4 */
const typologies: Record<UnitSide, Typology> = {
  A: {
    side: "A",
    coveredArea: 112,
    balconyArea: 12,
    rooms: 4,
    bedrooms: 3,
    ensuites: 1,
    bathrooms: 2,
    hasToilette: true,
    hasLaundry: false,
    kitchen: "Integrada con isla",
    view: "Frente y lateral este",
    radiantFloor: true,
    heating: "Losa radiante (caldera dual)",
    parkingSpaces: 1,
    hasStorage: true,
    extras: [],
  },
  B: {
    side: "B",
    coveredArea: 98,
    balconyArea: 0,
    rooms: 3,
    bedrooms: 2,
    ensuites: 1,
    bathrooms: 2,
    hasToilette: false,
    hasLaundry: false,
    kitchen: "Semi-integrada",
    view: "Frente y lateral oeste",
    radiantFloor: false,
    heating: "Radiadores (caldera dual)",
    parkingSpaces: 1,
    hasStorage: true,
    extras: [],
  },
  /** Oficina en planta libre: un piso entero. `bathrooms` = sanitarios. */
  office: {
    side: "office",
    coveredArea: 286,
    balconyArea: 0,
    rooms: 0,
    bedrooms: 0,
    ensuites: 0,
    bathrooms: 2,
    hasToilette: false,
    hasLaundry: false,
    kitchen: "Office con kitchenette",
    view: "Frente, lateral este y lateral oeste",
    radiantFloor: false,
    heating: "Sistema VRV frío/calor",
    parkingSpaces: 2,
    hasStorage: true,
    extras: ["Planta libre con sala de reuniones y privado", "Piso técnico y cielorraso registrable"],
  },
};

/** Pisos de departamentos (A y B en cada uno) y de oficinas (planta libre). */
const HOME_FLOORS = [1, 2, 3, 4, 5, 6, 7, 8];
const OFFICE_FLOORS = [9, 10, 11, 12];
const LAST_FLOOR = OFFICE_FLOORS[OFFICE_FLOORS.length - 1];
/** Nivel del SUM, sobre el último piso. */
const ROOF_LEVEL = LAST_FLOOR + 1;

function unitId(floor: number, side: UnitSide): string {
  return side === "office" ? String(floor) : `${floor}${side}`;
}

function buildUnit(floor: number, side: UnitSide): Unit {
  const typology = typologies[side];
  const id = unitId(floor, side);
  const price = priceTable[floor]?.[side];
  if (price === undefined) throw new Error(`Falta precio para ${id}`);
  const view = floor === LAST_FLOOR ? `${typology.view}; vista abierta` : typology.view;
  return {
    ...typology,
    view,
    id,
    floor,
    status: statusById[id] ?? "available",
    price,
  };
}

export const units: Unit[] = [
  ...HOME_FLOORS.flatMap((floor) => [buildUnit(floor, "A"), buildUnit(floor, "B")]),
  ...OFFICE_FLOORS.map((floor) => buildUnit(floor, "office")),
];

/** Ordenados de abajo hacia arriba. Alturas de SPEC §4.1. */
export const levels: Level[] = [
  {
    id: "pb",
    index: 0,
    kind: "ground",
    label: "PB",
    height: 4.2,
    unitIds: [],
    commonSpaceId: "pb",
  },
  ...[...HOME_FLOORS, ...OFFICE_FLOORS].map<Level>((floor) => {
    const office = OFFICE_FLOORS.includes(floor);
    return {
      id: String(floor),
      index: floor,
      kind: office ? "office" : "typical",
      label: String(floor),
      // Oficinas con más altura libre (piso técnico y cielorraso).
      height: office ? 3.4 : 3,
      unitIds: units.filter((u) => u.floor === floor).map((u) => u.id),
    };
  }),
  {
    id: "sum",
    index: ROOF_LEVEL,
    kind: "roof",
    label: "SUM",
    height: 3.5,
    unitIds: [],
    commonSpaceId: "sum",
  },
];

/** SPEC §5.7 y §5.8 */
export const commonSpaces: Record<CommonSpaceId, CommonSpace> = {
  pb: {
    id: "pb",
    levelIndex: 0,
    title: "Hall de acceso",
    features: [
      "Hall de acceso doble altura con recepción",
      "Seguridad 24 h y control de acceso con tarjeta",
      "3 ascensores: dos para departamentos y uno para oficinas",
      "Subsuelo: 24 cocheras + 20 bauleras",
      "Bicicletero y sala de residuos",
      "Acceso accesible (rampa) y portón automático a cocheras",
    ],
  },
  sum: {
    id: "sum",
    levelIndex: ROOF_LEVEL,
    title: "SUM y amenities",
    features: [
      "SUM cubierto de 120 m² con cocina y 2 parrillas",
      "2 baños (uno accesible) + vestuarios",
      "Terraza de 180 m² con pileta descubierta de 8 × 3,5 m",
      "Solárium con deck",
      "Gimnasio equipado (45 m²) y sauna seco",
      "Vista 360°",
    ],
  },
};

/* ------------------------------------------------------------------------ */
/* Contenido de la landing (SPEC §3). Ficticio, coherente con los datos.    */
/* ------------------------------------------------------------------------ */

/** Una línea de propuesta para el hero. */
export const tagline =
  "Departamentos de 3 y 4 ambientes y oficinas en planta libre, frente al norte, con balcón al este y amenities en la azotea.";

/** Texto de la sección "El proyecto". */
export const about: string[] = [
  "Un edificio de planta baja, doce pisos y SUM en la azotea, de 22 m de frente y retirado 6 m de la línea municipal. Del piso 1 al 8 hay dos departamentos por planta: el A, sobre el lateral este, con balcón de 12 m² y losa radiante; el B, sobre el oeste, de 3 ambientes.",
  "Del piso 9 al 12, una oficina por planta: 286 m² en planta libre con sala de reuniones, privado, office y sanitarios, y ascensor propio. Todas las unidades tienen cochera en el subsuelo y baulera.",
];

export type AmenityId = "pool" | "sauna" | "gym" | "sum" | "solarium";

export interface Amenity {
  id: AmenityId;
  name: string;
  detail: string;
}

/** SPEC §3 y §5.8 */
export const amenities: Amenity[] = [
  { id: "pool", name: "Pileta descubierta", detail: "8 × 3,5 m en la terraza de la azotea." },
  { id: "solarium", name: "Solárium", detail: "Deck de madera junto a la pileta, sobre una terraza de 180 m²." },
  { id: "sum", name: "SUM con parrillas", detail: "120 m² cubiertos con cocina, 2 parrillas y vista 360°." },
  { id: "gym", name: "Gimnasio", detail: "45 m² equipados, con vestuarios." },
  { id: "sauna", name: "Sauna seco", detail: "Junto al gimnasio y los vestuarios." },
];

export interface LocationPoint {
  label: string;
  distance: string;
}

/** SPEC §3.4: ubicación ficticia, sin mapas de terceros. */
export const location = {
  street: "Los Aromos",
  neighborhood: "Barrio Parque",
  summary:
    "Sobre una calle arbolada de doble mano, a dos cuadras de la plaza y a seis de la estación. Zona residencial de casas bajas: el edificio no tiene vecinos en altura al norte.",
  points: [
    { label: "Plaza Los Aromos", distance: "2 cuadras" },
    { label: "Estación de tren", distance: "6 cuadras" },
    { label: "Colegios primario y secundario", distance: "4 cuadras" },
    { label: "Supermercado y comercios", distance: "3 cuadras" },
    { label: "Acceso a la autopista", distance: "5 min en auto" },
  ] satisfies LocationPoint[],
};

/* ------------------------------------------------------------------------ */
/* Ficha fullscreen de cada unidad, PB y SUM (SPEC §6.1).                   */
/* ------------------------------------------------------------------------ */

/** Foto ilustrativa (Unsplash, licencia libre), servida desde /public. */
export interface Photo {
  src: string;
  alt: string;
  /** Nombre del espacio, como se muestra en la galería. */
  caption: string;
  credit: string;
}

export interface Figure {
  label: string;
  value: string;
}

export interface Showcase {
  /** Una línea de presentación. */
  lead: string;
  body: string[];
  cover: Photo;
  gallery: Photo[];
  /** Cifras destacadas (PB y SUM; en las unidades salen de la tipología). */
  figures?: Figure[];
}

export type ShowcaseId = UnitSide | CommonSpaceId;

const IMG = "/images/units";

const photos = {
  aLiving: { src: `${IMG}/a-living.jpg`, alt: "Living comedor con muebles de madera clara, estantería calada y luz natural", caption: "Living comedor", credit: "Puscas Adryan" },
  aKitchen: { src: `${IMG}/a-cocina.jpg`, alt: "Cocina con isla blanca y banquetas, iluminada por el sol", caption: "Cocina integrada con isla", credit: "Francesco Ungaro" },
  aBalcony: { src: `${IMG}/a-balcon.jpg`, alt: "Balcón con plantas visto desde el living a través de la carpintería", caption: "Balcón al este", credit: "Travis Fish" },
  aBedroom: { src: `${IMG}/a-dormitorio.jpg`, alt: "Dormitorio con cama tapizada y ropa de cama clara", caption: "Dormitorio principal en suite", credit: "McFollis" },
  aBath: { src: `${IMG}/a-bano.jpg`, alt: "Baño con bañera exenta blanca y estante de madera", caption: "Baño en suite", credit: "Ela De Pure" },
  bLiving: { src: `${IMG}/b-living.jpg`, alt: "Living luminoso con cortinas blancas, sillón claro y cuadros", caption: "Living", credit: "EZcurtain Life" },
  bDining: { src: `${IMG}/b-comedor.jpg`, alt: "Mesa redonda oscura con sillas tapizadas junto a la cocina", caption: "Comedor diario", credit: "Aleksandra Dementeva" },
  bKitchen: { src: `${IMG}/b-cocina.jpg`, alt: "Cocina clara con ventana grande hacia el verde", caption: "Cocina semi-integrada", credit: "Cat Han" },
  bBedroom: { src: `${IMG}/b-dormitorio.jpg`, alt: "Dormitorio con placard blanco y ventanal", caption: "Dormitorio principal en suite", credit: "Pickawood" },
  bBath: { src: `${IMG}/b-bano.jpg`, alt: "Baño con bañera, mampara de vidrio y mueble de vanitory blanco", caption: "Baño", credit: "Alex Tyson" },
  officeOpen: { src: `${IMG}/office-planta.jpg`, alt: "Planta libre con puestos de trabajo, luminarias lineales y ventanas altas", caption: "Planta libre", credit: "Petr" },
  officeReception: { src: `${IMG}/office-recepcion.jpg`, alt: "Recepción con piso de madera y salas con paredes de vidrio", caption: "Recepción y salas vidriadas", credit: "Deliberate Directions" },
  officeMeeting: { src: `${IMG}/office-reunion.jpg`, alt: "Sala de reuniones con paredes de vidrio y revestimiento de madera", caption: "Sala de reuniones", credit: "Flipsnack" },
  officePantry: { src: `${IMG}/office-office.jpg`, alt: "Office con mueble gris, mesada blanca y banquetas", caption: "Office", credit: "Point3D Commercial Imaging" },
  pbReception: { src: `${IMG}/pb-recepcion.jpg`, alt: "Recepción con mostrador de piedra y revestimiento de listones de madera", caption: "Recepción", credit: "Aalo Lens" },
  pbElevators: { src: `${IMG}/pb-ascensores.jpg`, alt: "Palier con dos ascensores de acero y piso de mármol", caption: "Palier de ascensores", credit: "Aalo Lens" },
  sumTerrace: { src: `${IMG}/sum-terraza.jpg`, alt: "Terraza en altura con mesas y vista a la ciudad al atardecer", caption: "Terraza del SUM", credit: "garrett parker" },
  sumPool: { src: `${IMG}/sum-pileta.jpg`, alt: "Pileta vista desde arriba junto a un deck de madera", caption: "Pileta y solárium", credit: "Bernd Dittrich" },
  sumGym: { src: `${IMG}/sum-gimnasio.jpg`, alt: "Gimnasio con cintas de correr frente a un ventanal", caption: "Gimnasio", credit: "Aalo Lens" },
  sumSauna: { src: `${IMG}/sum-sauna.jpg`, alt: "Sauna revestido en madera con estufa de piedras", caption: "Sauna seco", credit: "HUUM" },
} satisfies Record<string, Photo>;

/** Textos, fotos y cifras de la ficha de cada tipología y espacio común. */
export const showcases: Record<ShowcaseId, Showcase> = {
  A: {
    lead: "Cuatro ambientes sobre el lateral este, con balcón de 12 m² y losa radiante.",
    body: [
      "El living comedor da al frente y se abre al balcón del lateral este, que recibe el sol de la mañana. La cocina se integra al estar con una isla.",
      "Tres dormitorios, el principal en suite, un segundo baño completo y toilette para visitas. Losa radiante en toda la unidad, con caldera dual individual.",
    ],
    cover: photos.aLiving,
    gallery: [photos.aLiving, photos.aKitchen, photos.aBalcony, photos.aBedroom, photos.aBath],
  },
  B: {
    lead: "Tres ambientes sobre el lateral oeste, con sol de tarde y cocina semi-integrada.",
    body: [
      "El living da al frente y al oeste y recibe la luz de la tarde. La cocina semi-integrada separa el área de trabajo sin cerrar el comedor.",
      "Dos dormitorios, el principal en suite, y un segundo baño completo. Calefacción por radiadores con caldera dual individual.",
    ],
    cover: photos.bLiving,
    gallery: [photos.bLiving, photos.bDining, photos.bKitchen, photos.bBedroom, photos.bBath],
  },
  office: {
    lead: "Oficina en planta libre de 286 m², un piso entero con tres frentes vidriados.",
    body: [
      "Ocupa toda la planta: frente al norte y laterales este y oeste, con luz natural todo el día. La planta libre se arma a medida; la sala de reuniones y el privado ya están definidos.",
      "Office con kitchenette, dos sanitarios, piso técnico y cielorraso registrable. Climatización por sistema VRV, ascensor propio y dos cocheras en el subsuelo.",
    ],
    cover: photos.officeOpen,
    gallery: [photos.officeOpen, photos.officeReception, photos.officeMeeting, photos.officePantry],
  },
  pb: {
    lead: "Hall de acceso de doble altura, con recepción y seguridad las 24 horas.",
    body: [
      "La planta baja recibe con un hall de doble altura detrás de un jardín de acceso sobre Los Aromos. Desde la recepción se llega a los tres ascensores: dos para departamentos y uno para oficinas.",
      "En el subsuelo están las cocheras y las bauleras de todas las unidades. A nivel de vereda, bicicletero, sala de residuos y rampa de acceso.",
    ],
    cover: photos.pbReception,
    gallery: [photos.pbReception, photos.pbElevators],
    figures: [
      { label: "Altura del hall", value: "4,2 m" },
      { label: "Ascensores", value: "3" },
      { label: "Cocheras", value: "24" },
      { label: "Bauleras", value: "20" },
      { label: "Seguridad", value: "24 h" },
    ],
  },
  sum: {
    lead: "Azotea con SUM, pileta, solárium, gimnasio y sauna, con vista 360°.",
    body: [
      "En la azotea, sobre el piso 12, el SUM tiene cocina y dos parrillas y se abre a la terraza, con la pileta descubierta y el deck del solárium.",
      "Del otro lado de la azotea están el gimnasio equipado, los vestuarios y el sauna seco.",
    ],
    cover: photos.sumTerrace,
    gallery: [photos.sumTerrace, photos.sumPool, photos.sumGym, photos.sumSauna],
    figures: [
      { label: "SUM cubierto", value: "120 m²" },
      { label: "Terraza", value: "180 m²" },
      { label: "Pileta", value: "8 × 3,5 m" },
      { label: "Gimnasio", value: "45 m²" },
    ],
  },
};

/* ------------------------------------------------------------------------ */
/* Planos tipo folleto (SPEC §6.1). Esquemas ficticios coherentes con cada   */
/* tipología: los ambientes suman la superficie cubierta.                    */
/* ------------------------------------------------------------------------ */

export type PlanRoomKind =
  | "living"
  | "kitchen"
  | "bedroom"
  | "bath"
  | "toilet"
  | "hall"
  | "corridor"
  | "dressing"
  | "storage"
  | "balcony"
  | "open"
  | "meeting"
  | "reception"
  | "private"
  | "pantry";

/** Rectángulo en metros: [x, y, ancho, profundidad]. x de oeste a este; y desde el frente (norte). */
export type PlanRect = [number, number, number, number];

export interface PlanRoom {
  name: string;
  kind: PlanRoomKind;
  rects: PlanRect[];
}

export interface FloorPlan {
  /** Medidas totales de la unidad (sin balcón), en metros. */
  width: number;
  depth: number;
  /** Lados con fachada (ventanas); el resto linda con la otra unidad o el núcleo. */
  facades: { north: boolean; east: boolean; west: boolean; south: boolean };
  rooms: PlanRoom[];
}

export const floorPlans: Record<UnitSide, FloorPlan> = {
  A: {
    width: 11.2,
    depth: 10,
    facades: { north: true, east: true, west: false, south: false },
    rooms: [
      { name: "Living comedor", kind: "living", rects: [[3.8, 0, 7.4, 5]] },
      { name: "Cocina", kind: "kitchen", rects: [[0, 0, 3.8, 3.2]] },
      { name: "Toilette", kind: "toilet", rects: [[0, 3.2, 1.6, 1.8]] },
      { name: "Hall", kind: "hall", rects: [[1.6, 3.2, 2.2, 1.8]] },
      { name: "Circulación", kind: "corridor", rects: [[0, 5, 7.6, 1.2]] },
      { name: "Dormitorio 2", kind: "bedroom", rects: [[0, 6.2, 3.4, 3.8]] },
      { name: "Baño", kind: "bath", rects: [[3.4, 6.2, 1.8, 3.8]] },
      { name: "Dormitorio 3", kind: "bedroom", rects: [[5.2, 6.2, 2.4, 3.8]] },
      { name: "Vestidor", kind: "dressing", rects: [[7.6, 5, 1.6, 1.6]] },
      { name: "Baño en suite", kind: "bath", rects: [[9.2, 5, 2, 1.6]] },
      { name: "Dormitorio principal", kind: "bedroom", rects: [[7.6, 6.6, 3.6, 3.4]] },
      { name: "Balcón", kind: "balcony", rects: [[11.2, 0, 1.2, 10]] },
    ],
  },
  B: {
    width: 9.8,
    depth: 10,
    facades: { north: true, east: false, west: true, south: false },
    rooms: [
      { name: "Living comedor", kind: "living", rects: [[0, 0, 6.2, 5]] },
      { name: "Cocina", kind: "kitchen", rects: [[6.2, 0, 3.6, 3.4]] },
      { name: "Hall", kind: "hall", rects: [[6.2, 3.4, 3.6, 1.6]] },
      { name: "Baño en suite", kind: "bath", rects: [[0, 5, 2.2, 1.4]] },
      { name: "Vestidor", kind: "dressing", rects: [[2.2, 5, 1.6, 1.4]] },
      { name: "Dormitorio principal", kind: "bedroom", rects: [[0, 6.4, 3.8, 3.6]] },
      { name: "Circulación", kind: "corridor", rects: [[3.8, 5, 6, 1.2]] },
      { name: "Dormitorio 2", kind: "bedroom", rects: [[3.8, 6.2, 3, 3.8]] },
      { name: "Baño", kind: "bath", rects: [[6.8, 6.2, 3, 2.2]] },
      { name: "Guardado", kind: "storage", rects: [[6.8, 8.4, 3, 1.6]] },
    ],
  },
  office: {
    width: 22,
    depth: 13,
    facades: { north: true, east: true, west: true, south: false },
    rooms: [
      { name: "Planta libre", kind: "open", rects: [[0, 0, 15, 8.4], [5.2, 8.4, 9.8, 4.6]] },
      { name: "Sala de reuniones", kind: "meeting", rects: [[0, 8.4, 5.2, 4.6]] },
      { name: "Recepción", kind: "reception", rects: [[15, 0, 7, 4.4]] },
      { name: "Privado", kind: "private", rects: [[15, 4.4, 7, 4]] },
      { name: "Office", kind: "pantry", rects: [[15, 8.4, 3.6, 4.6]] },
      { name: "Sanitarios", kind: "bath", rects: [[18.6, 8.4, 3.4, 4.6]] },
    ],
  },
};

/** Aviso de las fotos de las fichas. */
export const photoNotice = "Imágenes ilustrativas de referencia: no corresponden a la unidad. Fotos de Unsplash.";

/** Datos de contacto ficticios de la desarrolladora. */
export const contact = {
  showroom: "Los Aromos 1240, planta baja",
  hours: "Lunes a sábados de 10 a 18 h",
  phone: "+54 11 5555-0123",
  whatsapp: "+54 9 11 5555-0123",
  email: "ventas@thelucho.example",
};
