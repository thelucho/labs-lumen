"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NeutralToneMapping, type Group } from "three";
import { revealHero, setLoadProgress } from "@/lib/intro";
import { useUIStore } from "@/lib/store";
import { BuildingDetail, BuildingShell } from "./Building";
import { FOV, cameraPosition, readAzimuth } from "./camera";
import { Controls } from "./Controls";
import { GroundShadows, Neighborhood, SceneBackdrop, SceneLights, SkyDecor } from "./Environment";
import { getShadowVersion } from "./shadowCache";
import { Vegetation } from "./Vegetation";

/** Cuadros iniciales en los que se recalcula el mapa de sombras. */
const SHADOW_WARMUP_FRAMES = 4;

/**
 * El edificio no se mueve y las nubes no proyectan sombra: el mapa de sombras
 * se calcula en los primeros cuadros y después se congela.
 */
function StaticShadows() {
  const get = useThree((s) => s.get);
  const frames = useRef(0);
  const seenVersion = useRef(getShadowVersion());
  useFrame(() => {
    // Algo que proyecta sombra cambió: recalentar el mapa de sombras.
    const version = getShadowVersion();
    if (version !== seenVersion.current) {
      seenVersion.current = version;
      frames.current = 0;
    }
    if (frames.current > SHADOW_WARMUP_FRAMES) return;
    frames.current += 1;
    const { shadowMap } = get().gl;
    shadowMap.autoUpdate = frames.current <= SHADOW_WARMUP_FRAMES;
    shadowMap.needsUpdate = true;
  });
  return null;
}

/**
 * Monta su contenido invisible, compila los shaders con compileAsync
 * (KHR_parallel_shader_compile: sin bloquear el hilo principal) y recién
 * entonces lo muestra y avisa.
 */
function Precompiled({ children, onReady }: { children: ReactNode; onReady: () => void }) {
  const group = useRef<Group>(null);
  const get = useThree((s) => s.get);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = group.current;
    if (!target) return;
    let cancelled = false;
    const { gl, camera, scene } = get();
    gl.compileAsync(target, camera, scene)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        setReady(true);
        onReady();
      });
    return () => {
      cancelled = true;
    };
  }, [get, onReady]);

  return (
    <group ref={group} visible={ready}>
      {children}
    </group>
  );
}

/**
 * Montaje por etapas (SPEC §7: Lighthouse ≥ 90). Cada etapa se precompila
 * aparte y la siguiente arranca cuando la anterior está lista, en lugar de
 * compilar todo en una sola tarea larga en el primer cuadro.
 */
const STAGES = [SceneBackdrop, BuildingShell, BuildingDetail, Neighborhood, Vegetation, SkyDecor];

/** Cuadros que se esperan con todo montado antes de revelar: sombras ya calculadas. */
const REVEAL_AFTER_FRAMES = SHADOW_WARMUP_FRAMES + 2;

/** Con la escena completa (y sus sombras) en pantalla, saca el loader y la muestra con un fundido. */
function RevealWhenReady() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > REVEAL_AFTER_FRAMES) return;
    frames.current += 1;
    if (frames.current > REVEAL_AFTER_FRAMES) revealHero();
  });
  return null;
}

function Stages() {
  const [ready, setReady] = useState(0);
  const [advance] = useState(() => () => setReady((n) => n + 1));
  const loaded = ready >= STAGES.length;

  // El loader muestra el avance real: etapas compiladas sobre el total.
  useEffect(() => {
    setLoadProgress(ready / (STAGES.length + 1));
  }, [ready]);

  return (
    <>
      {STAGES.slice(0, ready + 1).map((Stage, i) => (
        <Precompiled key={i} onReady={advance}>
          <Stage />
        </Precompiled>
      ))}
      {/* Último: sombras que se calculan una vez y necesitan el edificio completo. */}
      {loaded && (
        <>
          <GroundShadows />
          <StaticShadows />
          <RevealWhenReady />
        </>
      )}
    </>
  );
}

export default function SceneCanvas({ active = true }: { active?: boolean }) {
  const [position] = useState(() => cameraPosition(readAzimuth()));
  const closeDetail = useUIStore((s) => s.closeDetail);

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      shadows="soft"
      camera={{ fov: FOV, near: 1, far: 1500, position }}
      gl={{ antialias: true, toneMapping: NeutralToneMapping }}
      onPointerMissed={closeDetail}
      onCreated={({ gl }) => {
        // Solo en desarrollo: el renderer a mano para medir programas y llamadas de dibujo.
        if (process.env.NODE_ENV !== "production") (window as unknown as { __lumenGl?: typeof gl }).__lumenGl = gl;
      }}
    >
      <SceneLights />
      <Stages />
      <Controls />
    </Canvas>
  );
}
