"use client";

import { ContactShadows } from "@react-three/drei";
import { CircleGeometry, MeshStandardMaterial } from "three";
import { DISTANCE, fogRange } from "./camera";
import { CityBlocks, CityGround } from "./City";
import { Clouds } from "./Clouds";
import { Daylight } from "./Daylight";
import type { Box } from "./layout";
import { InstancedBoxes } from "./InstancedBoxes";
import { palette3D } from "./materials";
import { useShadowVersion } from "./shadowCache";
import { skyMaterial } from "./sky";
import { Sun } from "./Sun";
import { worldMapped } from "./textures";
import { UnitLight } from "./unitLight";

const SKY_RADIUS = 600;
const GROUND_RADIUS = 320;

function Sky() {
  return (
    <mesh material={skyMaterial} renderOrder={-1}>
      <sphereGeometry args={[SKY_RADIUS, 32, 16]} />
    </mesh>
  );
}

/**
 * Suelo amplio (pasto) que se funde con el horizonte por la niebla; las calles
 * van encima. Instanciado (una sola instancia) para compartir programa de
 * shader con el resto de las piezas texturizadas: menos compilación al cargar.
 */
const groundGeometry = new CircleGeometry(GROUND_RADIUS, 64).rotateX(-Math.PI / 2);
const groundMaterial = worldMapped(new MeshStandardMaterial({ color: palette3D.ground, roughness: 1 }), "grass", 9);
const groundBox: Box[] = [{ p: [0, 0, 0], s: [1, 1, 1] }];

function Ground() {
  return <InstancedBoxes boxes={groundBox} geometry={groundGeometry} material={groundMaterial} castShadow={false} />;
}

/**
 * Niebla y luces. Van siempre montadas y antes que cualquier malla: los
 * shaders se precompilan con esta configuración de luces.
 */
export function SceneLights() {
  return (
    <>
      <fog attach="fog" args={[palette3D.skyHorizon, ...fogRange(DISTANCE)]} />
      <Daylight />
      <UnitLight />
    </>
  );
}

/** Cielo (con la silueta del horizonte), suelo y calles: la primera etapa visible. */
export function SceneBackdrop() {
  return (
    <>
      <Sky />
      <Ground />
      <CityGround />
    </>
  );
}

/** Manzanas vecinas: casas, autos y mobiliario. */
export function Neighborhood() {
  return <CityBlocks />;
}

/** Sol y nubes: decorado, se suma en una etapa posterior. */
export function SkyDecor() {
  return (
    <>
      <Sun />
      <Clouds />
    </>
  );
}

/**
 * Sombras de contacto bajo el edificio (sobre el jardín): se calculan una sola
 * vez (frames=1), así que se montan cuando el edificio ya está en escena, y se
 * vuelven a montar (key) si cambia algo que proyecta sombra; si no, quedarían
 * sombras de objetos quitados.
 */
export function GroundShadows() {
  const version = useShadowVersion();
  return (
    <ContactShadows
      key={version}
      position={[0, 0.01, 0]}
      scale={44}
      resolution={1024}
      blur={2.4}
      far={12}
      opacity={0.4}
      color={palette3D.frame}
      frames={1}
    />
  );
}
