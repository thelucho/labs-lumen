import { levels, type Level, type SelectableId } from "@/data/building";
import { getUnit, levelElevation } from "@/lib/building";
import {
  BAY,
  CORE,
  CORNER,
  DIVIDER_X,
  FRONT_FRAME,
  GLASS,
  GROUND,
  HALF_D,
  HALF_W,
  MULLION,
  OFFICE,
  MULLION_DEPTH,
  PANEL,
  PLINTH,
  RAIL,
  RAILING,
  ROOF,
  ROOM_GAP,
  ROOM_INSET,
  SLAB,
  SLAB_OVERHANG,
  TRANSOM,
  balconyGeometry,
  unitSpanX,
} from "./dimensions";

/** Caja alineada a los ejes: centro y tamaño. */
export interface Box {
  p: [number, number, number];
  s: [number, number, number];
  /** Giro sobre Y en radianes (solo piezas con geometría propia, como los autos). */
  r?: number;
}

export type MaterialKey = "concrete" | "cladding" | "frame" | "glass" | "deck" | "water";

export interface Room {
  id: SelectableId;
  box: Box;
}

export interface BuildingLayout {
  parts: Record<MaterialKey, Box[]>;
  /** Volúmenes interiores (uno por unidad, PB y SUM): se iluminan en la Fase 4. */
  rooms: Room[];
  streetNumber: { p: [number, number, number]; size: [number, number] };
}

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Box {
  return {
    p: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    s: [Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)],
  };
}

type BayKind = "glass" | "panel";

interface Face {
  /** Eje sobre el que corre la fachada: "x" = norte/sur, "z" = este/oeste. */
  axis: "x" | "z";
  from: number;
  to: number;
  /** Coordenada fija del plano de fachada. */
  at: number;
  /** Sentido hacia afuera (+1 / −1). */
  normal: 1 | -1;
  y0: number;
  y1: number;
  /** Paño de cada módulo; recibe también los extremos del módulo (a, b) a lo largo de la fachada. */
  pattern?: (i: number, n: number, a: number, b: number) => BayKind;
  transom?: number;
  /** Material de los paños ciegos (por defecto, revestimiento de madera). */
  panel?: MaterialKey;
}

class LayoutBuilder {
  parts: Record<MaterialKey, Box[]> = {
    concrete: [],
    cladding: [],
    frame: [],
    glass: [],
    deck: [],
    water: [],
  };
  rooms: Room[] = [];

  add(key: MaterialKey, b: Box) {
    this.parts[key].push(b);
  }

  /** Caja sobre un plano de fachada: `a..b` a lo largo, `offset` hacia afuera. */
  private onFace(f: Face, a: number, b: number, y0: number, y1: number, offset: number, t: number): Box {
    const c = f.at + f.normal * offset;
    return f.axis === "x"
      ? box(a, b, y0, y1, c - t / 2, c + t / 2)
      : box(c - t / 2, c + t / 2, y0, y1, a, b);
  }

  /** Fachada modulada: paños de vidrio o de revestimiento, montantes y travesaño. */
  face(f: Face) {
    const length = f.to - f.from;
    const n = Math.max(1, Math.round(length / BAY));
    const bay = length / n;
    let hasGlass = false;
    for (let i = 0; i < n; i++) {
      const a = f.from + i * bay;
      const kind = f.pattern?.(i, n, a, a + bay) ?? "glass";
      if (kind === "glass") {
        hasGlass = true;
        this.add("glass", this.onFace(f, a, a + bay, f.y0, f.y1, -0.04, GLASS));
      } else {
        // Centrado en el plano: los montantes (más profundos) sobresalen y no quedan al ras.
        this.add(f.panel ?? "cladding", this.onFace(f, a, a + bay, f.y0, f.y1, 0, PANEL));
      }
    }
    for (let i = 0; i <= n; i++) {
      const x = f.from + i * bay;
      this.add("frame", this.onFace(f, x - MULLION / 2, x + MULLION / 2, f.y0, f.y1, 0, MULLION_DEPTH));
    }
    if (hasGlass && f.transom !== undefined) {
      const y = f.y0 + f.transom;
      this.add("frame", this.onFace(f, f.from, f.to, y - MULLION / 2, y + MULLION / 2, 0, MULLION_DEPTH));
    }
  }

  /**
   * Parasoles verticales sobre cada montante de una fachada (mismo módulo que
   * `face`): sombra al sol bajo y relieve en una cara que si no sería plana.
   */
  fins(f: Face, depth: number, width = 0.1, key: MaterialKey = "cladding") {
    const n = Math.max(1, Math.round((f.to - f.from) / BAY));
    const bay = (f.to - f.from) / n;
    for (let i = 1; i < n; i++) {
      const x = f.from + i * bay;
      this.add(key, this.onFace(f, x - width / 2, x + width / 2, f.y0, f.y1, depth / 2, depth));
    }
  }

  /** Baranda de vidrio con pasamanos grafito, de (x0,z0) a (x1,z1) en planta. */
  railing(x0: number, z0: number, x1: number, z1: number, y: number) {
    const t = 0.04;
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    const glass = alongX
      ? box(x0, x1, y, y + RAILING, z0 - t / 2, z0 + t / 2)
      : box(x0 - t / 2, x0 + t / 2, y, y + RAILING, z0, z1);
    const rail = alongX
      ? box(x0, x1, y + RAILING, y + RAILING + RAIL, z0 - RAIL / 2, z0 + RAIL / 2)
      : box(x0 - RAIL / 2, x0 + RAIL / 2, y + RAILING, y + RAILING + RAIL, z0, z1);
    this.add("glass", glass);
    this.add("frame", rail);
  }

  room(id: SelectableId, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    this.rooms.push({
      id,
      box: box(x0 + ROOM_INSET, x1 - ROOM_INSET, y0 + ROOM_GAP, y1 - ROOM_GAP, z0 + ROOM_INSET, z1 - ROOM_INSET),
    });
  }

  slabBand(y: number) {
    const o = SLAB_OVERHANG;
    this.add("concrete", box(-HALF_W - o, HALF_W + o, y, y + SLAB, -HALF_D - o, HALF_D + o));
  }
}

const solidSouth = (i: number) => (i % 2 === 0 ? "panel" : "glass");
/** Frente: paños de revestimiento en los extremos de cada unidad. */
const framedNorth = (i: number, n: number) => (i === 0 || i === n - 1 ? "panel" : "glass");
const solidWest = (i: number) => (i % 2 === 1 ? "panel" : "glass");

function groundLevel(b: LayoutBuilder, level: Level, y0: number) {
  const yA = y0 + PLINTH;
  const yB = y0 + level.height;
  b.add("concrete", box(-HALF_W - 0.3, HALF_W + 0.3, y0, yA, -HALF_D - 0.3, HALF_D + 0.3));

  // Hall doble altura: macizo de madera con el vidrio concentrado en el acceso
  // (frente) y en los primeros módulos de los laterales; servicios al contrafrente.
  const e = GROUND.entrance;
  const atEntrance = (_i: number, _n: number, a: number, end: number): BayKind =>
    end > e.x[0] + 0.2 && a < e.x[1] - 0.2 ? "glass" : "panel";
  const nearFront = (_i: number, _n: number, a: number): BayKind => (a > HALF_D - 4.6 ? "glass" : "panel");
  b.face({ axis: "x", from: -HALF_W, to: GROUND.garageX, at: HALF_D, normal: 1, y0: yA, y1: yB, pattern: atEntrance, transom: GROUND.doorHead });
  b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: HALF_W, normal: 1, y0: yA, y1: yB, pattern: nearFront, transom: GROUND.doorHead });
  b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: -HALF_W, normal: -1, y0: yA, y1: yB, pattern: nearFront, transom: GROUND.doorHead });
  b.face({ axis: "x", from: -HALF_W, to: HALF_W, at: -HALF_D, normal: -1, y0: yA, y1: yB, pattern: solidWest });

  // Pórtico de hormigón alrededor del acceso, hasta la marquesina.
  const jamb = 0.45;
  const portal = HALF_D + e.depth;
  b.add("concrete", box(e.x[0] - jamb, e.x[0], yA, GROUND.canopy.y, HALF_D, portal));
  b.add("concrete", box(e.x[1], e.x[1] + jamb, yA, GROUND.canopy.y, HALF_D, portal));
  // Puerta pivotante grande: hoja de vidrio con marco grafito grueso y tirador vertical.
  const [d0, d1] = e.door;
  const zf = HALF_D + 0.02;
  const t = 0.12;
  b.add("frame", box(d0, d0 + t, yA, e.doorHeight, zf, zf + 0.1));
  b.add("frame", box(d1 - t, d1, yA, e.doorHeight, zf, zf + 0.1));
  b.add("frame", box(d0, d1, e.doorHeight - t, e.doorHeight, zf, zf + 0.1));
  b.add("frame", box((d0 + d1) / 2 - 0.03, (d0 + d1) / 2 + 0.03, yA, e.doorHeight - t, zf, zf + 0.08));
  const pull = d1 - 0.45;
  b.add("frame", box(pull - 0.03, pull + 0.03, yA + 0.6, yA + 2.2, zf + 0.1, zf + 0.18));

  // Portón de cocheras y paño ciego encima.
  b.add("cladding", box(GROUND.garageX, HALF_W, yA, GROUND.garageHeight, HALF_D - 0.05, HALF_D + 0.04));
  b.add("concrete", box(GROUND.garageX, HALF_W, GROUND.garageHeight, yB, HALF_D - 0.04, HALF_D + 0.06));

  // Marquesina de acceso.
  const c = GROUND.canopy;
  b.add("concrete", box(c.x[0], c.x[1], c.y, c.y + c.thickness, HALF_D, HALF_D + c.depth));

  if (level.commonSpaceId) b.room(level.commonSpaceId, -HALF_W, HALF_W, yA, yB, -HALF_D, HALF_D);
}

function residentialLevel(b: LayoutBuilder, level: Level, y0: number) {
  const yA = y0 + SLAB;
  const yB = y0 + level.height;
  b.slabBand(y0);

  for (const id of level.unitIds) {
    const unit = getUnit(id)!;
    const [x0, x1] = unitSpanX(unit.side);
    const east = unit.side !== "B";
    const west = unit.side !== "A";

    b.room(unit.id, x0, x1, yA, yB, -HALF_D, HALF_D);
    b.face({ axis: "x", from: x0, to: x1, at: HALF_D, normal: 1, y0: yA, y1: yB, pattern: framedNorth, transom: TRANSOM });
    b.face({ axis: "x", from: x0, to: x1, at: -HALF_D, normal: -1, y0: yA, y1: yB, pattern: solidSouth, transom: TRANSOM });
    if (east) b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: HALF_W, normal: 1, y0: yA, y1: yB, transom: TRANSOM });
    if (west) {
      const westFace: Face = { axis: "z", from: -HALF_D, to: HALF_D, at: -HALF_W, normal: -1, y0: yA, y1: yB, pattern: solidWest, transom: TRANSOM };
      b.face(westFace);
      // Lateral oeste: parasoles de madera contra el sol de la tarde.
      b.fins(westFace, 0.55);
    }
    // Frente de las B: parasoles (las A van dentro del marco saliente).
    if (unit.side === "B") {
      b.fins({ axis: "x", from: x0, to: x1, at: HALF_D, normal: 1, y0: yA, y1: yB }, 0.5);
    }

    if (unit.balconyArea > 0) {
      const { length, depth } = balconyGeometry(unit);
      const z0 = -length / 2;
      const z1 = length / 2;
      const xOut = HALF_W + depth;
      b.add("concrete", box(HALF_W, xOut, y0, y0 + SLAB, z0, z1));
      b.railing(xOut, z0, xOut, z1, yA);
      b.railing(HALF_W, z0, xOut, z0, yA);
      b.railing(HALF_W, z1, xOut, z1, yA);
    }
  }

  // División A/B: tabique interior y montante de hormigón en frente y contrafrente.
  if (level.unitIds.length > 1) {
    b.add("concrete", box(DIVIDER_X - 0.1, DIVIDER_X + 0.1, yA, yB, -HALF_D, HALF_D));
    for (const z of [HALF_D, -HALF_D]) {
      b.add("concrete", box(DIVIDER_X - 0.2, DIVIDER_X + 0.2, yA, yB, z - 0.2, z + 0.2));
    }
  }
}

/**
 * Oficinas: piso entero en planta libre, con vidrio de piso a techo en frente
 * y laterales (montantes más finos que en los departamentos), contrafrente
 * alternado y aleros horizontales de grafito en el frente y el oeste. Se leen
 * como una banda distinta sobre los departamentos.
 */
function officeLevel(b: LayoutBuilder, level: Level, y0: number) {
  const yA = y0 + SLAB;
  const yB = y0 + level.height;
  b.slabBand(y0);
  const id = level.unitIds[0];
  if (id) b.room(id, -HALF_W, HALF_W, yA, yB, -HALF_D, HALF_D);

  const transom = OFFICE.transom;
  b.face({ axis: "x", from: -HALF_W, to: HALF_W, at: HALF_D, normal: 1, y0: yA, y1: yB, transom });
  b.face({ axis: "x", from: -HALF_W, to: HALF_W, at: -HALF_D, normal: -1, y0: yA, y1: yB, pattern: solidSouth, transom });
  b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: HALF_W, normal: 1, y0: yA, y1: yB, transom });
  b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: -HALF_W, normal: -1, y0: yA, y1: yB, transom });

  // Aleros: frente (norte) y lateral oeste, a la altura del travesaño.
  const e = OFFICE.eave;
  const y = yA + transom;
  b.add("frame", box(-HALF_W - e.depth, HALF_W, y, y + e.thickness, HALF_D, HALF_D + e.depth));
  b.add("frame", box(-HALF_W - e.depth, -HALF_W, y, y + e.thickness, -HALF_D, HALF_D));
}

function roofLevel(b: LayoutBuilder, level: Level, y0: number) {
  const yA = y0 + SLAB;
  b.slabBand(y0);

  // Baranda perimetral de la terraza.
  const e = 0.05;
  b.railing(-HALF_W + e, HALF_D - e, HALF_W - e, HALF_D - e, yA);
  b.railing(-HALF_W + e, -HALF_D + e, HALF_W - e, -HALF_D + e, yA);
  b.railing(HALF_W - e, -HALF_D + e, HALF_W - e, HALF_D - e, yA);
  b.railing(-HALF_W + e, -HALF_D + e, -HALF_W + e, HALF_D - e, yA);

  // SUM: volumen liviano, vidriado en los cuatro lados, con losa en alero.
  const s = ROOF.sum;
  const yTop = yA + s.height;
  // Vidrio hacia el frente (vista) y hacia la pileta; hormigón al fondo y al oeste, con un paño vidriado.
  const solid = (): BayKind => "panel";
  const middleGlass = (i: number, n: number): BayKind => (i === Math.floor(n / 2) ? "glass" : "panel");
  b.face({ axis: "x", from: s.x[0], to: s.x[1], at: s.z[1], normal: 1, y0: yA, y1: yTop, transom: TRANSOM });
  b.face({ axis: "x", from: s.x[0], to: s.x[1], at: s.z[0], normal: -1, y0: yA, y1: yTop, pattern: solid, panel: "concrete" });
  b.face({ axis: "z", from: s.z[0], to: s.z[1], at: s.x[1], normal: 1, y0: yA, y1: yTop, transom: TRANSOM });
  b.face({ axis: "z", from: s.z[0], to: s.z[1], at: s.x[0], normal: -1, y0: yA, y1: yTop, pattern: middleGlass, panel: "concrete", transom: TRANSOM });
  b.add("concrete", box(s.x[0] - s.eave, s.x[1] + s.eave, yTop, yTop + s.roof, s.z[0] - s.eave, s.z[1] + s.eave));
  if (level.commonSpaceId) b.room(level.commonSpaceId, s.x[0], s.x[1], yA, yTop, s.z[0], s.z[1]);

  // Solárium con deck y pileta.
  const d = ROOF.deck;
  b.add("deck", box(d.x[0], d.x[1], yA, yA + d.thickness, d.z[0], d.z[1]));
  const p = ROOF.pool;
  const c = p.coping;
  const yCoping = yA + p.depth + 0.05;
  b.add("concrete", box(p.x[0] - c, p.x[1] + c, yA, yCoping, p.z[1], p.z[1] + c));
  b.add("concrete", box(p.x[0] - c, p.x[1] + c, yA, yCoping, p.z[0] - c, p.z[0]));
  b.add("concrete", box(p.x[0] - c, p.x[0], yA, yCoping, p.z[0], p.z[1]));
  b.add("concrete", box(p.x[1], p.x[1] + c, yA, yCoping, p.z[0], p.z[1]));
  b.add("water", box(p.x[0], p.x[1], yA, yA + p.depth, p.z[0], p.z[1]));

  // Sala de máquinas con puerta al oeste.
  const m = ROOF.machineRoom;
  b.add("concrete", box(m.x[0], m.x[1], yA, yA + m.height, m.z[0], m.z[1]));
  const zDoor = (m.z[0] + m.z[1]) / 2;
  b.add("frame", box(m.x[0] - 0.04, m.x[0] + 0.01, yA, yA + 2, zDoor - 0.45, zDoor + 0.45));
}

export function buildBuildingLayout(): BuildingLayout {
  const b = new LayoutBuilder();

  for (const level of levels) {
    const y0 = levelElevation(level.index);
    if (level.kind === "ground") groundLevel(b, level, y0);
    else if (level.kind === "roof") roofLevel(b, level, y0);
    else if (level.kind === "office") officeLevel(b, level, y0);
    else residentialLevel(b, level, y0);
  }

  // Columnas de esquina desde la vereda hasta la losa de azotea.
  const roof = levels.find((l) => l.kind === "roof")!;
  const top = levelElevation(roof.index) + SLAB;

  // Marco de hormigón saliente que abraza las unidades A del frente (pisos tipo):
  // esa parte del edificio "sale" respecto del resto de la fachada.
  const typicalFloors = levels.filter((l) => l.kind === "typical");
  if (typicalFloors.length > 0) {
    const f = FRONT_FRAME;
    const yLow = levelElevation(typicalFloors[0].index);
    const yHigh = levelElevation(typicalFloors[typicalFloors.length - 1].index + 1) + SLAB;
    const xa = DIVIDER_X + 0.2;
    const xb = HALF_W - 0.2;
    const z1 = HALF_D + f.depth;
    b.add("concrete", box(xa, xb, yLow - f.thickness, yLow + 0.05, HALF_D, z1));
    b.add("concrete", box(xa, xb, yHigh - 0.05, yHigh + f.thickness, HALF_D, z1));
    b.add("concrete", box(xa, xa + f.thickness, yLow - f.thickness, yHigh + f.thickness, HALF_D, z1));
    b.add("concrete", box(xb - f.thickness, xb, yLow - f.thickness, yHigh + f.thickness, HALF_D, z1));
  }

  // Núcleo de escalera y ascensores: volumen macizo que sobresale en el
  // contrafrente y sube hasta la sala de máquinas, con una ranura vidriada.
  const core = CORE;
  const coreTop = top + ROOF.machineRoom.height;
  b.add("concrete", box(core.x[0], core.x[1], 0, coreTop, core.z, -HALF_D));
  const slit = (core.x[0] + core.x[1]) / 2;
  b.add("glass", box(slit - 0.3, slit + 0.3, 4.6, coreTop - 1.2, core.z - 0.03, core.z + 0.01));
  b.add("frame", box(slit - 0.36, slit + 0.36, 4.5, 4.6, core.z - 0.06, core.z + 0.01));
  for (const x of [-HALF_W, HALF_W]) {
    for (const z of [-HALF_D, HALF_D]) {
      b.add("concrete", box(x - CORNER / 2, x + CORNER / 2, 0, top, z - CORNER / 2, z + CORNER / 2));
    }
  }

  const c = GROUND.canopy;
  return {
    parts: b.parts,
    rooms: b.rooms,
    streetNumber: {
      p: [(c.x[0] + c.x[1]) / 2, c.y + c.thickness / 2, HALF_D + c.depth + 0.01],
      size: [1.6, c.thickness * 0.8],
    },
  };
}
