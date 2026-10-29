// Adapted from EffectCraft's noise3.rs; see ../THIRD_PARTY_LICENSES.md.
// Callers declare uNoiseType: 0 = block, 1 = linear, 2 = soft linear, 3 = spline.
export const VALUE_NOISE_SHADER = /* glsl */ `
float lattice(ivec3 point, uint seed) {
  // Wrap lattice indices as well as coordinates so interpolation stays continuous
  // across the period boundary, including negative coordinates.
  uvec3 p = uvec3(point) & uvec3(65535u);
  uint h = p.x * 0x27d4eb2du ^ p.y * 0x165667b1u ^ p.z * 0x9e3779b9u ^ seed * 0x85ebca6bu;
  h ^= h >> 15;
  h *= 0x2c1b3c6du;
  h ^= h >> 12;
  h *= 0x297a2d39u;
  h ^= h >> 15;
  return float(h & 65535u) / 65535.0;
}

float catmull(vec4 p, float t) {
  return 0.5 * (2.0 * p.y + (p.z - p.x) * t
    + (2.0 * p.x - 5.0 * p.y + 4.0 * p.z - p.w) * t * t
    + (3.0 * p.y - p.x - 3.0 * p.z + p.w) * t * t * t);
}

vec3 bspline(float t) {
  return vec3(0.5 * (1.0-t) * (1.0-t), 0.5 + t * (1.0-t), 0.5 * t * t);
}

float sliceNoise(ivec3 p, vec2 t, uint seed) {
  if (uNoiseType == 0) return lattice(p, seed);
  if (uNoiseType == 1) {
    return mix(mix(lattice(p, seed), lattice(p + ivec3(1,0,0), seed), t.x),
      mix(lattice(p + ivec3(0,1,0), seed), lattice(p + ivec3(1,1,0), seed), t.x), t.y);
  }
  if (uNoiseType == 2) {
    vec3 wx = bspline(t.x);
    vec3 wy = bspline(t.y);
    float result = 0.0;
    for (int y = 0; y < 3; y++) {
      for (int x = 0; x < 3; x++) {
        result += wx[x] * wy[y] * lattice(p + ivec3(x-1, y-1, 0), seed);
      }
    }
    return result;
  }
  vec4 rows;
  for (int y = 0; y < 4; y++) {
    vec4 row;
    for (int x = 0; x < 4; x++) {
      row[x] = lattice(p + ivec3(x-1, y-1, 0), seed);
    }
    rows[y] = catmull(row, t.x);
  }
  return catmull(rows, t.y);
}

float valueNoise(vec3 point, uint seed) {
  // A large period keeps conversion to integer coordinates defined at extreme scales.
  vec3 p = mod(point + vec3(uNoiseType == 2 ? 0.5 : 0.0, uNoiseType == 2 ? 0.5 : 0.0, 0.0), 65536.0);
  ivec3 cell = ivec3(floor(p));
  vec3 t = fract(p);
  float fz = t.z * t.z * t.z * (t.z * (t.z * 6.0 - 15.0) + 10.0);
  float n = mix(sliceNoise(cell, t.xy, seed), sliceNoise(cell + ivec3(0,0,1), t.xy, seed), fz);
  return uNoiseType == 2 ? 0.5 + (n - 0.5) * (181.0 / 231.0) / 0.55 : n;
}
`;
