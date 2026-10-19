import { BackSide, Color, ShaderMaterial } from "three";
import { palette3D } from "./materials";

/** Cielo con gradiente suave. Único y compartido: Daylight le cambia los colores según la hora. */
export const skyMaterial = new ShaderMaterial({
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    top: { value: new Color(palette3D.skyTop) },
    horizon: { value: new Color(palette3D.skyHorizon) },
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
    varying vec3 vDir;
    void main() {
      float h = smoothstep(0.0, 0.5, max(vDir.y, 0.0));
      gl_FragColor = vec4(mix(horizon, top, h), 1.0);
      #include <colorspace_fragment>
    }
  `,
});
