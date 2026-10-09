import { levels, project } from "@/data/building";
import { buildingHeight, levelElevation } from "@/lib/building";

/** Silueta estática del edificio mientras carga el canvas, generada desde los datos. */
export function ScenePlaceholder() {
  const width = project.footprint.width;
  const height = buildingHeight();
  const pad = 2;

  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <svg
        viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
        className="h-[62%] max-w-[80%] text-stone"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.12}
      >
        {levels.map((level) => {
          const inset = level.kind === "roof" ? width * 0.25 : 0;
          const y = height - levelElevation(level.index) - level.height;
          return (
            <rect
              key={level.id}
              x={inset}
              y={y}
              width={width - inset * 2}
              height={level.height}
            />
          );
        })}
      </svg>
    </div>
  );
}
