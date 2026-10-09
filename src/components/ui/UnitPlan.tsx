import { DIVIDER_X, HALF_D, HALF_W, balconyGeometry, unitSpanX } from "@/components/scene/dimensions";
import { project, type Unit } from "@/data/building";

const PAD = 2.2;
const ARROW_SPACE = 3;
const street = project.address.replace(/\s*\d+$/, "").toUpperCase();

/** Planta → SVG: norte arriba, este a la derecha. */
const sx = (x: number) => x + HALF_W + PAD;
const sy = (z: number) => HALF_D - z + PAD + ARROW_SPACE;

/** Mini plano esquemático de la planta con la unidad resaltada (SPEC §6.1). */
export function UnitPlan({ unit }: { unit: Unit }) {
  const [x0, x1] = unitSpanX(unit.side);
  const balcony = unit.balconyArea > 0 ? balconyGeometry(unit) : null;
  const width = HALF_W * 2 + PAD * 2 + 2;
  const height = HALF_D * 2 + PAD * 2 + ARROW_SPACE;
  const typical = unit.side !== "full";

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full text-graphite"
        role="img"
        aria-label={`Planta del piso ${unit.floor}: ${
          unit.side === "full" ? "piso completo" : `unidad ${unit.side} resaltada`
        }, frente al norte${balcony ? ", balcón sobre el lateral este" : ""}`}
      >
        {/* Unidad resaltada */}
        <rect
          x={sx(x0)}
          y={sy(HALF_D)}
          width={x1 - x0}
          height={HALF_D * 2}
          className="fill-brass/20"
        />
        {/* Contorno de planta */}
        <rect
          x={sx(-HALF_W)}
          y={sy(HALF_D)}
          width={HALF_W * 2}
          height={HALF_D * 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.12}
        />
        {typical && (
          <line
            x1={sx(DIVIDER_X)}
            x2={sx(DIVIDER_X)}
            y1={sy(HALF_D)}
            y2={sy(-HALF_D)}
            stroke="currentColor"
            strokeWidth={0.12}
          />
        )}
        {balcony && (
          <rect
            x={sx(HALF_W)}
            y={sy(balcony.length / 2)}
            width={balcony.depth}
            height={balcony.length}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.08}
            strokeDasharray="0.35 0.25"
          />
        )}
        {typical &&
          (["B", "A"] as const).map((side) => {
            const [a, b] = unitSpanX(side);
            return (
              <text
                key={side}
                x={sx((a + b) / 2)}
                y={sy(0)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={1.8}
                className={side === unit.side ? "fill-graphite" : "fill-slate"}
              >
                {side}
              </text>
            );
          })}
        {/* Frente y norte */}
        <text
          x={sx(0)}
          y={sy(HALF_D) - 0.8}
          textAnchor="middle"
          fontSize={0.95}
          letterSpacing={0.18}
          className="fill-slate"
        >
          {`FRENTE · ${street}`}
        </text>
        <g transform={`translate(${width - 1.6} ${1.4})`}>
          <line x1={0} y1={2.2} x2={0} y2={0.2} stroke="currentColor" strokeWidth={0.1} />
          <path d="M -0.45 0.9 L 0 0 L 0.45 0.9" fill="none" stroke="currentColor" strokeWidth={0.1} />
          <text y={3.3} textAnchor="middle" fontSize={0.95} className="fill-graphite">
            N
          </text>
        </g>
      </svg>
      <figcaption className="mt-2 text-[11px] text-slate">
        Esquema ilustrativo, sin escala.{balcony ? " Línea punteada: balcón al este." : ""}
      </figcaption>
    </figure>
  );
}
