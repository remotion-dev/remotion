// Cylindrical inverse mapping, following Effectcraft's CC Page Turn geometry:
// https://github.com/storytold/effectcraft/blob/8f02f52a44a4b1ea807d8824b92301b96f896a06/crates/effects/src/distort2.rs#L627
export const PAGE_TURN_SHADER = /* wgsl */ `
struct Params {
  resolution: vec2f,
  foldPosition: vec2f,
  geometry: vec4f,
  paperColor: vec4f,
  back: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let positions = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  return vec4f(positions[index], 0, 1);
}

fn samplePage(pixel: vec2f) -> vec4f {
  if (any(pixel < vec2f(0)) || any(pixel >= params.resolution)) { return vec4f(0); }
  // The shared projection sampler wraps horizontally; pages must not wrap at the edges.
  let uv = clamp(pixel, vec2f(0.5), params.resolution - vec2f(0.5)) / params.resolution;
  return textureSampleLevel(source, sourceSampler, uv, 0);
}

@fragment fn fragment(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let radius = params.geometry.x;
  let direction = params.geometry.y;
  let normal = vec2f(-sin(direction), cos(direction));
  let distance = dot(position.xy - params.foldPosition, normal);
  let coverage = 1.0 - smoothstep(radius - max(fwidth(distance), 0.001), radius, distance);
  if (distance >= radius) { return vec4f(0); }

  var front = vec4f(0);
  var back = vec4f(0);
  var backDistance = 3.14159265359 * radius - distance;
  var backShade = 0.9;
  if (distance <= 0.0) {
    front = samplePage(position.xy);
  } else {
    let angle = asin(clamp(distance / radius, 0.0, 1.0));
    let frontDistance = radius * angle;
    backDistance = 3.14159265359 * radius - frontDistance;
    let light = params.geometry.z;
    let lightDot = normal.x * sin(light) - normal.y * cos(light);
    let shade = 1.0 - 0.4 * (angle / 1.57079632679) * (0.5 + 0.5 * lightDot);
    let color = samplePage(position.xy + normal * (frontDistance - distance));
    front = vec4f(color.rgb * shade, color.a);
    backShade = 0.6 + 0.4 * cos(angle);
  }
  let color = samplePage(position.xy + normal * (backDistance - distance));
  let tint = (1.0 - params.back.x) * params.paperColor.a;
  back = vec4f(mix(color.rgb, params.paperColor.rgb * color.a, tint) * backShade, color.a);
  if (params.geometry.w == 1.0) { return front * coverage; }
  if (params.geometry.w == 2.0) { return back * coverage; }
  // Premultiplied source-over: the curled back covers the front, which shows through its alpha.
  return (back + front * (1.0 - back.a)) * coverage;
}
`;
