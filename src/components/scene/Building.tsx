"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { project } from "@/data/building";
import { InstancedBoxes } from "./InstancedBoxes";
import { buildBuildingLayout, type MaterialKey } from "./layout";
import { materials } from "./materials";
import { riseFront, setRiseTop } from "./rise";
import { Rooms } from "./Rooms";
import { StreetNumber } from "./StreetNumber";

/** El layout depende solo de los datos: se calcula una vez por carga. */
const layout = buildBuildingLayout();

// La animación de construcción sube hasta la pieza más alta (núcleo, sala de máquinas).
setRiseTop(Math.max(...Object.values(layout.parts).flat().map((b) => b.p[1] + b.s[1] / 2)));

const streetNumber = project.address.match(/\d+/)?.[0] ?? "";

const opaque: MaterialKey[] = ["concrete", "cladding", "frame", "deck"];

/** Volumen opaco: losas, columnas, carpinterías, revestimiento y deck. */
export function BuildingShell() {
  return (
    <group>
      {opaque.map((key) => (
        <InstancedBoxes key={key} boxes={layout.parts[key]} material={materials[key]} rise />
      ))}
    </group>
  );
}

/** El número de calle aparece cuando la obra pasa la marquesina. */
function RisingStreetNumber() {
  const group = useRef<Group>(null);
  const [, y] = layout.streetNumber.p;
  useFrame(() => {
    if (group.current) group.current.visible = riseFront(performance.now()) > y;
  });
  return (
    <group ref={group} visible={false}>
      <StreetNumber text={streetNumber} position={layout.streetNumber.p} size={layout.streetNumber.size} />
    </group>
  );
}

/** Vidrios, agua, interiores interactivos y número de calle. */
export function BuildingDetail() {
  return (
    <group>
      <InstancedBoxes boxes={layout.parts.glass} material={materials.glass} castShadow={false} rise />
      <InstancedBoxes boxes={layout.parts.water} material={materials.water} castShadow={false} rise />

      <Rooms rooms={layout.rooms} />

      <RisingStreetNumber />
    </group>
  );
}
