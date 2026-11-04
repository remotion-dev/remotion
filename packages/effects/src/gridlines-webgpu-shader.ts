import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const GRIDLINES_WEBGPU_SHADER = /* wgsl */ `
diagnostic(off, derivative_uniformity);
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params {
 geometry: vec4f,
 rotation: vec4f,
 offset: vec4f,
 lineColor: vec4f,
 backgroundColor: vec4f,
}
fn sampleSource(uv: vec2f) -> vec4f {
 return textureSampleLevel(sourceTexture, sourceSampler, vec2f(uv.x, 1.0 - uv.y), 0);
}

fn sourceOver(backdrop: vec4f, overlay: vec4f) -> vec4f { return overlay + backdrop * (1.0 - overlay.a); }
fn sourceAtop(backdrop: vec4f, overlay: vec4f) -> vec4f { return vec4f(overlay.rgb * backdrop.a + backdrop.rgb * (1.0 - overlay.a), backdrop.a); }
fn rotationMatrix(rotationX: f32, rotationY: f32, rotationZ: f32) -> mat3x3f {
 let sx = sin(rotationX); let cx = cos(rotationX);
 let sy = sin(rotationY); let cy = cos(rotationY);
 let sz = sin(rotationZ); let cz = cos(rotationZ);
 let rx = mat3x3f(1, 0, 0, 0, cx, sx, 0, -sx, cx);
 let ry = mat3x3f(cy, 0, -sy, 0, 1, 0, sy, 0, cy);
 let rz = mat3x3f(cz, sz, 0, -sz, cz, 0, 0, 0, 1);
 return rz * ry * rx;
}
struct GridPoint {coordinate: vec2f, valid: bool,}
fn gridAt(centered: vec2f, rotation: mat3x3f) -> GridPoint {
 var gridCoord = vec2f(0);
 if (params.rotation.w <= 0.0) {
  let rotated = rotation * vec3f(centered, 0);
  gridCoord = rotated.xy + params.offset.xy;
 } else {
  let camera = vec3f(0, 0, params.rotation.w);
  let ray = normalize(vec3f(centered, -params.rotation.w));
  let normal = rotation * vec3f(0, 0, 1);
  let denominator = dot(ray, normal);
  let t = -dot(camera, normal) / denominator;
  if (abs(denominator) < 0.0001 || t <= 0.0) { return GridPoint(vec2f(0), false); }
  let worldPosition = camera + ray * t;
  let localPosition = transpose(rotation) * worldPosition;
  gridCoord = localPosition.xy + params.offset.xy;
 }
 return GridPoint(gridCoord, true);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv = vec2f(input.uv.x, 1.0 - input.uv.y);

 let texColor = sampleSource(vUv);
 let centered = vec2f(input.position.x, params.geometry.y - input.position.y) - params.geometry.xy * 0.5;
 let rotation = rotationMatrix(params.rotation.y, params.rotation.z, params.rotation.x);
 let gridPoint = gridAt(centered, rotation);
 if (!gridPoint.valid) { return sourceOver(texColor, params.backgroundColor); }
 let gridCoord = gridPoint.coordinate;
 let gridSize = max(params.geometry.z, 0.001);
 let cell = abs(fract(gridCoord / gridSize + vec2f(0.5)) - vec2f(0.5)) * gridSize;
 let halfLineWidth = params.geometry.w * 0.5;
 var derivatives = fwidth(gridCoord);
 if (i32(params.geometry.y) % 2 != 0) {
  // Match WebGL's bottom-origin derivative quads on odd-height targets.
  let neighborY = select(-1.0, 1.0, i32(params.geometry.y - input.position.y) % 2 == 0);
  let neighbor = gridAt(centered + vec2f(0, neighborY), rotation);
  derivatives = abs(dpdx(gridCoord)) + abs(neighbor.coordinate - gridCoord);
 }
 let gridUnitsPerPixel = max(derivatives, vec2f(0.001));
 let halfWidthInGridUnits = halfLineWidth * gridUnitsPerPixel;
 let projectedCellSize = gridSize / gridUnitsPerPixel;
 let densityFade = smoothstep(vec2f(max(params.geometry.w * 1.5, 1.0)), vec2f(max(params.geometry.w * 4.0, 2.0)), projectedCellSize);
 var lineCoverage = vec2f(0);
 if (halfLineWidth > 0.001) { lineCoverage = vec2f(1) - smoothstep(halfWidthInGridUnits - gridUnitsPerPixel, halfWidthInGridUnits + gridUnitsPerPixel, cell); }
 lineCoverage *= densityFade;
 let coverage = max(lineCoverage.x, lineCoverage.y);
 let line = params.lineColor * coverage;
 if (params.offset.z != 0.0) { return sourceAtop(sourceAtop(texColor, params.backgroundColor), line); }
 return sourceOver(sourceOver(texColor, params.backgroundColor), line);

}
`;
