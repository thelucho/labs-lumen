import {
  BackSide,
  BoxGeometry,
  MeshStandardMaterial,
  type Material,
} from "three";
import type { MaterialKey } from "./layout";
import { worldMapped } from "./textures";

/**
 * Paleta de materiales 3D (SPEC §4.2). La UI usa los tokens de §6.3; el modelo
 * usa estos tonos desaturados de maqueta. `unitLight` es la luz de las
 * unidades, en línea con el token `brass`.
 */
export const palette3D = {
  concrete: "#e3dfd7",
  cladding: "#b3a08a",
  frame: "#3a3d41",
  glass: "#9fb2b5",
  interior: "#ebe6dc",
  deck: "#9c7d61",
  water: "#7d9ea6",
  skyTop: "#c7d2d6",
  skyHorizon: "#ebe8e2",
  skyFill: "#dfe1df",
  ground: "#b9b99f",
  sidewalk: "#d8d2c5",
  curb: "#c4c0b7",
  street: "#77797a",
  /** Pintura vial, gastada. */
  marking: "#e6e3da",
  /** Metal oscuro: columnas de alumbrado, tapas, rejillas, ruedas. */
  metal: "#4a4d50",
  /** Cabezal de las luminarias: se enciende de noche. */
  lamp: "#f3dcb0",
  /** Casas vecinas: revoques claros desaturados y techos de teja. */
  houses: ["#e6e0d4", "#ddd6c8", "#d3cfc6", "#e2d6c3", "#cdc4b4", "#c9b6a3"],
  roofFlat: "#bdb8ad",
  roofTile: "#a3816f",
  windowDark: "#6a7377",
  /** Autos estacionados: colores reales, apagados. */
  cars: ["#e7e6e2", "#9da2a6", "#4a4f55", "#5f6c7c", "#8a5f55", "#8a8f86", "#c9c6bd"],
  carGlass: "#2e3740",
  /** Silueta de la ciudad en el horizonte (se mezcla con el color del cielo). */
  skyline: "#9ea7ad",
  bench: "#8a6d55",
  cloud: "#f8f7f4",
  /** Vegetación: verdes desaturados de maqueta, emparentados con el token `sage`. */
  foliage: "#7e8d68",
  foliageLight: "#97a37f",
  foliageDark: "#66745a",
  shrub: "#8b9874",
  trunk: "#76695a",
  sun: "#fff1dc",
  sunDisc: "#fff6e6",
  /** Sol bajo (amanecer y atardecer): más cálido, sin saturar. */
  sunLow: "#f2c39a",
  skyTopDusk: "#b9bfc3",
  skyHorizonDusk: "#ead5c1",
  /** Noche: luz de luna fría y tenue, cielo grafito azulado. */
  moon: "#b7c2cf",
  skyTopNight: "#262c33",
  skyHorizonNight: "#3d444b",
  skyFillNight: "#58626d",
  groundNight: "#3a3c38",
  cloudNight: "#8b9198",
  unitLight: "#f2c27b",
  /** Base del interior encendido: más oscura para que domine el emisivo. */
  interiorLit: "#5e5548",
  /** Unidades vendidas: luz más tenue y neutra (SPEC §5.6). */
  soldLight: "#e2ddd3",
} as const;

/** Cubo unitario compartido: todas las cajas lo escalan. */
export const unitBox = new BoxGeometry(1, 1, 1);

export const materials: Record<MaterialKey, Material> = {
  concrete: worldMapped(new MeshStandardMaterial({ color: palette3D.concrete, roughness: 0.92 }), "concrete", 3),
  cladding: worldMapped(new MeshStandardMaterial({ color: palette3D.cladding, roughness: 0.75 }), "wood", 1.6),
  frame: new MeshStandardMaterial({ color: palette3D.frame, roughness: 0.5, metalness: 0.25 }),
  glass: new MeshStandardMaterial({
    color: palette3D.glass,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  }),
  deck: worldMapped(new MeshStandardMaterial({ color: palette3D.deck, roughness: 0.85 }), "wood", 1.6),
  water: new MeshStandardMaterial({
    color: palette3D.water,
    roughness: 0.06,
    metalness: 0.15,
    transparent: true,
    opacity: 0.9,
  }),
};

/** Entorno urbano (City): un material por familia de piezas. */
export const cityMaterials = {
  asphalt: worldMapped(new MeshStandardMaterial({ color: palette3D.street, roughness: 0.95 }), "asphalt", 7),
  sidewalk: worldMapped(new MeshStandardMaterial({ color: palette3D.sidewalk, roughness: 0.9 }), "tiles", 2),
  curb: worldMapped(new MeshStandardMaterial({ color: palette3D.curb, roughness: 0.9 }), "concrete", 3),
  marking: new MeshStandardMaterial({ color: palette3D.marking, roughness: 0.8 }),
  metal: new MeshStandardMaterial({ color: palette3D.metal, roughness: 0.5, metalness: 0.4 }),
  lamp: new MeshStandardMaterial({ color: palette3D.lamp, emissive: palette3D.lamp, emissiveIntensity: 0, roughness: 0.4 }),
  /** Blanco: el tono de cada casa va por instancia. */
  house: worldMapped(new MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 }), "plaster", 3),
  roofFlat: worldMapped(new MeshStandardMaterial({ color: palette3D.roofFlat, roughness: 0.95 }), "concrete", 3),
  roofTile: new MeshStandardMaterial({ color: palette3D.roofTile, roughness: 0.85 }),
  windowDark: new MeshStandardMaterial({ color: palette3D.windowDark, roughness: 0.15, metalness: 0.3 }),
  /** Ventanas que se encienden de noche (Daylight les sube el emisivo). */
  windowLit: new MeshStandardMaterial({
    color: palette3D.windowDark,
    emissive: palette3D.unitLight,
    emissiveIntensity: 0,
    roughness: 0.15,
    metalness: 0.3,
  }),
  car: new MeshStandardMaterial({ color: "#ffffff", roughness: 0.45, metalness: 0.1 }),
  carGlass: new MeshStandardMaterial({ color: palette3D.carGlass, roughness: 0.1, metalness: 0.5 }),
  bench: worldMapped(new MeshStandardMaterial({ color: palette3D.bench, roughness: 0.8 }), "wood", 1.6),
};

export type CityMaterialKey = keyof typeof cityMaterials;

/**
 * Interior visto desde afuera: se dibujan las caras traseras del volumen, así
 * a través del vidrio se ven piso, cielorraso y paredes del fondo.
 */
export const interiorMaterial = new MeshStandardMaterial({
  color: palette3D.interior,
  roughness: 1,
  side: BackSide,
});
