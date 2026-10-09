"use client";

import { project } from "@/data/building";
import { InstancedBoxes } from "./InstancedBoxes";
import { buildBuildingLayout, type MaterialKey } from "./layout";
import { interiorMaterial, materials, unitBox } from "./materials";
import { StreetNumber } from "./StreetNumber";

/** El layout depende solo de los datos: se calcula una vez por carga. */
const layout = buildBuildingLayout();

const streetNumber = project.address.match(/\d+/)?.[0] ?? "";

const opaque: MaterialKey[] = ["concrete", "cladding", "frame", "deck"];

export function Building() {
  return (
    <group>
      {opaque.map((key) => (
        <InstancedBoxes key={key} boxes={layout.parts[key]} material={materials[key]} />
      ))}
      <InstancedBoxes boxes={layout.parts.glass} material={materials.glass} castShadow={false} />
      <InstancedBoxes boxes={layout.parts.water} material={materials.water} castShadow={false} />

      {layout.rooms.map((room) => (
        <mesh
          key={room.id}
          geometry={unitBox}
          material={interiorMaterial}
          position={room.box.p}
          scale={room.box.s}
          userData={{ selectableId: room.id }}
        />
      ))}

      <StreetNumber
        text={streetNumber}
        position={layout.streetNumber.p}
        size={layout.streetNumber.size}
      />
    </group>
  );
}
