import { LED_RING, SPACE } from "./stageConfig";

export const LED_VERT = /* glsl */ `
varying vec2 vUv;
varying float vFront;

void main() {
  vUv = uv;
  vec3 worldCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 toPanel = worldCenter - cameraPosition;
  float tLen = max(length(toPanel), 0.0001);
  vec3 toOrigin = -cameraPosition;
  float cLen = max(length(toOrigin), 0.0001);
  float along = dot(toPanel / tLen, toOrigin / cLen);
  float align = smoothstep(${LED_RING.frontAlignStart.toFixed(2)}, ${LED_RING.frontAlignEnd.toFixed(2)}, along);
  float perp = length(cross(toPanel, toOrigin)) / cLen;
  float onAxis = 1.0 - smoothstep(0.0, ${LED_RING.frontAxisRadius.toFixed(2)}, perp);
  vFront = align * onAxis;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const LED_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
varying float vFront;

void main() {
  float scan = 0.06 * sin(vUv.y * 72.0 + uTime * 6.0);
  float colLine = step(0.94, fract(vUv.x * 18.0));
  float rowLine = step(0.95, fract(vUv.y * 28.0 + uTime * 0.15));
  float pulse = 0.45 + 0.35 * sin(uTime * 1.4 + vUv.x * 3.0);
  vec3 color = mix(uColorA, uColorB, vUv.y);
  color += scan * color;
  color += (colLine + rowLine) * 0.18 * color;
  color *= 0.4 + 0.4 * pulse;
  float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x)
    * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
  float alpha = ${LED_RING.fillAlpha.toFixed(3)} * edge + ${LED_RING.rimAlpha.toFixed(3)};
  alpha *= mix(1.0, ${LED_RING.frontAlpha.toFixed(3)}, vFront);
  gl_FragColor = vec4(color, alpha);
}
`;

export const FLOOR_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const FLOOR_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float swirl = angle + uTime * 0.18 + 0.55 / max(r, 0.06);
  float arm = 0.5 + 0.5 * sin(swirl * 3.2 - r * 7.0);
  float horizon = smoothstep(${(SPACE.horizon * 2).toFixed(3)}, ${SPACE.horizon.toFixed(3)}, r);
  float disc = smoothstep(1.18, ${(SPACE.horizon * 1.6).toFixed(3)}, r) * (1.0 - horizon);
  float photon = smoothstep(${(SPACE.horizon * 2.4).toFixed(3)}, ${(SPACE.horizon * 2).toFixed(3)}, r)
    * smoothstep(${(SPACE.horizon * 1.4).toFixed(3)}, ${(SPACE.horizon * 2).toFixed(3)}, r);
  vec3 nebula = mix(vec3(0.12, 0.04, 0.28), uColor, arm);
  vec3 hot = vec3(1.0, 0.52, 0.22);
  vec3 color = mix(nebula, hot, photon * 1.35);
  color *= disc * (0.35 + 0.65 * arm);
  color *= 1.0 - horizon;
  float alpha = disc * 0.88 + photon * 0.95;
  gl_FragColor = vec4(color, alpha);
}
`;
