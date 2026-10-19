import { project } from "@/data/building";
import { GROUND, HALF_D, HALF_W, URBAN } from "./dimensions";
import type { Box } from "./layout";
import { random } from "./random";
import type { Shrub, Tree } from "./vegetationLayout";

/**
 * Jardín de acceso entre la vereda y el hall (el retiro de frente): solado
 * hasta la puerta, entrada vehicular al portón de cocheras, canteros de
 * hormigón con arbustos y flores, balizas que se encienden de noche y un
 * tótem con el nombre y el número. Puro y determinístico (semilla fija).
 */

export interface Flower extends Box {
  tone: number;
}

export interface TotemText {
  text: string;
  p: [number, number, number];
  size: [number, number];
}

export interface FrontYard {
  paving: Box[];
  driveway: Box[];
  /** Paredes de los canteros y el tótem (hormigón). */
  concrete: Box[];
  soil: Box[];
  flowers: Flower[];
  shrubs: Shrub[];
  bollards: Box[];
  bollardLights: Box[];
  totemText: TotemText[];
  trees: Tree[];
  /** Canteros en planta (para tests). */
  planters: { x0: number; x1: number; z0: number; z1: number }[];
}

const LINE = URBAN.lot.z[1];
const PAVING = 0.06;
const PLANTER = { height: 0.5, wall: 0.14, soil: 0.42 };
const FLOWER_DENSITY = 7;

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Box {
  return {
    p: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    s: [Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)],
  };
}

export function buildFrontYard(seed = 1240): FrontYard {
  const rand = random(seed + 7);
  const out: FrontYard = {
    paving: [],
    driveway: [],
    concrete: [],
    soil: [],
    flowers: [],
    shrubs: [],
    bollards: [],
    bollardLights: [],
    totemText: [],
    trees: [],
    planters: [],
  };
  const e = GROUND.entrance;

  // Solado: explanada frente a la puerta y camino hasta la vereda.
  const landing = HALF_D + 2.6;
  out.paving.push(box(e.x[0] - 1.2, e.x[1] + 1.2, 0, PAVING, HALF_D, landing));
  const path = [e.door[0] - 0.8, e.door[1] + 0.8] as const;
  out.paving.push(box(path[0], path[1], 0, PAVING, landing, LINE));

  // Entrada vehicular al portón de cocheras.
  out.driveway.push(box(GROUND.garageX + 0.2, HALF_W - 0.2, 0, PAVING - 0.01, HALF_D, LINE));

  // Canteros bajos de hormigón: paredes, tierra, arbustos y flores.
  const planterZ = [landing + 0.3, LINE - 1.2] as const;
  const planters = [
    { x0: path[1] + 1, x1: GROUND.garageX - 0.6 },
    { x0: -19, x1: path[0] - 1 },
    { x0: HALF_W + 1.2, x1: 21 },
  ];
  for (const { x0, x1 } of planters) {
    const [z0, z1] = planterZ;
    const w = PLANTER.wall;
    const h = PLANTER.height;
    out.planters.push({ x0, x1, z0, z1 });
    out.concrete.push(
      box(x0, x1, 0, h, z0, z0 + w),
      box(x0, x1, 0, h, z1 - w, z1),
      box(x0, x0 + w, 0, h, z0 + w, z1 - w),
      box(x1 - w, x1, 0, h, z0 + w, z1 - w),
    );
    out.soil.push(box(x0 + w, x1 - w, 0, PLANTER.soil, z0 + w, z1 - w));

    // Arbustos bajos a lo largo, y flores de tonos suaves entre ellos.
    const zc = (z0 + z1) / 2;
    for (let x = x0 + 0.9; x < x1 - 0.6; x += 1.5 + rand() * 0.5) {
      out.shrubs.push({ x, z: zc + (rand() - 0.5) * 0.5, radius: 0.42 + rand() * 0.18, tone: Math.floor(rand() * 3), y: PLANTER.soil });
    }
    const area = (x1 - x0 - 2 * w) * (z1 - z0 - 2 * w);
    const count = Math.round(area * FLOWER_DENSITY);
    for (let i = 0; i < count; i++) {
      const r = 0.08 + rand() * 0.07;
      const x = x0 + w + r + rand() * (x1 - x0 - 2 * w - 2 * r);
      const z = z0 + w + r + rand() * (z1 - z0 - 2 * w - 2 * r);
      const y = PLANTER.soil + 0.12 + rand() * 0.18;
      out.flowers.push({ p: [x, y, z], s: [r, r * 0.8, r], tone: Math.floor(rand() * 5) });
    }
  }

  // Balizas a los lados del camino: postes bajos con luz al pie (se encienden de noche).
  for (const x of [path[0] - 0.35, path[1] + 0.35]) {
    for (const z of [landing + 0.8, landing + 2.4]) {
      out.bollards.push(box(x - 0.08, x + 0.08, 0, 0.75, z - 0.08, z + 0.08));
      out.bollardLights.push(box(x - 0.09, x + 0.09, 0.75, 0.83, z - 0.09, z + 0.09));
    }
  }

  // Tótem de hormigón junto a la vereda, con el nombre y el número.
  const tx = path[0] - 3.2;
  const totem = { x0: tx - 0.55, x1: tx + 0.55, z0: LINE - 0.75, z1: LINE - 0.45, h: 2.6 };
  out.concrete.push(box(totem.x0, totem.x1, 0, totem.h, totem.z0, totem.z1));
  const face = totem.z1 + 0.01;
  const name = project.name.split(" ")[0].toUpperCase();
  const number = project.address.match(/\d+/)?.[0] ?? "";
  out.totemText.push({ text: name, p: [tx, totem.h - 0.45, face], size: [0.9, 0.2] });
  out.totemText.push({ text: number, p: [tx, totem.h - 0.8, face], size: [0.7, 0.18] });

  // Un árbol columnar en la esquina oeste: enmarca sin tapar el hall desde la cámara.
  out.trees.push({ kind: "columnar", x: -22.5, z: LINE - 2.5, height: 7.5, crown: 1.2, tone: 2 });

  return out;
}
