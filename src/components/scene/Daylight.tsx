"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Color, Fog, MathUtils, type DirectionalLight, type HemisphereLight } from "three";
import {
  daylightFactor,
  highSunFactor,
  sunAzimuth,
  sunElevation,
} from "@/lib/daylight";
import { useUIStore } from "@/lib/store";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { INITIAL_AZIMUTH, skyPoint } from "./camera";
import { cloudMaterial } from "./Clouds";
import { cityMaterials, palette3D } from "./materials";
import { skyMaterial } from "./sky";

const SUN_DISTANCE = 90;
/** Cubre la manzana del edificio y las calles que la rodean. */
const SHADOW_EXTENT = 58;
/** Por debajo de esta altura la luz deja de bajar: evita sombras infinitas al ras. */
const MIN_LIGHT_ELEVATION = 3;
const SUN_INTENSITY = 1.9;
const MOON_INTENSITY = 0.55;
const HEMI_INTENSITY = 2.3;
const LAMP_INTENSITY = 2.2;
const WINDOW_INTENSITY = 0.9;
/** Luna fija, alta y a un costado de la cámara inicial: de noche se leen los volúmenes. */
const MOON_POSITION = skyPoint(INITIAL_AZIMUTH - 70, 38, SUN_DISTANCE);
/** Qué tan rápido la escena alcanza la hora del slider. */
const LAMBDA = 6;

/** Estado de la luz del cuadro actual: lo leen el disco del sol y las nubes. */
export const daylightNow = { azimuth: 0, elevation: 0, day: 1, high: 1 };

const c = {
  sun: new Color(palette3D.sun),
  sunLow: new Color(palette3D.sunLow),
  skyTop: new Color(palette3D.skyTop),
  skyTopDusk: new Color(palette3D.skyTopDusk),
  skyTopNight: new Color(palette3D.skyTopNight),
  skyHorizon: new Color(palette3D.skyHorizon),
  skyHorizonDusk: new Color(palette3D.skyHorizonDusk),
  skyHorizonNight: new Color(palette3D.skyHorizonNight),
  skyFill: new Color(palette3D.skyFill),
  skyFillNight: new Color(palette3D.skyFillNight),
  ground: new Color(palette3D.ground),
  groundNight: new Color(palette3D.groundNight),
  cloud: new Color(palette3D.cloud),
  cloudNight: new Color(palette3D.cloudNight),
  skyline: new Color(palette3D.skyline),
};

/** Mezcla día/noche y, encima, el tono cálido del sol bajo. */
function skyTone(target: Color, day: Color, dusk: Color, night: Color, dayAmount: number, duskAmount: number) {
  return target.copy(night).lerp(day, dayAmount).lerp(dusk, duskAmount);
}

/**
 * Sol, luna y cielo según la hora del slider. Las luces van siempre montadas
 * (la cantidad de luces es parte del shader); solo cambian posición, color e
 * intensidad, sin recompilar materiales.
 */
export function Daylight() {
  const sun = useRef<DirectionalLight>(null);
  const moon = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const get = useThree((s) => s.get);
  const reducedMotion = usePrefersReducedMotion();
  const current = useRef<number | null>(null);

  useFrame((_, delta) => {
    const target = useUIStore.getState().hour;
    const previous = current.current;
    let hour = previous === null || reducedMotion ? target : MathUtils.damp(previous, target, LAMBDA, delta);
    if (Math.abs(hour - target) < 0.002) hour = target;
    if (hour === previous || !sun.current || !moon.current || !hemi.current) return;
    current.current = hour;

    const azimuth = sunAzimuth(hour);
    const elevation = sunElevation(hour);
    const day = daylightFactor(hour);
    const high = highSunFactor(hour);
    const dusk = day * (1 - high) * 0.85;
    Object.assign(daylightNow, { azimuth, elevation, day, high });

    sun.current.position.set(...skyPoint(azimuth, Math.max(elevation, MIN_LIGHT_ELEVATION), SUN_DISTANCE));
    sun.current.color.copy(c.sunLow).lerp(c.sun, high);
    sun.current.intensity = SUN_INTENSITY * day * (0.6 + 0.4 * high);
    moon.current.intensity = MOON_INTENSITY * (1 - day);

    hemi.current.color.copy(c.skyFillNight).lerp(c.skyFill, day);
    hemi.current.groundColor.copy(c.groundNight).lerp(c.ground, day);
    hemi.current.intensity = HEMI_INTENSITY * (0.4 + 0.6 * day) * (0.85 + 0.15 * high);

    const { top, horizon, skyline } = skyMaterial.uniforms;
    skyTone(top.value, c.skyTop, c.skyTopDusk, c.skyTopNight, day, dusk);
    skyTone(horizon.value, c.skyHorizon, c.skyHorizonDusk, c.skyHorizonNight, day, dusk);
    // Silueta de la ciudad: apenas más oscura que el horizonte.
    skyline.value.copy(horizon.value).lerp(c.skyline, 0.15 * day).multiplyScalar(0.94 - 0.1 * (1 - day));

    cloudMaterial.color.copy(c.cloudNight).lerp(c.cloud, day);
    cloudMaterial.emissive.copy(cloudMaterial.color);
    cloudMaterial.emissiveIntensity = 0.15 + 0.3 * day;

    // Luces de calle y ventanas de las casas al anochecer.
    const night = 1 - day;
    cityMaterials.lamp.emissiveIntensity = LAMP_INTENSITY * night;
    cityMaterials.windowLit.emissiveIntensity = WINDOW_INTENSITY * night;

    const { scene, gl } = get();
    if (scene.fog instanceof Fog) scene.fog.color.copy(horizon.value);
    // El mapa de sombras está congelado (StaticShadows): se pide uno nuevo.
    gl.shadowMap.needsUpdate = true;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[palette3D.skyFill, palette3D.ground, HEMI_INTENSITY]} />
      <directionalLight
        ref={sun}
        intensity={SUN_INTENSITY}
        color={palette3D.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />
      <directionalLight ref={moon} position={MOON_POSITION} intensity={0} color={palette3D.moon} />
    </>
  );
}
