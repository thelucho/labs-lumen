import {
  BackSide,
  BoxGeometry,
  MeshStandardMaterial,
  type Material,
} from "three";
import type { MaterialKey } from "./layout";

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
  ground: "#c9c7b7",
  sidewalk: "#dcd8cf",
  street: "#b3b0a8",
  cloud: "#f8f7f4",
  sun: "#fff1dc",
  sunDisc: "#fff6e6",
  unitLight: "#f2c27b",
} as const;

/** Cubo unitario compartido: todas las cajas lo escalan. */
export const unitBox = new BoxGeometry(1, 1, 1);

export const materials: Record<MaterialKey, Material> = {
  concrete: new MeshStandardMaterial({ color: palette3D.concrete, roughness: 0.92 }),
  cladding: new MeshStandardMaterial({ color: palette3D.cladding, roughness: 0.8 }),
  frame: new MeshStandardMaterial({ color: palette3D.frame, roughness: 0.55, metalness: 0.2 }),
  glass: new MeshStandardMaterial({
    color: palette3D.glass,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  }),
  deck: new MeshStandardMaterial({ color: palette3D.deck, roughness: 0.85 }),
  water: new MeshStandardMaterial({
    color: palette3D.water,
    roughness: 0.06,
    metalness: 0.15,
    transparent: true,
    opacity: 0.9,
  }),
};

/**
 * Interior visto desde afuera: se dibujan las caras traseras del volumen, así
 * a través del vidrio se ven piso, cielorraso y paredes del fondo.
 */
export const interiorMaterial = new MeshStandardMaterial({
  color: palette3D.interior,
  roughness: 1,
  side: BackSide,
});
