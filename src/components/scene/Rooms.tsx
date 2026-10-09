"use client";

import { Html, useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, MathUtils, Vector3, type Mesh, type MeshStandardMaterial, type PointLight } from "three";
import type { SelectableId } from "@/data/building";
import { getUnit } from "@/lib/building";
import { selectableLabel } from "@/lib/format";
import { selectLitId, useUIStore } from "@/lib/store";
import type { Room } from "./layout";
import { interiorMaterial, palette3D, unitBox } from "./materials";

/** Más de esto (px) entre pointerdown y pointerup es un drag, no un click. */
const CLICK_THRESHOLD = 6;
/** Amortiguación de encendido/apagado: ~150 ms hasta el 95 %. */
const FADE = 20;
const EMISSIVE = 1;
const LIGHT = { intensity: 90, distance: 10, decay: 2 };
/**
 * Al encenderse, el color base del interior se oscurece para que domine el
 * emisivo cálido; si no, el tone mapping lo lava hacia el blanco.
 */
const BASE = new Color(palette3D.interior);
const BASE_LIT = new Color(palette3D.interiorLit);
/** Las vendidas se encienden más tenues. */
const SOLD_FACTOR = 0.35;

const isSold = (id: SelectableId) => getUnit(id)?.status === "sold";

interface Props {
  rooms: Room[];
}

/**
 * Interiores de unidades, PB y SUM: son el blanco del puntero y lo que se
 * enciende. Una sola luz puntual se mueve a la unidad activa.
 */
export function Rooms({ rooms }: Props) {
  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const materials = useMemo(
    () =>
      new Map(
        rooms.map((room) => {
          const material = interiorMaterial.clone() as MeshStandardMaterial;
          material.emissive.set(isSold(room.id) ? palette3D.soldLight : palette3D.unitLight);
          material.emissiveIntensity = 0;
          return [room.id, material];
        }),
      ),
    [rooms],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  const meshes = useRef(new Map<SelectableId, Mesh>());
  const light = useRef<PointLight>(null);
  const lightTarget = useMemo(() => new Vector3(), []);
  const pointerOverId = useRef<SelectableId | null>(null);
  const [pointerOver, setPointerOver] = useState(false);
  useCursor(pointerOver);

  const hoveredId = useUIStore((s) => s.hoveredId);
  const setHovered = useUIStore((s) => s.setHovered);
  const select = useUIStore((s) => s.select);

  useFrame((_, delta) => {
    const litId = selectLitId(useUIStore.getState());
    for (const [id, mesh] of meshes.current) {
      const material = mesh.material as MeshStandardMaterial;
      const level = MathUtils.damp(mesh.userData.lit ?? 0, id === litId ? 1 : 0, FADE, delta);
      mesh.userData.lit = level;
      const strength = level * (isSold(id) ? SOLD_FACTOR : 1);
      material.emissiveIntensity = strength * EMISSIVE;
      material.color.lerpColors(BASE, BASE_LIT, strength);
    }

    const l = light.current;
    if (!l) return;
    const room = litId ? roomById.get(litId) : undefined;
    if (room && litId) {
      lightTarget.set(...room.box.p);
      // Si estaba apagada aparece directamente en la unidad; si no, se desliza.
      if (l.intensity < 0.5) l.position.copy(lightTarget);
      else l.position.lerp(lightTarget, 1 - Math.exp(-FADE * delta));
      l.color.set(isSold(litId) ? palette3D.soldLight : palette3D.unitLight);
    }
    const goal = room && litId ? LIGHT.intensity * (isSold(litId) ? SOLD_FACTOR : 1) : 0;
    l.intensity = MathUtils.damp(l.intensity, goal, FADE, delta);
  });

  function handleOver(e: ThreeEvent<PointerEvent>, id: SelectableId) {
    e.stopPropagation();
    // En touch no hay hover: el tap selecciona directamente.
    if (e.pointerType !== "mouse") return;
    pointerOverId.current = id;
    setPointerOver(true);
    setHovered(id);
  }

  function handleOut(e: ThreeEvent<PointerEvent>, id: SelectableId) {
    if (pointerOverId.current !== id) return;
    pointerOverId.current = null;
    setPointerOver(false);
    if (useUIStore.getState().hoveredId === id) setHovered(null);
  }

  function handleClick(e: ThreeEvent<MouseEvent>, id: SelectableId) {
    e.stopPropagation();
    if (e.delta > CLICK_THRESHOLD) return;
    select(id);
  }

  const tooltipRoom = hoveredId ? roomById.get(hoveredId) : undefined;

  return (
    <group>
      {rooms.map((room) => (
        <mesh
          key={room.id}
          ref={(mesh) => {
            if (mesh) meshes.current.set(room.id, mesh);
            else meshes.current.delete(room.id);
          }}
          geometry={unitBox}
          material={materials.get(room.id)}
          position={room.box.p}
          scale={room.box.s}
          userData={{ selectableId: room.id }}
          onPointerOver={(e) => handleOver(e, room.id)}
          onPointerOut={(e) => handleOut(e, room.id)}
          onClick={(e) => handleClick(e, room.id)}
        />
      ))}

      <pointLight
        ref={light}
        intensity={0}
        distance={LIGHT.distance}
        decay={LIGHT.decay}
        color={palette3D.unitLight}
      />

      {tooltipRoom && hoveredId && (
        <Html
          position={[tooltipRoom.box.p[0], tooltipRoom.box.p[1], tooltipRoom.box.p[2]]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-xs bg-graphite px-2 py-1 text-xs font-medium tracking-wide text-paper tabular-nums">
            {selectableLabel(hoveredId)}
          </div>
        </Html>
      )}
    </group>
  );
}
