export const SPHERE_WEBGL_SHADER = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec4 uParams[3];
out vec4 fragColor;
vec4 sampleFace(vec3 normal, mat3 inverseRotation) {
  vec3 local = inverseRotation * normal;
  // Longitude wraps at the seam; latitude spans the complete image height.
  vec2 uv = vec2(fract(atan(local.x, local.z) / 6.28318530718 + 0.5), asin(clamp(local.y, -1.0, 1.0)) / 3.14159265359 + 0.5);
  vec4 color = textureLod(uSource, vec2(uv.x, 1.0 - uv.y), 0.0);
  float shade = mix(1.0, abs(normal.z), uParams[1].z);
  return vec4(color.rgb * shade, color.a);
}

vec4 project(vec2 position) {
  vec2 p = (position - uParams[0].zw) / uParams[1].x;
  float distanceSquared = dot(p, p);
  float coverage = 1.0 - smoothstep(1.0 - fwidth(distanceSquared), 1.0, distanceSquared);
  if (distanceSquared >= 1.0) { return vec4(0); }
  float z = sqrt(1.0 - distanceSquared);
  vec3 s = sin(uParams[2].xyz);
  vec3 c = cos(uParams[2].xyz);
  mat3 rx = mat3(vec3(1, 0, 0), vec3(0, c.x, s.x), vec3(0, -s.x, c.x));
  mat3 ry = mat3(vec3(c.y, 0, -s.y), vec3(0, 1, 0), vec3(s.y, 0, c.y));
  mat3 rz = mat3(vec3(c.z, s.z, 0), vec3(-s.z, c.z, 0), vec3(0, 0, 1));
  mat3 inverseRotation = transpose(rz * ry * rx);
  vec4 front = sampleFace(vec3(p, z), inverseRotation);
  vec4 back = sampleFace(vec3(p, -z), inverseRotation);
  if (uParams[1].w == 1.0) { return front * coverage; }
  if (uParams[1].w == 2.0) { return back * coverage; }
  return (front + back * (1.0 - front.a)) * coverage;
}

void main() { fragColor = project(vec2(gl_FragCoord.x, uParams[0].y - gl_FragCoord.y)); }
`;
