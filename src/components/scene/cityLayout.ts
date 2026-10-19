import { URBAN } from "./dimensions";
import type { Box } from "./layout";
import { random } from "./random";
import type { Shrub, Tree } from "./vegetationLayout";

/**
 * Entorno urbano alrededor del edificio, generado por código: calles con
 * señalización, veredas de baldosa con cordón, manzanas de casas bajas,
 * arbolado, luminarias, bancos y autos estacionados. Puro y determinístico
 * (semilla fija), sin tocar three.js: se puede testear.
 *
 * Ejes como en el resto de la escena: +X este, +Z norte (frente), +Y arriba.
 * Todo son cajas alineadas a los ejes (se dibujan instanciadas).
 */

export interface ColoredBox extends Box {
  /** Índice de color en la paleta correspondiente (casas, autos). */
  tone: number;
}

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export interface CityLayout {
  blocks: Rect[];
  asphalt: Box[];
  sidewalk: Box[];
  curb: Box[];
  marking: Box[];
  metal: Box[];
  lamp: Box[];
  bench: Box[];
  houses: ColoredBox[];
  roofFlat: Box[];
  /** Techos a dos aguas: caja envolvente del prisma (cumbrera a lo largo de X). */
  roofTile: Box[];
  windowDark: Box[];
  windowLit: Box[];
  cars: ColoredBox[];
  carGlass: Box[];
  trees: Tree[];
  shrubs: Shrub[];
}

const { sidewalk: SW, street: ST, curb: CURB, curbHeight: CH, lot: LOT } = URBAN;

const BLOCK_W = LOT.x[1] - LOT.x[0];
const BLOCK_D = LOT.z[1] - LOT.z[0];
/** Paso de la grilla: manzana + 2 veredas + calle. */
export const PERIOD_X = BLOCK_W + 2 * SW + ST;
export const PERIOD_Z = BLOCK_D + 2 * SW + ST;
const CENTER_X = (LOT.x[0] + LOT.x[1]) / 2;
const CENTER_Z = (LOT.z[0] + LOT.z[1]) / 2;
const RANGE = Math.ceil(URBAN.radius / Math.min(PERIOD_X, PERIOD_Z));

/** Calzada apenas sobre el suelo; la pintura, apenas sobre la calzada. */
const ROAD_Y = 0.02;
const PAINT = 0.012;

/** Hasta dónde llegan los detalles chicos (pintura, autos, mobiliario). */
const DETAIL_RADIUS = 150;
const TREE_RADIUS = 210;

/**
 * Anillo bajo alrededor del edificio: en mobile la cámara se aleja hasta
 * ~210 m y la visual a la PB pasa a pocos metros del suelo al cruzar las
 * manzanas vecinas. Ahí, casas de una planta y árboles bajos.
 */
export const LOW_RADIUS = 60;
export const LOW_HEIGHT = { house: 3.6, tree: 6.5 };

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Box {
  return {
    p: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    s: [Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)],
  };
}

const near = (x: number, z: number, r: number) => Math.hypot(x, z) <= r;

/** Centro de la manzana (i, j); (0, 0) es la del edificio. */
function blockAt(i: number, j: number): Rect {
  const cx = CENTER_X + i * PERIOD_X;
  const cz = CENTER_Z + j * PERIOD_Z;
  return { x0: cx - BLOCK_W / 2, x1: cx + BLOCK_W / 2, z0: cz - BLOCK_D / 2, z1: cz + BLOCK_D / 2 };
}

/** Vereda con cordón alrededor de una manzana: piezas sin superposición. */
function sidewalkRing(b: Rect, out: CityLayout) {
  const o = { x0: b.x0 - SW, x1: b.x1 + SW, z0: b.z0 - SW, z1: b.z1 + SW };
  const top = CH;
  out.curb.push(
    box(o.x0, o.x1, 0, top + 0.01, o.z1 - CURB, o.z1),
    box(o.x0, o.x1, 0, top + 0.01, o.z0, o.z0 + CURB),
    box(o.x1 - CURB, o.x1, 0, top + 0.01, o.z0 + CURB, o.z1 - CURB),
    box(o.x0, o.x0 + CURB, 0, top + 0.01, o.z0 + CURB, o.z1 - CURB),
  );
  out.sidewalk.push(
    box(o.x0 + CURB, o.x1 - CURB, 0, top, b.z1, o.z1 - CURB),
    box(o.x0 + CURB, o.x1 - CURB, 0, top, o.z0 + CURB, b.z0),
    box(b.x1, o.x1 - CURB, 0, top, b.z0, b.z1),
    box(o.x0 + CURB, b.x0, 0, top, b.z0, b.z1),
  );
}

/**
 * Casas sobre los dos lados largos de la manzana (norte y sur), con lotes de
 * 8 a 11 m, retiro de frente variable y patio al fondo. Una de cada tres con
 * techo de tejas; el resto, azotea plana.
 */
function houses(b: Rect, rand: () => number, out: CityLayout) {
  for (const side of [1, -1] as const) {
    const front = side === 1 ? b.z1 : b.z0;
    let x = b.x0;
    while (x < b.x1 - 6) {
      const width = Math.min(8 + rand() * 3, b.x1 - x);
      const setback = rand() < 0.5 ? 0 : 1 + rand() * 2.5;
      const depth = 9 + rand() * 4;
      const gap = rand() < 0.6 ? 0 : 1 + rand();
      const hx0 = x + gap / 2;
      const hx1 = x + width - gap / 2;
      const zFront = front - side * setback;
      const zBack = zFront - side * depth;
      const [z0, z1] = side === 1 ? [zBack, zFront] : [zFront, zBack];
      const low = near((hx0 + hx1) / 2, (z0 + z1) / 2, LOW_RADIUS);
      const floors = low || rand() < 0.55 ? 1 : 2;
      const height = floors * 3 + 0.3;
      out.houses.push({ ...box(hx0, hx1, 0, height, z0, z1), tone: Math.floor(rand() * 6) });

      if (!low && rand() < 0.33) {
        out.roofTile.push(box(hx0 - 0.3, hx1 + 0.3, height, height + 1.6 + rand() * 0.6, z0 - 0.3, z1 + 0.3));
      } else {
        out.roofFlat.push(box(hx0 - 0.05, hx1 + 0.05, height, height + 0.25, z0 - 0.05, z1 + 0.05));
      }

      // Ventanas sobre la fachada a la calle; la de planta baja junto a la puerta.
      const perFloor = Math.max(1, Math.floor((hx1 - hx0) / 3.2));
      const step = (hx1 - hx0) / perFloor;
      for (let f = 0; f < floors; f++) {
        for (let k = 0; k < perFloor; k++) {
          const cx = hx0 + step * (k + 0.5);
          const isDoor = f === 0 && k === 0;
          const w = isDoor ? 1 : 1.3;
          const y0 = f * 3 + (isDoor ? 0.05 : 1);
          const y1 = f * 3 + (isDoor ? 2.2 : 2.3);
          const target = !isDoor && rand() < 0.3 ? out.windowLit : out.windowDark;
          target.push(box(cx - w / 2, cx + w / 2, y0, y1, zFront - 0.02 * side, zFront + 0.04 * side));
        }
      }
      x += width;
    }
  }

  // Árboles de fondo de patio, sin ordenar: la mitad de la manzana es verde.
  const cx = (b.x0 + b.x1) / 2;
  const cz = (b.z0 + b.z1) / 2;
  if (!near(cx, cz, TREE_RADIUS)) return;
  const count = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i++) {
    out.trees.push({
      kind: rand() < 0.25 ? "columnar" : "round",
      x: b.x0 + 6 + rand() * (b.x1 - b.x0 - 12),
      z: cz + (rand() - 0.5) * 3,
      height: 6 + rand() * 4,
      crown: 1.8 + rand() * 1.2,
      tone: Math.floor(rand() * 3),
    });
  }
}

/**
 * Visual al frente del edificio: su vereda, la calle y la vereda de enfrente.
 * Ahí no van árboles ni columnas: tapan la PB desde la cámara.
 */
export function inFrontView(x: number, z: number): boolean {
  return z > LOT.z[1] && z < LOT.z[1] + 2 * SW + ST && x > LOT.x[0] - SW && x < LOT.x[1] + SW;
}

/** Veredas laterales del edificio: sin árboles, para que se lean los balcones al este. */
function onOwnSides(x: number, z: number): boolean {
  const side = (x > LOT.x[1] && x < LOT.x[1] + SW) || (x < LOT.x[0] && x > LOT.x[0] - SW);
  return side && z > LOT.z[0] && z < LOT.z[1];
}

/** Arbolado, luminarias y bancos sobre la vereda, a lo largo del cordón. */
function sidewalkFurniture(b: Rect, rand: () => number, out: CityLayout, isOwn: boolean) {
  const edges: { along: "x" | "z"; at: number; from: number; to: number; out: 1 | -1 }[] = [
    { along: "x", at: b.z1 + SW - 1, from: b.x0, to: b.x1, out: 1 },
    { along: "x", at: b.z0 - SW + 1, from: b.x0, to: b.x1, out: -1 },
    { along: "z", at: b.x1 + SW - 1, from: b.z0, to: b.z1, out: 1 },
    { along: "z", at: b.x0 - SW + 1, from: b.z0, to: b.z1, out: -1 },
  ];
  for (const e of edges) {
    const length = e.to - e.from;
    // Árboles cada ~10 m, dejando libres las esquinas.
    const trees = Math.floor((length - 6) / 10);
    const spacing = (length - 6) / Math.max(1, trees);
    for (let k = 0; k <= trees; k++) {
      const t = e.from + 3 + k * spacing;
      const [x, z] = e.along === "x" ? [t, e.at] : [e.at, t];
      if (inFrontView(x, z) || onOwnSides(x, z) || !near(x, z, TREE_RADIUS)) continue;
      if (rand() < 0.15) continue; // algún hueco en el arbolado
      out.trees.push({
        kind: "round",
        x,
        z,
        height: 6.5 + rand() * 3,
        crown: 2 + rand() * 1,
        tone: Math.floor(rand() * 3),
      });
    }

    if (!near((e.from + e.to) / 2, e.at, DETAIL_RADIUS)) continue;

    // Columnas de alumbrado a mitad de camino entre dos árboles, con el brazo hacia la calle.
    const lampSlots = trees >= 3 ? [1, trees - 2] : [0];
    for (const k of new Set(lampSlots)) {
      const t = e.from + 3 + (k + 0.5) * spacing;
      const [x, z] = e.along === "x" ? [t, e.at + 0.4 * e.out] : [e.at + 0.4 * e.out, t];
      if (inFrontView(x, z)) continue;
      out.metal.push(box(x - 0.07, x + 0.07, CH, 6.2, z - 0.07, z + 0.07));
      const arm = 1.4 * e.out;
      if (e.along === "x") {
        out.metal.push(box(x - 0.04, x + 0.04, 6.1, 6.2, Math.min(z, z + arm), Math.max(z, z + arm)));
        out.lamp.push(box(x - 0.18, x + 0.18, 5.95, 6.1, z + arm - 0.35, z + arm + 0.35));
      } else {
        out.metal.push(box(Math.min(x, x + arm), Math.max(x, x + arm), 6.1, 6.2, z - 0.04, z + 0.04));
        out.lamp.push(box(x + arm - 0.35, x + arm + 0.35, 5.95, 6.1, z - 0.18, z + 0.18));
      }
    }

    // Bancos y canteros: solo en la manzana del edificio (laterales y contrafrente).
    if (isOwn && !(e.along === "x" && e.out === 1)) {
      const t = (e.from + e.to) / 2;
      const inner = e.at - 1.6 * e.out;
      for (const offset of [-4, 4]) {
        const c = t + offset;
        if (e.along === "x") {
          out.bench.push(box(c - 0.9, c + 0.9, CH + 0.42, CH + 0.48, inner - 0.22, inner + 0.22));
          out.bench.push(box(c - 0.9, c + 0.9, CH + 0.48, CH + 0.9, inner - 0.25 * e.out - 0.03, inner - 0.25 * e.out + 0.03));
          for (const leg of [c - 0.75, c + 0.75]) out.metal.push(box(leg - 0.04, leg + 0.04, CH, CH + 0.42, inner - 0.2, inner + 0.2));
        } else {
          out.bench.push(box(inner - 0.22, inner + 0.22, CH + 0.42, CH + 0.48, c - 0.9, c + 0.9));
          out.bench.push(box(inner - 0.25 * e.out - 0.03, inner - 0.25 * e.out + 0.03, CH + 0.48, CH + 0.9, c - 0.9, c + 0.9));
          for (const leg of [c - 0.75, c + 0.75]) out.metal.push(box(inner - 0.2, inner + 0.2, CH, CH + 0.42, leg - 0.04, leg + 0.04));
        }
      }
      // Cantero de hormigón con arbustos, en el medio del tramo.
      const [px, pz] = e.along === "x" ? [t, inner] : [inner, t];
      out.curb.push(box(px - 0.7, px + 0.7, CH, CH + 0.45, pz - 0.7, pz + 0.7));
      out.shrubs.push({ x: px, z: pz, radius: 0.75, tone: Math.floor(rand() * 3), y: CH + 0.45 });
    }
  }
}

/** Auto estacionado junto al cordón: carrocería, habitáculo y ruedas. */
function car(x: number, z: number, alongX: boolean, rand: () => number, out: CityLayout) {
  const L = 4.2 + rand() * 0.5;
  const W = 1.8;
  const [lx, lz] = alongX ? [L, W] : [W, L];
  const tone = Math.floor(rand() * 7);
  out.cars.push({ ...box(x - lx / 2, x + lx / 2, 0.32, 1.05, z - lz / 2, z + lz / 2), tone });
  // Habitáculo: vidrios alrededor y techo del color de la carrocería.
  const cab = 0.55;
  const shift = (rand() < 0.5 ? -1 : 1) * 0.2;
  const [cx, cz] = alongX ? [x + shift, z] : [x, z + shift];
  const [clx, clz] = alongX ? [L * cab, W * 0.86] : [W * 0.86, L * cab];
  out.carGlass.push(box(cx - clx / 2, cx + clx / 2, 1.05, 1.45, cz - clz / 2, cz + clz / 2));
  out.cars.push({ ...box(cx - clx * 0.46, cx + clx * 0.46, 1.45, 1.55, cz - clz * 0.46, cz + clz * 0.46), tone });
  for (const a of [-1, 1]) {
    for (const s of [-1, 1]) {
      const along = a * (L / 2 - 0.75);
      const across = s * (W / 2 - 0.12);
      const [wx, wz] = alongX ? [x + along, z + across] : [x + across, z + along];
      const [wlx, wlz] = alongX ? [0.62, 0.22] : [0.22, 0.62];
      out.metal.push(box(wx - wlx / 2, wx + wlx / 2, ROAD_Y, 0.62, wz - wlz / 2, wz + wlz / 2));
    }
  }
}

/** Calzadas, pintura vial, tapas y autos. */
function streets(out: CityLayout, rand: () => number) {
  const half = URBAN.radius + PERIOD_X;
  // Ejes de las calles: este-oeste (a lo largo de X) y norte-sur (a lo largo de Z).
  const streetsZ: number[] = [];
  const streetsX: number[] = [];
  for (let j = -RANGE - 1; j <= RANGE; j++) streetsZ.push(LOT.z[1] + SW + ST / 2 + j * PERIOD_Z);
  for (let i = -RANGE - 1; i <= RANGE; i++) streetsX.push(LOT.x[1] + SW + ST / 2 + i * PERIOD_X);

  // Calzadas: las este-oeste corridas; las norte-sur, en tramos entre aquellas (sin superposición).
  for (const z of streetsZ) {
    if (Math.abs(z) > URBAN.radius + ST) continue;
    out.asphalt.push(box(-half, half, 0, ROAD_Y, z - ST / 2, z + ST / 2));
  }
  for (const x of streetsX) {
    if (Math.abs(x) > URBAN.radius + ST) continue;
    for (let k = 0; k < streetsZ.length - 1; k++) {
      out.asphalt.push(box(x - ST / 2, x + ST / 2, 0, ROAD_Y, streetsZ[k] + ST / 2, streetsZ[k + 1] - ST / 2));
    }
  }

  const paint = (x0: number, x1: number, z0: number, z1: number) =>
    out.marking.push(box(x0, x1, ROAD_Y, ROAD_Y + PAINT, z0, z1));

  for (const zs of streetsZ) {
    for (const xs of streetsX) {
      if (!near(xs, zs, DETAIL_RADIUS)) continue;
      const h = ST / 2;
      // Sendas peatonales (cebra) en las cuatro bocas del cruce.
      const stripes = 7;
      for (let s = 0; s < stripes; s++) {
        const o = -h + 0.9 + s * ((ST - 1.8) / (stripes - 1));
        for (const dir of [-1, 1]) {
          const xa = xs + dir * (h + 0.6);
          const xb = xs + dir * (h + 3.4);
          paint(Math.min(xa, xb), Math.max(xa, xb), zs + o - 0.25, zs + o + 0.25);
          const za = zs + dir * (h + 0.6);
          const zb = zs + dir * (h + 3.4);
          paint(xs + o - 0.25, xs + o + 0.25, Math.min(za, zb), Math.max(za, zb));
        }
      }
      // Línea de detención antes de cada senda.
      for (const dir of [-1, 1]) {
        paint(xs + dir * (h + 4) - 0.2, xs + dir * (h + 4) + 0.2, zs - h + 0.4, zs + h - 0.4);
        paint(xs - h + 0.4, xs + h - 0.4, zs + dir * (h + 4) - 0.2, zs + dir * (h + 4) + 0.2);
      }
      // Rejillas de desagüe (bocas de tormenta) en las esquinas, contra el cordón.
      for (const dx of [-1, 1]) {
        for (const dz of [-1, 1]) {
          const gx = xs + dx * (h + 5.5);
          const gz = zs + dz * (h - 0.25);
          out.metal.push(box(gx - 0.5, gx + 0.5, ROAD_Y, ROAD_Y + 0.008, gz - 0.2, gz + 0.2));
        }
      }
    }
  }

  // Tramos entre cruces: línea central discontinua, tapas y autos.
  const segments: { alongX: boolean; at: number; from: number; to: number }[] = [];
  for (const z of streetsZ) {
    for (let k = 0; k < streetsX.length - 1; k++) {
      segments.push({ alongX: true, at: z, from: streetsX[k] + ST / 2, to: streetsX[k + 1] - ST / 2 });
    }
  }
  for (const x of streetsX) {
    for (let k = 0; k < streetsZ.length - 1; k++) {
      segments.push({ alongX: false, at: x, from: streetsZ[k] + ST / 2, to: streetsZ[k + 1] - ST / 2 });
    }
  }

  for (const seg of segments) {
    const mid = (seg.from + seg.to) / 2;
    const [mx, mz] = seg.alongX ? [mid, seg.at] : [seg.at, mid];
    if (!near(mx, mz, DETAIL_RADIUS)) continue;
    const a = seg.from + 5;
    const b = seg.to - 5;
    for (let t = a; t + 3 <= b; t += 6) {
      if (seg.alongX) paint(t, t + 3, seg.at - 0.06, seg.at + 0.06);
      else paint(seg.at - 0.06, seg.at + 0.06, t, t + 3);
    }
    // Tapa de servicio en la mitad del tramo.
    const r = 0.35;
    const off = 1.6;
    if (seg.alongX) out.metal.push(box(mid - r, mid + r, ROAD_Y, ROAD_Y + 0.01, seg.at + off - r, seg.at + off + r));
    else out.metal.push(box(seg.at - off - r, seg.at - off + r, ROAD_Y, ROAD_Y + 0.01, mid - r, mid + r));

    // Autos a ambos lados, junto al cordón, dejando libres las esquinas.
    for (const side of [-1, 1]) {
      const lane = seg.at + side * (ST / 2 - 1.15);
      let t = seg.from + 6.5;
      while (t < seg.to - 8) {
        const length = 5.4 + rand() * 1.5;
        const [x, z] = seg.alongX ? [t + length / 2, lane] : [lane, t + length / 2];
        // Frente al edificio no se estaciona (acceso y portón de cocheras).
        const blocked = seg.alongX && side === -1 && seg.at === streetsZ.find((v) => v > LOT.z[1]) && x > -14 && x < 14;
        if (!blocked && rand() < 0.55) car(x, z, seg.alongX, rand, out);
        t += length;
      }
    }
  }
}

/** Árboles del anillo bajo: se achican en proporción (copa incluida). */
function lowerNearTrees(trees: Tree[]) {
  for (const t of trees) {
    if (!near(t.x, t.z, LOW_RADIUS) || t.height <= LOW_HEIGHT.tree) continue;
    const k = LOW_HEIGHT.tree / t.height;
    t.height *= k;
    t.crown *= Math.max(0.75, k);
  }
}

export function buildCity(seed = 1240): CityLayout {
  const rand = random(seed);
  const out: CityLayout = {
    blocks: [],
    asphalt: [],
    sidewalk: [],
    curb: [],
    marking: [],
    metal: [],
    lamp: [],
    bench: [],
    houses: [],
    roofFlat: [],
    roofTile: [],
    windowDark: [],
    windowLit: [],
    cars: [],
    carGlass: [],
    trees: [],
    shrubs: [],
  };

  for (let i = -RANGE; i <= RANGE; i++) {
    for (let j = -RANGE; j <= RANGE; j++) {
      const b = blockAt(i, j);
      // Distancia del punto más cercano de la manzana al centro.
      const dx = Math.max(b.x0, 0, -b.x1);
      const dz = Math.max(b.z0, 0, -b.z1);
      if (Math.hypot(dx, dz) > URBAN.radius) continue;
      const isOwn = i === 0 && j === 0;
      out.blocks.push(b);
      sidewalkRing(b, out);
      if (!isOwn) houses(b, rand, out);
      sidewalkFurniture(b, rand, out, isOwn);
    }
  }
  streets(out, rand);
  lowerNearTrees(out.trees);
  return out;
}
