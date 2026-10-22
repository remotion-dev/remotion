export const CYLINDER_SHADER = /* wgsl */ `
struct Params {
  resolution: vec2f,
  center: vec2f,
  radius: f32,
  spin: f32,
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

fn sampleFace(point: vec3f, inverse: mat3x3f, rotation: mat3x3f) -> vec4f {
  let local = inverse * point;
  let uv = vec2f(fract((atan2(local.x, local.z) + params.spin) / 6.28318530718 + 0.5), local.y / params.resolution.y + 0.5);
  let color = textureSampleLevel(source, sourceSampler, uv, 0);
  if (uv.y < 0 || uv.y > 1) { return vec4f(0); }
  let normal = rotation * vec3f(local.x / params.radius, 0, local.z / params.radius);
  let shade = mix(1.0, abs(normal.z), params.shading);
  return vec4f(color.rgb * shade, color.a);
}

@fragment fn fragment(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let s = sin(params.rotation.xyz);
  let c = cos(params.rotation.xyz);
  let rx = mat3x3f(vec3f(1, 0, 0), vec3f(0, c.x, s.x), vec3f(0, -s.x, c.x));
  let ry = mat3x3f(vec3f(c.y, 0, -s.y), vec3f(0, 1, 0), vec3f(s.y, 0, c.y));
  let rz = mat3x3f(vec3f(c.z, s.z, 0), vec3f(-s.z, c.z, 0), vec3f(0, 0, 1));
  let rotation = rz * ry * rx;
  let axis = rotation[1];
  let p = position.xy - params.center;
  // Orthographic viewing ray intersecting the rotated, open cylinder wall.
  let a = 1.0 - axis.z * axis.z;
  let da = dot(p, axis.xy);
  let b = -da * axis.z;
  let discriminant = b * b - a * (dot(p, p) - da * da - params.radius * params.radius);
  if (a < 0.000001 || discriminant <= 0) { return vec4f(0); }
  let root = sqrt(discriminant);
  let inverse = transpose(rotation);
  let front = sampleFace(vec3f(p, (-b + root) / a), inverse, rotation);
  let back = sampleFace(vec3f(p, (-b - root) / a), inverse, rotation);
  if (params.faces == 1) { return front; }
  if (params.faces == 2) { return back; }
  // Both the texture and output use premultiplied alpha.
  return front + back * (1.0 - front.a);
}
`;
