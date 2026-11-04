export const SPHERE_SHADER = /* wgsl */ `
struct Params {
  resolution: vec2f,
  center: vec2f,
  radius: f32,
  padding: f32,
  shading: f32,
  faces: f32,
  rotation: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let positions = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  return vec4f(positions[index], 0, 1);
}

fn sampleFace(normal: vec3f, inverse: mat3x3f) -> vec4f {
  let local = inverse * normal;
  // Longitude wraps at the seam; latitude spans the complete image height.
  let uv = vec2f(fract(atan2(local.x, local.z) / 6.28318530718 + 0.5), asin(clamp(local.y, -1.0, 1.0)) / 3.14159265359 + 0.5);
  let color = textureSampleLevel(source, sourceSampler, uv, 0);
  let shade = mix(1.0, abs(normal.z), params.shading);
  return vec4f(color.rgb * shade, color.a);
}

@fragment fn fragment(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let p = (position.xy - params.center) / params.radius;
  let distanceSquared = dot(p, p);
  let coverage = 1.0 - smoothstep(1.0 - fwidth(distanceSquared), 1.0, distanceSquared);
  if (distanceSquared >= 1.0) { return vec4f(0); }
  let z = sqrt(1.0 - distanceSquared);
  let s = sin(params.rotation.xyz);
  let c = cos(params.rotation.xyz);
  let rx = mat3x3f(vec3f(1, 0, 0), vec3f(0, c.x, s.x), vec3f(0, -s.x, c.x));
  let ry = mat3x3f(vec3f(c.y, 0, -s.y), vec3f(0, 1, 0), vec3f(s.y, 0, c.y));
  let rz = mat3x3f(vec3f(c.z, s.z, 0), vec3f(-s.z, c.z, 0), vec3f(0, 0, 1));
  let inverse = transpose(rz * ry * rx);
  let front = sampleFace(vec3f(p, z), inverse);
  let back = sampleFace(vec3f(p, -z), inverse);
  if (params.faces == 1) { return front * coverage; }
  if (params.faces == 2) { return back * coverage; }
  return (front + back * (1.0 - front.a)) * coverage;
}
`;
