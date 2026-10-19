"use client";

import { project } from "@/data/building";
import { InstancedBoxes } from "./InstancedBoxes";
import { buildBuildingLayout, type MaterialKey } from "./layout";
import { materials } from "./materials";
import { Rooms } from "./Rooms";
import { StreetNumber } from "./StreetNumber";

/** El layout depende solo de los datos: se calcula una vez por carga. */
const layout = buildBuildingLayout();

const streetNumber = project.address.match(/\d+/)?.[0] ?? "";

const opaque: MaterialKey[] = ["concrete", "cladding", "frame", "deck"];

/** Volumen opaco: losas, columnas, carpinterías, revestimiento y deck. */
export function BuildingShell() {
  return (
    <group>
      {opaque.map((key) => (
        <InstancedBoxes key={key} boxes={layout.parts[key]} material={materials[key]} />
      ))}
    </group>
  );
}

/** Vidrios, agua, interiores interactivos y número de calle. */
export function BuildingDetail() {
  return (
    <group>
      <InstancedBoxes boxes={layout.parts.glass} material={materials.glass} castShadow={false} />
      <InstancedBoxes boxes={layout.parts.water} material={materials.water} castShadow={false} />

      <Rooms rooms={layout.rooms} />

      <StreetNumber
        text={streetNumber}
        position={layout.streetNumber.p}
        size={layout.streetNumber.size}
      />
    </group>
  );
}
