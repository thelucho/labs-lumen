import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type MeshStandardMaterial } from "three";
import { random } from "./random";

/**
 * Texturas procedurales (canvas, sin archivos externos) para darle materia a
 * la maqueta: hormigón, madera, asfalto, baldosas, revoque y pasto. Son
 * claras y de bajo contraste: multiplican el color de cada material, que sigue
 * saliendo de la paleta 3D.
 */

type Ctx = CanvasRenderingContext2D;

function makeTexture(size: number, seed: number, draw: (ctx: Ctx, size: number, rand: () => number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  // En memoria (CPU): el grano lee y escribe píxeles; con canvas acelerado cada lectura baja de la GPU.
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx) draw(ctx, size, random(seed));
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Fondo gris claro uniforme (la textura multiplica: 255 = color pleno). */
function fill(ctx: Ctx, size: number, value: number) {
  ctx.fillStyle = `rgb(${value},${value},${value})`;
  ctx.fillRect(0, 0, size, size);
}

/** Manchas suaves de baja frecuencia (repetibles: se dibujan también desplazadas). */
function blotches(ctx: Ctx, size: number, rand: () => number, count: number, radius: [number, number], alpha: number) {
  for (let i = 0; i < count; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = radius[0] + rand() * (radius[1] - radius[0]);
    const light = rand() < 0.5;
    const color = light ? "255,255,255" : "0,0,0";
    // Solo las copias que asoman dentro del lienzo (las que cruzan un borde).
    const shifts = (c: number) => [-size, 0, size].filter((d) => c + d + r > 0 && c + d - r < size);
    for (const dx of shifts(x)) {
      for (const dy of shifts(y)) {
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        g.addColorStop(0, `rgba(${color},${alpha * rand()})`);
        g.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }
}

/** Grano fino píxel a píxel. */
function grain(ctx: Ctx, size: number, rand: () => number, amount: number) {
  const image = ctx.getImageData(0, 0, size, size);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
}

/** Línea fina quebrada (fisuras del asfalto). */
function crack(ctx: Ctx, size: number, rand: () => number) {
  let x = rand() * size;
  let y = rand() * size;
  let angle = rand() * Math.PI * 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const steps = 8 + Math.floor(rand() * 14);
  for (let i = 0; i < steps; i++) {
    angle += (rand() - 0.5) * 1.1;
    x += Math.cos(angle) * size * 0.025;
    y += Math.sin(angle) * size * 0.025;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

let cache: ReturnType<typeof createTextures> | null = null;

function createTextures() {
  return {
    /** Hormigón visto: manchas, grano y juntas de encofrado (1 repetición = 3 m). */
    concrete: makeTexture(256, 11, (ctx, s, rand) => {
      fill(ctx, s, 236);
      blotches(ctx, s, rand, 40, [s * 0.05, s * 0.2], 0.06);
      grain(ctx, s, rand, 14);
      ctx.strokeStyle = "rgba(0,0,0,0.07)";
      ctx.lineWidth = 1;
      for (const y of [0, s / 2]) ctx.strokeRect(-1, y, s + 2, s / 2);
      ctx.strokeRect(s / 2, -1, 0, s + 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (const x of [s * 0.12, s * 0.37, s * 0.62, s * 0.87]) {
        for (const y of [s * 0.12, s * 0.37, s * 0.62, s * 0.87]) ctx.fillRect(x, y, 2, 2);
      }
    }),
    /** Revestimiento símil madera: tablas verticales con veta (1 repetición = 1,6 m). */
    wood: makeTexture(256, 23, (ctx, s, rand) => {
      fill(ctx, s, 228);
      const planks = 8;
      const w = s / planks;
      for (let i = 0; i < planks; i++) {
        const tone = 200 + rand() * 50;
        ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
        ctx.fillRect(i * w, 0, w, s);
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        for (let k = 0; k < 6; k++) {
          const x = i * w + rand() * w;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.bezierCurveTo(x + (rand() - 0.5) * 6, s / 3, x + (rand() - 0.5) * 6, (2 * s) / 3, x, s);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.fillRect(i * w, 0, 1.2, s);
      }
      grain(ctx, s, rand, 10);
    }),
    /** Asfalto: árido, parches de bacheo, fisuras y manchas (1 repetición = 7 m). */
    asphalt: makeTexture(512, 37, (ctx, s, rand) => {
      fill(ctx, s, 214);
      blotches(ctx, s, rand, 50, [s * 0.04, s * 0.18], 0.1);
      // Parches de bacheo: rectángulos algo más oscuros con borde sellado.
      for (let i = 0; i < 3; i++) {
        const w = s * (0.08 + rand() * 0.14);
        const h = s * (0.06 + rand() * 0.1);
        const x = rand() * (s - w);
        const y = rand() * (s - h);
        ctx.fillStyle = "rgba(0,0,0,0.09)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) crack(ctx, s, rand);
      grain(ctx, s, rand, 46);
      // Árido claro suelto.
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 1800; i++) ctx.fillRect(rand() * s, rand() * s, 1, 1);
    }),
    /** Vereda de baldosas de 40 × 40 cm (1 repetición = 2 m: 5 × 5 baldosas). */
    tiles: makeTexture(256, 41, (ctx, s, rand) => {
      fill(ctx, s, 240);
      const n = 5;
      const t = s / n;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const tone = 228 + rand() * 24;
          ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
          ctx.fillRect(i * t, j * t, t, t);
          // Vainillas: la grilla de 9 panes de la baldosa porteña.
          ctx.fillStyle = "rgba(0,0,0,0.05)";
          for (const a of [1, 2]) {
            ctx.fillRect(i * t + (a * t) / 3, j * t + 3, 1.5, t - 6);
            ctx.fillRect(i * t + 3, j * t + (a * t) / 3, t - 6, 1.5);
          }
        }
      }
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(i * t, 0);
        ctx.lineTo(i * t, s);
        ctx.moveTo(0, i * t);
        ctx.lineTo(s, i * t);
        ctx.stroke();
      }
      blotches(ctx, s, rand, 14, [s * 0.05, s * 0.15], 0.06);
      grain(ctx, s, rand, 12);
    }),
    /** Revoque de las casas: manchas suaves y grano (1 repetición = 3 m). */
    plaster: makeTexture(256, 53, (ctx, s, rand) => {
      fill(ctx, s, 240);
      blotches(ctx, s, rand, 30, [s * 0.06, s * 0.25], 0.07);
      grain(ctx, s, rand, 16);
    }),
    /** Pasto seco de maqueta: manchas de verde desparejo (1 repetición = 9 m). */
    grass: makeTexture(256, 67, (ctx, s, rand) => {
      fill(ctx, s, 230);
      blotches(ctx, s, rand, 60, [s * 0.04, s * 0.16], 0.16);
      grain(ctx, s, rand, 30);
    }),
  };
}

export type TextureKey = keyof ReturnType<typeof createTextures>;

/** Texturas compartidas, creadas una sola vez (necesitan `document`). */
export function textures() {
  cache ??= createTextures();
  return cache;
}

/**
 * Proyección triplanar en coordenadas de mundo: la textura no depende de las
 * UV ni de la escala de cada caja instanciada, y queda continua entre piezas
 * (calles, veredas, losas). `metersPerRepeat` = tamaño real de una repetición.
 */
export function worldMapped<T extends MeshStandardMaterial>(material: T, key: TextureKey, metersPerRepeat: number): T {
  material.map = textures()[key];
  material.onBeforeCompile = (shader) => {
    shader.uniforms.worldScale = { value: 1 / metersPerRepeat };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;")
      .replace(
        "#include <worldpos_vertex>",
        /* glsl */ `#include <worldpos_vertex>
        vec4 lumenWorld = vec4( transformed, 1.0 );
        vec3 lumenNormal = objectNormal;
        #ifdef USE_INSTANCING
          lumenWorld = instanceMatrix * lumenWorld;
          lumenNormal = mat3( instanceMatrix ) * lumenNormal;
        #endif
        lumenWorld = modelMatrix * lumenWorld;
        vWorldPos = lumenWorld.xyz;
        vWorldNormal = normalize( mat3( modelMatrix ) * lumenNormal );`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float worldScale;\nvarying vec3 vWorldPos;\nvarying vec3 vWorldNormal;",
      )
      .replace(
        "#include <map_fragment>",
        /* glsl */ `
        vec3 lumenBlend = pow( abs( normalize( vWorldNormal ) ), vec3( 4.0 ) );
        lumenBlend /= lumenBlend.x + lumenBlend.y + lumenBlend.z;
        vec3 lumenP = vWorldPos * worldScale;
        vec4 lumenTexel = texture2D( map, lumenP.zy ) * lumenBlend.x
          + texture2D( map, lumenP.xz ) * lumenBlend.y
          + texture2D( map, lumenP.xy ) * lumenBlend.z;
        diffuseColor *= lumenTexel;`,
      );
  };
  material.customProgramCacheKey = () => "lumen-world-mapped";
  return material;
}
