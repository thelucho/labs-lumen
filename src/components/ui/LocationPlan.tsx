import { location, project } from "@/data/building";

/**
 * Plano ilustrado y estático del entorno (SPEC §3.4): sin mapas ni servicios
 * externos. Norte arriba; el lote da al norte sobre Los Aromos.
 */
const W = 600;
const H = 360;
const STREET = 18;
const rows = [50, 180, 310]; // ejes de calles horizontales
const cols = [70, 220, 370, 520]; // ejes de calles verticales
const mainStreet = rows[1];

const blocks = rows.slice(0, -1).flatMap((y, r) =>
  cols.slice(0, -1).map((x, c) => ({
    key: `${r}-${c}`,
    x: x + STREET / 2,
    y: y + STREET / 2,
    w: cols[c + 1] - x - STREET,
    h: rows[r + 1] - y - STREET,
  })),
);

// Lote: cuadra al sur de Los Aromos, primera columna; la plaza queda a dos cuadras al este.
const lot = { x: 128, y: mainStreet + STREET / 2 + 2, w: 34, h: 26 };
// Plaza: dos cuadras al este, sobre la misma calle.
const plaza = blocks.find((b) => b.key === "1-2")!;

export function LocationPlan() {
  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-sm font-mono text-ink"
        role="img"
        aria-label={`Plano ilustrativo: el lote de ${project.address} frente a la calle ${location.street}, con la plaza a dos cuadras al este y la estación hacia el oeste.`}
      >
        {/* Fondo de calles */}
        <rect width={W} height={H} className="fill-stone-200" />
        {blocks.map((b) => (
          <rect key={b.key} x={b.x} y={b.y} width={b.w} height={b.h} className="fill-white" stroke="currentColor" strokeOpacity={0.15} strokeWidth={0.75} />
        ))}
        {/* Plaza */}
        <rect x={plaza.x + 8} y={plaza.y + 8} width={plaza.w - 16} height={plaza.h - 16} className="fill-stone-100 stroke-stone-400" strokeDasharray="3 3" strokeWidth={0.75} />
        <text x={plaza.x + plaza.w / 2} y={plaza.y + plaza.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={11} letterSpacing={1.5} className="fill-stone-600">
          PLAZA
        </text>
        {/* Arbolado sobre Los Aromos */}
        {Array.from({ length: 22 }, (_, i) => 20 + i * 27).map((x) => (
          <circle key={x} cx={x} cy={mainStreet - STREET / 2 - 4} r={2.5} className="fill-stone-400" />
        ))}
        {/* Lote */}
        <rect x={lot.x} y={lot.y} width={lot.w} height={lot.h} className="fill-accent" />
        <text x={lot.x + lot.w / 2} y={lot.y + lot.h + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-ink">
          {project.address.match(/\d+/)?.[0]}
        </text>
        {/* Nombre de la calle principal */}
        <text x={30} y={mainStreet + 4} fontSize={10} letterSpacing={2} className="fill-ink">
          {location.street.toUpperCase()}
        </text>
        {/* Hacia la estación */}
        <g className="fill-stone-600 stroke-stone-600">
          <line x1={150} y1={rows[2]} x2={20} y2={rows[2]} strokeWidth={1} />
          <path d={`M 26 ${rows[2] - 4} L 20 ${rows[2]} L 26 ${rows[2] + 4}`} fill="none" strokeWidth={1} />
          <text x={30} y={rows[2] - 6} fontSize={10} letterSpacing={1} stroke="none">
            ESTACIÓN · 6 CUADRAS
          </text>
        </g>
        {/* Norte */}
        <g transform={`translate(${W - 24} 22)`} className="stroke-ink">
          <line x1={0} y1={22} x2={0} y2={2} strokeWidth={1} />
          <path d="M -4 8 L 0 0 L 4 8" fill="none" strokeWidth={1} />
          <text y={36} textAnchor="middle" fontSize={10} stroke="none" className="fill-ink">
            N
          </text>
        </g>
      </svg>
      <figcaption className="label-tech mt-4 text-stone-600">Plano ilustrativo, sin escala.</figcaption>
    </figure>
  );
}
