"use client";

import { ContactShadows } from "@react-three/drei";
import { project } from "@/data/building";
import { DISTANCE, fogRange } from "./camera";
import { Clouds } from "./Clouds";
import { Daylight } from "./Daylight";
import { palette3D } from "./materials";
import { useShadowVersion } from "./shadowCache";
import { skyMaterial } from "./sky";
import { Sun } from "./Sun";
import { UnitLight } from "./unitLight";

const SKY_RADIUS = 600;
const GROUND_RADIUS = 320;

const HALF_D = project.footprint.depth / 2;
const SIDEWALK = { width: 4, height: 0.12 };
const STREET_WIDTH = 9;
const FRONTAGE = 90;

function Sky() {
  return (
    <mesh material={skyMaterial} renderOrder={-1}>
      <sphereGeometry args={[SKY_RADIUS, 32, 16]} />
    </mesh>
  );
}

/** Suelo amplio que se funde con el horizonte por la niebla, vereda y calle al frente. */
function Ground() {
  const sidewalkZ = HALF_D + SIDEWALK.width / 2;
  const streetZ = HALF_D + SIDEWALK.width + STREET_WIDTH / 2;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[GROUND_RADIUS, 64]} />
        <meshStandardMaterial color={palette3D.ground} roughness={1} />
      </mesh>
      <mesh position={[0, SIDEWALK.height / 2, sidewalkZ]} receiveShadow>
        <boxGeometry args={[FRONTAGE, SIDEWALK.height, SIDEWALK.width]} />
        <meshStandardMaterial color={palette3D.sidewalk} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.01, streetZ]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[FRONTAGE, STREET_WIDTH]} />
        <meshStandardMaterial color={palette3D.street} roughness={1} />
      </mesh>
    </group>
  );
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

/** Cielo y suelo: la primera etapa visible. */
export function SceneBackdrop() {
  return (
    <>
      <Sky />
      <Ground />
    </>
  );
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
 * Sombras de contacto: se calculan una sola vez (frames=1), así que se montan
 * cuando el edificio ya está en escena, y se vuelven a montar (key) si cambia
 * algo que proyecta sombra; si no, quedarían sombras de objetos quitados.
 */
export function GroundShadows() {
  const version = useShadowVersion();
  return (
    <ContactShadows
      key={version}
      position={[0, SIDEWALK.height + 0.01, 0]}
      scale={60}
      resolution={1024}
      blur={2.4}
      far={12}
      opacity={0.4}
      color={palette3D.frame}
      frames={1}
    />
  );
}
