export const CYLINDER_WEBGL_SHADER = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec4 uParams[3];
out vec4 fragColor;
vec4 sampleFace(vec3 point, mat3 inverseRotation, mat3 rotation) {
  vec3 local = inverseRotation * point;
  vec2 uv = vec2(fract((atan(local.x, local.z) + uParams[1].y) / 6.28318530718 + 0.5), local.y / uParams[0].xy.y + 0.5);
  vec4 color = textureLod(uSource, vec2(uv.x, 1.0 - uv.y), 0.0);
  if (uv.y < 0.0 || uv.y > 1.0) { return vec4(0); }
  vec3 normal = rotation * vec3(local.x / uParams[1].x, 0, local.z / uParams[1].x);
  float shade = mix(1.0, abs(normal.z), uParams[1].z);
  return vec4(color.rgb * shade, color.a);
}

vec4 project(vec2 position) {
  vec3 s = sin(uParams[2].xyz);
  vec3 c = cos(uParams[2].xyz);
  mat3 rx = mat3(vec3(1, 0, 0), vec3(0, c.x, s.x), vec3(0, -s.x, c.x));
  mat3 ry = mat3(vec3(c.y, 0, -s.y), vec3(0, 1, 0), vec3(s.y, 0, c.y));
  mat3 rz = mat3(vec3(c.z, s.z, 0), vec3(-s.z, c.z, 0), vec3(0, 0, 1));
  mat3 rotation = rz * ry * rx;
  vec3 axis = rotation[1];
  vec2 p = position - uParams[0].zw;
  // Orthographic viewing ray intersecting the rotated, open cylinder wall.
  float a = 1.0 - axis.z * axis.z;
  float da = dot(p, axis.xy);
  float b = -da * axis.z;
  float discriminant = b * b - a * (dot(p, p) - da * da - uParams[1].x * uParams[1].x);
  if (a < 0.000001 || discriminant <= 0.0) { return vec4(0); }
  float root = sqrt(discriminant);
  mat3 inverseRotation = transpose(rotation);
  vec4 front = sampleFace(vec3(p, (-b + root) / a), inverseRotation, rotation);
  vec4 back = sampleFace(vec3(p, (-b - root) / a), inverseRotation, rotation);
  if (uParams[1].w == 1.0) { return front; }
  if (uParams[1].w == 2.0) { return back; }
  // Both the texture and output use premultiplied alpha.
  return front + back * (1.0 - front.a);
}

void main() { fragColor = project(vec2(gl_FragCoord.x, uParams[0].y - gl_FragCoord.y)); }
`;
