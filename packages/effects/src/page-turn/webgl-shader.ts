// Keep the inverse mapping and shading in sync with shader.ts.
export const PAGE_TURN_WEBGL_SHADER = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec4 uParams[4];
out vec4 fragColor;

vec4 samplePage(vec2 pixel) {
  vec2 resolution = uParams[0].xy;
  if (any(lessThan(pixel, vec2(0))) || any(greaterThanEqual(pixel, resolution))) { return vec4(0); }
  // The shared projection sampler wraps horizontally; pages must not wrap at the edges.
  vec2 uv = clamp(pixel, vec2(0.5), resolution - vec2(0.5)) / resolution;
  return textureLod(uSource, vec2(uv.x, 1.0 - uv.y), 0.0);
}

vec4 project(vec2 position) {
  float radius = uParams[1].x;
  float direction = uParams[1].y;
  vec2 normal = vec2(-sin(direction), cos(direction));
  float distance = dot(position - uParams[0].zw, normal);
  float coverage = 1.0 - smoothstep(radius - max(fwidth(distance), 0.001), radius, distance);
  if (distance >= radius) { return vec4(0); }

  vec4 front = vec4(0);
  vec4 back = vec4(0);
  float backDistance = 3.14159265359 * radius - distance;
  float backShade = 0.9;
  if (distance <= 0.0) {
    front = samplePage(position);
  } else {
    float angle = asin(clamp(distance / radius, 0.0, 1.0));
    float frontDistance = radius * angle;
    backDistance = 3.14159265359 * radius - frontDistance;
    float light = uParams[1].z;
    float lightDot = normal.x * sin(light) - normal.y * cos(light);
    float shade = 1.0 - 0.4 * (angle / 1.57079632679) * (0.5 + 0.5 * lightDot);
    vec4 color = samplePage(position + normal * (frontDistance - distance));
    front = vec4(color.rgb * shade, color.a);
    backShade = 0.6 + 0.4 * cos(angle);
  }
  vec4 color = samplePage(position + normal * (backDistance - distance));
  float tint = (1.0 - uParams[3].x) * uParams[2].a;
  back = vec4(mix(color.rgb, uParams[2].rgb * color.a, tint) * backShade, color.a);
  if (uParams[1].w == 1.0) { return front * coverage; }
  if (uParams[1].w == 2.0) { return back * coverage; }
  // Premultiplied source-over: the curled back covers the front, which shows through its alpha.
  return (back + front * (1.0 - back.a)) * coverage;
}

void main() { fragColor = project(vec2(gl_FragCoord.x, uParams[0].y - gl_FragCoord.y)); }
`;
