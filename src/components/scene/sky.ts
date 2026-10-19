import { BackSide, Color, ShaderMaterial } from "three";
import { palette3D } from "./materials";

/**
 * Cielo con gradiente suave y, en el horizonte, la silueta de una ciudad
 * lejana (más alta hacia el sur, baja hacia el norte). Va en el mismo shader:
 * sin mallas ni programas extra. Único y compartido: Daylight le cambia los
 * colores según la hora.
 */
export const skyMaterial = new ShaderMaterial({
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    top: { value: new Color(palette3D.skyTop) },
    horizon: { value: new Color(palette3D.skyHorizon) },
    skyline: { value: new Color(palette3D.skyline) },
  },
  vertexShader: /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 top;
    uniform vec3 horizon;
    uniform vec3 skyline;
    varying vec3 vDir;

    float hash(float n) { return fract(sin(n) * 43758.5453); }

    void main() {
      float h = smoothstep(0.0, 0.5, max(vDir.y, 0.0));
      vec3 color = mix(horizon, top, h);

      // Silueta: bloques de ancho angular variable, más altos hacia el sur (-z).
      float angle = atan(vDir.x, vDir.z);
      float cell = floor(angle * 38.0);
      float south = max(0.0, -cos(angle));
      float height = 0.004 + hash(cell) * 0.012 + south * hash(cell + 7.0) * 0.022;
      float building = step(vDir.y, height) * step(0.18, hash(cell + 3.0));
      color = mix(color, skyline, building);

      gl_FragColor = vec4(color, 1.0);
      #include <colorspace_fragment>
    }
  `,
});
