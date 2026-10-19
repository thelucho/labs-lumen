import type { ReactNode } from "react";
import { floorPlans, type PlanRect, type PlanRoom, type Unit } from "@/data/building";
import { formatArea, formatNumber } from "@/lib/format";

/**
 * Plano tipo folleto de una unidad (SPEC §6.1), dibujado a partir de
 * `floorPlans`: muros, ventanas sobre las fachadas, muebles esquemáticos,
 * nombre, superficie y medidas de cada ambiente, cotas totales y norte.
 * Esquema ilustrativo: los ambientes suman la superficie cubierta de la unidad.
 */

const WET = new Set(["bath", "toilet", "kitchen", "pantry"]);
/** Ambientes con ventana si tocan una fachada. */
const WINDOWED = new Set(["living", "bedroom", "kitchen", "open", "meeting", "private", "reception", "pantry"]);

const meters = (n: number) => n.toFixed(2).replace(".", ",");
const rectArea = ([, , w, d]: PlanRect) => w * d;
const roomArea = (room: PlanRoom) => room.rects.reduce((n, r) => n + rectArea(r), 0);
const mainRect = (room: PlanRoom) => room.rects.reduce((a, b) => (rectArea(b) > rectArea(a) ? b : a));

/** Muebles esquemáticos según el tipo de ambiente, dentro de su rectángulo principal. */
function Furniture({ room, s }: { room: PlanRoom; s: number }): ReactNode {
  const [x, y, w, d] = mainRect(room);
  const cx = x + w / 2;
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 0.03 * s };
  const r = (rx: number, ry: number, rw: number, rh: number, key: string) => (
    <rect key={key} x={rx} y={ry} width={rw} height={rh} rx={0.05} {...line} />
  );

  switch (room.kind) {
    case "bedroom": {
      // Cama contra el muro del fondo, con mesas de luz.
      const double = w >= 3;
      const bw = room.name.includes("principal") ? 1.6 : double ? 1.4 : 0.9;
      const bh = 1.9;
      const by = y + d - bh - 0.1;
      return (
        <g>
          {r(cx - bw / 2, by, bw, bh, "cama")}
          {r(cx - bw / 2 + 0.1, by + bh - 0.5, bw - 0.2, 0.35, "almohada")}
          {double && r(cx - bw / 2 - 0.55, y + d - 0.6, 0.45, 0.45, "mesa1")}
          {double && r(cx + bw / 2 + 0.1, y + d - 0.6, 0.45, 0.45, "mesa2")}
        </g>
      );
    }
    case "living": {
      // Estar (sillón y mesa ratona) y comedor (mesa con sillas).
      const sx = x + 0.4;
      const sy = y + d - 1.3;
      const tx = x + w - 2.5;
      const ty = y + 0.9;
      return (
        <g>
          {r(sx, sy, 2.3, 0.9, "sillon")}
          {r(sx + 0.65, sy - 0.95, 1, 0.55, "ratona")}
          {r(tx, ty, 1.8, 0.95, "mesa")}
          {[0.15, 0.75, 1.35].flatMap((o) => [r(tx + o, ty - 0.5, 0.35, 0.35, `s${o}a`), r(tx + o, ty + 1.1, 0.35, 0.35, `s${o}b`)])}
        </g>
      );
    }
    case "kitchen":
    case "pantry": {
      // Mesada contra el muro y, si entra, isla o mesa.
      const island = w >= 3.4 && d >= 3;
      return (
        <g>
          {r(x + 0.05, y + 0.05, w - 0.1, 0.6, "mesada")}
          {island && r(cx - 0.8, y + 0.95, 1.6, 0.7, "isla")}
          {!island && room.kind === "pantry" && r(cx - 0.5, y + d - 1.3, 1, 0.8, "mesa")}
        </g>
      );
    }
    case "bath":
    case "toilet": {
      // Ducha (si es baño), inodoro y bacha; en los muy chicos, solo el rótulo.
      if (Math.min(w, d) < 1.8) return null;
      const items: ReactNode[] = [];
      if (room.kind === "bath" && w >= 1.6 && d >= 1.4) items.push(r(x + w - 0.95, y + d - 0.95, 0.85, 0.85, "ducha"));
      items.push(<ellipse key="inodoro" cx={x + 0.4} cy={y + d - 0.45} rx={0.2} ry={0.28} {...line} />);
      items.push(r(x + 0.1, y + 0.1, Math.min(0.9, w - 0.2), 0.45, "bacha"));
      return <g>{items}</g>;
    }
    case "open": {
      // Puestos de trabajo: dos filas con pasillo central (ahí va el rótulo) y una fila en cada sector extra.
      const items: ReactNode[] = [];
      const row = (rx: number, ry: number, rw: number, key: string) => {
        for (let col = rx + 0.8; col + 1.4 <= rx + rw - 0.6; col += 1.8) items.push(r(col, ry, 1.4, 0.7, `${key}-${col}`));
      };
      row(x, y + 0.8, w, "a");
      row(x, y + d - 1.5, w, "b");
      for (const [ox, oy, ow, od] of room.rects) {
        if (ox === x && oy === y) continue;
        row(ox, oy + od / 2 - 0.35, ow, `c${ox}`);
      }
      return <g>{items}</g>;
    }
    case "meeting": {
      // Mesa en la mitad de adelante: el rótulo va abajo.
      const tw = Math.min(3, w - 1.6);
      const ty = y + 0.75;
      return (
        <g>
          {r(cx - tw / 2, ty, tw, 1.2, "mesa")}
          {/* Sillas del lado de la ventana y en las cabeceras: abajo va el rótulo. */}
          {[0.2, 0.9, 1.6, 2.3].filter((o) => o + 0.4 <= tw).map((o) => r(cx - tw / 2 + o, ty - 0.55, 0.4, 0.4, `c${o}`))}
          {r(cx - tw / 2 - 0.55, ty + 0.4, 0.4, 0.4, "cab1")}
          {r(cx + tw / 2 + 0.15, ty + 0.4, 0.4, 0.4, "cab2")}
        </g>
      );
    }
    case "private":
      return (
        <g>
          {/* Escritorio contra la ventana, a un costado: el rótulo queda libre al centro. */}
          {r(x + 0.4, y + 0.5, 1.6, 0.8, "escritorio")}
          {r(x + 0.95, y + 1.45, 0.5, 0.5, "silla")}
        </g>
      );
    case "reception":
      return <g>{r(x + 0.8, y + d - 1.6, Math.min(3, w - 1.6), 0.7, "mostrador")}</g>;
    default:
      return null;
  }
}

/** Altura del rótulo dentro del ambiente, donde no hay muebles (márgenes en escala de texto `s`). */
function labelY(kind: PlanRoom["kind"], y: number, d: number, s: number): number {
  switch (kind) {
    case "bedroom":
    case "reception":
      return y + 0.85 * s; // cama contra el fondo, mostrador abajo
    case "kitchen":
    case "pantry":
    case "private":
    case "meeting":
      return y + d - 0.8 * s; // mesada, escritorio o mesa arriba
    case "living":
      return y + d * 0.4;
    default:
      return y + d / 2;
  }
}

export function FloorPlanBrochure({ unit }: { unit: Unit }) {
  const plan = floorPlans[unit.side];
  const { width, depth, facades } = plan;
  const balcony = plan.rooms.find((r) => r.kind === "balcony");
  const rooms = plan.rooms.filter((r) => r.kind !== "balcony");
  const extraEast = balcony ? Math.max(...balcony.rects.map(([x, , w]) => x + w)) - width : 0;
  // Escala de textos y trazos según el tamaño del plano.
  const s = Math.max(width, depth) / 12;
  const pad = { left: 1.4 * s, top: 1.6 * s, right: 1.2 * s + extraEast, bottom: 0.8 * s };
  const vb = `${-pad.left} ${-pad.top} ${width + pad.left + pad.right} ${depth + pad.top + pad.bottom}`;
  const wall = 0.2;
  const thin = 0.07;

  // Ventanas: tramos de fachada de los ambientes que la tocan.
  const windows: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (const room of rooms) {
    if (!WINDOWED.has(room.kind)) continue;
    for (const [x, y, w, d] of room.rects) {
      const inset = (n: number) => Math.min(0.5, n * 0.18);
      if (facades.north && y === 0) windows.push({ x1: x + inset(w), y1: 0, x2: x + w - inset(w), y2: 0, key: `${room.name}-n-${x}` });
      if (facades.south && y + d === depth) windows.push({ x1: x + inset(w), y1: depth, x2: x + w - inset(w), y2: depth, key: `${room.name}-s-${x}` });
      if (facades.west && x === 0) windows.push({ x1: 0, y1: y + inset(d), x2: 0, y2: y + d - inset(d), key: `${room.name}-w-${y}` });
      if (facades.east && Math.abs(x + w - width) < 1e-9) windows.push({ x1: width, y1: y + inset(d), x2: width, y2: y + d - inset(d), key: `${room.name}-e-${y}` });
    }
  }

  const label = (size: number) => ({ fontSize: size * s, textAnchor: "middle" as const });

  return (
    <figure>
      <svg
        viewBox={vb}
        className="w-full text-graphite"
        role="img"
        aria-label={`Plano ilustrativo de la unidad: ${rooms.map((r) => `${r.name} ${formatNumber(roomArea(r))} m²`).join(", ")}${
          balcony ? `, balcón ${formatNumber(roomArea(balcony))} m²` : ""
        }. Frente al norte.`}
      >
        <defs>
          <pattern id={`hatch-${unit.side}`} width={0.25} height={0.25} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={0.25} stroke="currentColor" strokeWidth={0.02} className="text-slate" />
          </pattern>
        </defs>

        {/* Balcón rayado */}
        {balcony?.rects.map(([x, y, w, d]) => (
          <rect key={`b-${x}`} x={x} y={y} width={w} height={d} fill={`url(#hatch-${unit.side})`} stroke="currentColor" strokeWidth={thin} />
        ))}

        {/* Ambientes: piso (húmedos en tono piedra), muebles y tabiques */}
        {rooms.map((room) => (
          <g key={room.name}>
            {room.rects.map(([x, y, w, d]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={w} height={d} className={WET.has(room.kind) ? "fill-stone/45" : "fill-paper"} />
            ))}
            <g className="text-slate">
              <Furniture room={room} s={s} />
            </g>
          </g>
        ))}
        {rooms.flatMap((room) =>
          room.rects.map(([x, y, w, d]) => (
            <rect key={`t-${room.name}-${x}-${y}`} x={x} y={y} width={w} height={d} fill="none" stroke="currentColor" strokeWidth={thin} />
          )),
        )}

        {/* Muros exteriores y ventanas (tramo claro con doble línea) */}
        <rect x={0} y={0} width={width} height={depth} fill="none" stroke="currentColor" strokeWidth={wall} />
        {windows.map((wdw) => (
          <g key={wdw.key}>
            <line x1={wdw.x1} y1={wdw.y1} x2={wdw.x2} y2={wdw.y2} className="stroke-paper" strokeWidth={wall * 0.9} />
            <line x1={wdw.x1} y1={wdw.y1} x2={wdw.x2} y2={wdw.y2} stroke="currentColor" strokeWidth={0.025} />
          </g>
        ))}

        {/* Nombre, superficie y medidas de cada ambiente */}
        {rooms.map((room) => {
          const [x, y, w, d] = mainRect(room);
          const small = Math.min(w, d) < 2.2;
          // En el living, del lado del estar (el comedor va arriba a la derecha).
          const cx = room.kind === "living" ? x + w * 0.33 : x + w / 2;
          // Rótulo donde no hay muebles: arriba en dormitorios (cama al fondo),
          // abajo en cocinas (mesada al frente), al centro en el resto.
          const cy = labelY(room.kind, y, d, s);
          if (small) {
            return (
              <g key={`l-${room.name}`}>
                <text x={cx} y={cy - 0.06 * s} {...label(0.17)} letterSpacing={0.02 * s} className="fill-slate">
                  {room.name.toUpperCase()}
                </text>
                <text x={cx} y={cy + 0.2 * s} {...label(0.22)} fontWeight={600} className="fill-graphite">
                  {formatNumber(roomArea(room))} m²
                </text>
              </g>
            );
          }
          return (
            <g key={`l-${room.name}`}>
              <text x={cx} y={cy - 0.28 * s} {...label(0.24)} letterSpacing={0.03 * s} className="fill-slate">
                {room.name.toUpperCase()}
              </text>
              <text x={cx} y={cy + 0.1 * s} {...label(0.34)} fontWeight={600} className="fill-graphite">
                {formatNumber(roomArea(room))} m²
              </text>
              {room.rects.length === 1 && (
                <text x={cx} y={cy + 0.42 * s} {...label(0.2)} className="fill-slate">
                  {meters(w)} × {meters(d)}
                </text>
              )}
            </g>
          );
        })}
        {balcony && (
          <text
            {...label(0.26)}
            transform={`translate(${width + extraEast / 2} ${depth / 2}) rotate(-90)`}
            className="fill-graphite"
            fontWeight={600}
          >
            BALCÓN · {formatNumber(roomArea(balcony))} m²
          </text>
        )}

        {/* Cotas totales */}
        <g className="text-slate" stroke="currentColor" strokeWidth={0.025}>
          <line x1={0} y1={-0.7 * s} x2={width} y2={-0.7 * s} />
          <line x1={0} y1={-0.9 * s} x2={0} y2={-0.5 * s} />
          <line x1={width} y1={-0.9 * s} x2={width} y2={-0.5 * s} />
          <line x1={-0.7 * s} y1={0} x2={-0.7 * s} y2={depth} />
          <line x1={-0.9 * s} y1={0} x2={-0.5 * s} y2={0} />
          <line x1={-0.9 * s} y1={depth} x2={-0.5 * s} y2={depth} />
        </g>
        <text x={width / 2} y={-0.85 * s} {...label(0.26)} className="fill-slate">
          {meters(width)} m
        </text>
        <text {...label(0.26)} transform={`translate(${-0.85 * s} ${depth / 2}) rotate(-90)`} className="fill-slate">
          {meters(depth)} m
        </text>

        {/* Norte y frente */}
        <g transform={`translate(${width + extraEast + 0.55 * s} ${-1.1 * s})`} className="text-graphite">
          <line x1={0} y1={0.9 * s} x2={0} y2={0} stroke="currentColor" strokeWidth={0.03 * s} />
          <path d={`M ${-0.18 * s} ${0.32 * s} L 0 0 L ${0.18 * s} ${0.32 * s}`} fill="none" stroke="currentColor" strokeWidth={0.03 * s} />
          <text y={1.25 * s} {...label(0.26)} className="fill-graphite">
            N
          </text>
        </g>
        <text x={width / 2} y={-1.3 * s} {...label(0.22)} letterSpacing={0.05 * s} className="fill-slate">
          FRENTE
        </text>
      </svg>

      {/* Planilla de superficies */}
      <dl className="mt-6 grid border-t border-stone text-sm sm:grid-cols-2 sm:gap-x-8">
        {rooms.map((room) => (
          <div key={room.name} className="flex items-baseline justify-between gap-4 border-b border-stone py-2">
            <dt className="text-slate">{room.name}</dt>
            <dd className="tabular-nums">{formatArea(Math.round(roomArea(room) * 10) / 10)}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm tabular-nums">
        <div className="flex gap-2">
          <dt className="text-slate">Cubierta</dt>
          <dd className="font-medium">{formatArea(unit.coveredArea)}</dd>
        </div>
        {unit.balconyArea > 0 && (
          <div className="flex gap-2">
            <dt className="text-slate">Balcón</dt>
            <dd className="font-medium">{formatArea(unit.balconyArea)}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-slate">Total</dt>
          <dd className="font-medium">{formatArea(unit.coveredArea + unit.balconyArea)}</dd>
        </div>
      </dl>
      <figcaption className="mt-3 text-[11px] text-slate">
        Plano ilustrativo de referencia, sin escala. Medidas aproximadas en metros, entre ejes de muros.
      </figcaption>
    </figure>
  );
}
