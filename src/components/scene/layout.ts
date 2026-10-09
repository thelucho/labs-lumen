import { levels, type Level, type SelectableId } from "@/data/building";
import { getUnit, levelElevation } from "@/lib/building";
import {
  BAY,
  CORNER,
  DIVIDER_X,
  GLASS,
  GROUND,
  HALF_D,
  HALF_W,
  MULLION,
  MULLION_DEPTH,
  PANEL,
  PLINTH,
  RAIL,
  RAILING,
  ROOF,
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
  pattern?: (i: number, n: number) => BayKind;
  transom?: number;
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
      const kind = f.pattern?.(i, n) ?? "glass";
      if (kind === "glass") {
        hasGlass = true;
        this.add("glass", this.onFace(f, a, a + bay, f.y0, f.y1, -0.04, GLASS));
      } else {
        this.add("cladding", this.onFace(f, a, a + bay, f.y0, f.y1, 0.02, PANEL));
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
      box: box(x0 + ROOM_INSET, x1 - ROOM_INSET, y0, y1 - 0.02, z0 + ROOM_INSET, z1 - ROOM_INSET),
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

  // Hall vidriado doble altura en frente y laterales; servicios al contrafrente.
  b.face({ axis: "x", from: -HALF_W, to: GROUND.garageX, at: HALF_D, normal: 1, y0: yA, y1: yB, transom: GROUND.doorHead });
  b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: HALF_W, normal: 1, y0: yA, y1: yB, transom: GROUND.doorHead });
  b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: -HALF_W, normal: -1, y0: yA, y1: yB, transom: GROUND.doorHead });
  b.face({ axis: "x", from: -HALF_W, to: HALF_W, at: -HALF_D, normal: -1, y0: yA, y1: yB, pattern: solidWest });

  // Portón de cocheras y paño ciego encima.
  b.add("cladding", box(GROUND.garageX, HALF_W, yA, GROUND.garageHeight, HALF_D - 0.06, HALF_D + 0.04));
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
    if (west) b.face({ axis: "z", from: -HALF_D, to: HALF_D, at: -HALF_W, normal: -1, y0: yA, y1: yB, pattern: solidWest, transom: TRANSOM });

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
  b.face({ axis: "x", from: s.x[0], to: s.x[1], at: s.z[1], normal: 1, y0: yA, y1: yTop, transom: TRANSOM });
  b.face({ axis: "x", from: s.x[0], to: s.x[1], at: s.z[0], normal: -1, y0: yA, y1: yTop, transom: TRANSOM });
  b.face({ axis: "z", from: s.z[0], to: s.z[1], at: s.x[1], normal: 1, y0: yA, y1: yTop, transom: TRANSOM });
  b.face({ axis: "z", from: s.z[0], to: s.z[1], at: s.x[0], normal: -1, y0: yA, y1: yTop, transom: TRANSOM });
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
    else residentialLevel(b, level, y0);
  }

  // Columnas de esquina desde la vereda hasta la losa de azotea.
  const roof = levels.find((l) => l.kind === "roof")!;
  const top = levelElevation(roof.index) + SLAB;
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
