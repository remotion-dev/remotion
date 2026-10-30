// Adapted from @paper-design/shaders, Apache-2.0.
import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const PAPER_WEBGPU_SHADER = /* wgsl */ `
diagnostic(off, derivative_uniformity);
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { size: vec2f, aspectRatio: f32, amount: f32, colorFront: vec4f, colorBack: vec4f, contrast: f32, roughness: f32, fiber: f32, fiberSize: f32, crumples: f32, crumpleSize: f32, folds: f32, foldCount: f32, drops: f32, fade: f32, seed: f32, scale: f32, offsetY: f32, }
@group(0) @binding(3) var noiseTexture: texture_2d<f32>;
const TWO_PI=6.28318530718;
const PI=3.14159265358979323846;
fn getUvFrame(uv: vec2f) -> f32 {

	var aax: f32 = 2.0 * fwidth(uv.x);
	var aay: f32 = 2.0 * fwidth(uv.y);

	var left: f32 = smoothstep(0.0, aax, uv.x);
	var right: f32 = 1.0 - smoothstep(1.0 - aax, 1.0, uv.x);
	var bottom: f32 = smoothstep(0.0, aay, uv.y);
	var top: f32 = 1.0 - smoothstep(1.0 - aay, 1.0, uv.y);

	return left * right * bottom * top;
}

fn rotate(uv: vec2f, th: f32) -> vec2f {

	return mat2x2f(vec2f(cos(th), sin(th)),vec2f(-sin(th), cos(th))) * uv;
}

fn seedOffset(salt: f32) -> vec2f {

	var seeded: f32 = params.seed + salt;
	return fract(
		sin(
			vec2f(
				seeded * 12.9898 + 78.233,
				seeded * 39.3468 + 11.135
			)
		) * 43758.5453
	);
}

fn randomR(p: vec2f) -> f32 {

	var uv: vec2f = floor(p) / 100.0 + vec2f(0.5);
	return textureLoad(noiseTexture,vec2i(floor(fract(uv)*vec2f(textureDimensions(noiseTexture)))),0).r;
}

fn valueNoise(st: vec2f) -> f32 {

	var i: vec2f = floor(st);
	var f: vec2f = fract(st);
	var a: f32 = randomR(i);
	var b: f32 = randomR(i + vec2f(1.0, 0.0));
	var c: f32 = randomR(i + vec2f(0.0, 1.0));
	var d: f32 = randomR(i + vec2f(1.0, 1.0));
	var u: vec2f = f * f * (vec2f(3.0) - 2.0 * f);
	var x1: f32 = mix(a, b, u.x);
	var x2: f32 = mix(c, d, u.x);
	return mix(x1, x2, u.y);
}

fn fbm(nInput: vec2f) -> f32 {
var n=nInput;
	var total: f32 = 0.0;
	var amplitude: f32 = 0.4;
	for (var i: i32 = 0; i < 3; i++) {
		total += valueNoise(n) * amplitude;
		n *= 1.99;
		amplitude *= 0.65;
	}
	return total;
}

fn randomG(p: vec2f) -> f32 {

	var uv: vec2f = floor(p) / 50.0 + vec2f(0.5);
	return textureLoad(noiseTexture,vec2i(floor(fract(uv)*vec2f(textureDimensions(noiseTexture)))),0).g;
}

fn roughnessNoise(pInput: vec2f) -> f32 {
var p=pInput;
	p *= 0.1;
	var o: f32 = 0.0;
	for (var i: f32 = 1.0; i < 4.0; i += 1.0) {
		var w: vec4f = vec4f(floor(p), ceil(p));
		var f: vec2f = fract(p);
		o += mix(
			mix(randomG(w.xy), randomG(w.xw), f.y),
			mix(randomG(w.zy), randomG(w.zw), f.y),
			f.x
		);
		o += 0.2 / exp(2.0 * abs(sin(0.2 * p.x + 0.5 * p.y)));
 p *= 2.1;
	}
	return o / 3.0;
}

fn fiberRandom(p: vec2f) -> f32 {

	var uv: vec2f = floor(p) / 100.0;
	return textureLoad(noiseTexture,vec2i(floor(fract(uv)*vec2f(textureDimensions(noiseTexture)))),0).b;
}

fn fiberValueNoise(st: vec2f) -> f32 {

	var i: vec2f = floor(st);
	var f: vec2f = fract(st);
	var a: f32 = fiberRandom(i);
	var b: f32 = fiberRandom(i + vec2f(1.0, 0.0));
	var c: f32 = fiberRandom(i + vec2f(0.0, 1.0));
	var d: f32 = fiberRandom(i + vec2f(1.0, 1.0));
	var u: vec2f = f * f * (vec2f(3.0) - 2.0 * f);
	var x1: f32 = mix(a, b, u.x);
	var x2: f32 = mix(c, d, u.x);
	return mix(x1, x2, u.y);
}

fn fiberNoiseFbm(nInput: vec2f, seedOffset: vec2f) -> f32 {
var n=nInput;
	var total: f32 = 0.0;
	var amplitude: f32 = 1.0;
	for (var i: i32 = 0; i < 4; i++) {
		n = rotate(n, 0.7);
		total += fiberValueNoise(n + seedOffset) * amplitude;
		n *= 2.0;
		amplitude *= 0.6;
	}
	return total;
}

fn fiberNoise(uv: vec2f, seedOffset: vec2f) -> f32 {

	var epsilon: f32 = 0.001;
	var n1: f32 = fiberNoiseFbm(uv + vec2f(epsilon, 0.0), seedOffset);
	var n2: f32 = fiberNoiseFbm(uv - vec2f(epsilon, 0.0), seedOffset);
	var n3: f32 = fiberNoiseFbm(uv + vec2f(0.0, epsilon), seedOffset);
	var n4: f32 = fiberNoiseFbm(uv - vec2f(0.0, epsilon), seedOffset);
	return length(vec2f(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}

fn randomGB(p: vec2f) -> vec2f {

	var uv: vec2f = floor(p) / 50.0 + vec2f(0.5);
	return textureLoad(noiseTexture,vec2i(floor(fract(uv)*vec2f(textureDimensions(noiseTexture)))),0).gb;
}

fn crumpledNoise(t: vec2f, pw: f32) -> f32 {

	var p: vec2f = floor(t);
	var wsum: f32 = 0.0;
	var cl: f32 = 0.0;
	for (var y: i32 = -1; y < 2; y += 1) {
		for (var x: i32 = -1; x < 2; x += 1) {
			var b: vec2f = vec2f(f32(x), f32(y));
			var q: vec2f = b + p;
			var q2: vec2f = q - floor(q / 8.0) * 8.0;
			var c: vec2f = q + randomGB(q2);
			var r: vec2f = c - t;
			var w: f32 =
				pow(smoothstep(0.0, 1.0, 1.0 - abs(r.x)), pw) *
				pow(smoothstep(0.0, 1.0, 1.0 - abs(r.y)), pw);
			cl += (0.5 + 0.5 * sin((q2.x + q2.y * 5.0) * 8.0)) * w;
			wsum += w;
		}
	}
	return pow(select(0.0, cl / select(1.0, wsum, wsum != 0.0), wsum != 0.0), 0.5) * 2.0;
}

fn crumplesShape(uv: vec2f) -> f32 {

	return crumpledNoise(uv * 0.25, 16.0) * crumpledNoise(uv * 0.5, 2.0);
}

fn folds(uv: vec2f) -> vec2f {

	var pp: vec3f = vec3f(0.0);
	var l: f32 = 9.0;
	for (var i: f32 = 0.0; i < 15.0; i += 1.0) {
		if (i >= params.foldCount) {
			break;
		}
		var rand: vec2f = randomGB(vec2f(i, i * params.seed));
		var an: f32 = rand.x * TWO_PI;
		var p: vec2f = vec2f(cos(an), sin(an)) * rand.y;
		var dist: f32 = distance(uv, p);
		l = min(l, dist);

		if (l == dist) {
			pp = vec3f(uv-p,pp.z);
			pp.z = dist;
		}
	}
	return mix(pp.xy, vec2f(0.0), pow(pp.z, 0.25));
}

fn drops(uv: vec2f) -> f32 {

	var iDropsUV: vec2f = floor(uv);
	var fDropsUV: vec2f = fract(uv);
	var dropsMinDist: f32 = 1.0;
	for (var j: i32 = -1; j <= 1; j++) {
		for (var i: i32 = -1; i <= 1; i++) {
			var neighbor: vec2f = vec2f(f32(i), f32(j));
			var offset: vec2f = randomGB(iDropsUV + neighbor);
			offset = vec2f(0.5) + 0.5 * sin(vec2f(10.0 * params.seed) + TWO_PI * offset);
			var pos: vec2f = neighbor + offset - fDropsUV;
			var dist: f32 = length(pos);
			dropsMinDist = min(dropsMinDist, dropsMinDist * dist);
		}
	}
	return 1.0 - smoothstep(0.05, 0.09, pow(dropsMinDist, 0.5));
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let pixel=vec2f(input.position.x,params.size.y+params.offsetY-input.position.y);
 let vUv=pixel/params.size;
	var color: vec4f = textureSampleLevel(source,sourceSampler,vec2f(vUv.x,1.0-vUv.y),0);
	var sourceAlpha: f32 = color.a;

	if (sourceAlpha <= 0.001 || params.amount <= 0.0) {
		return color;
	}

	var sourceRgb: vec3f = color.rgb / sourceAlpha;
	var imageUV: vec2f = vUv;
	var patternUV: vec2f = vUv - vec2f(0.5);
	patternUV /= max(params.scale, 0.001);
	patternUV = 5.0 * (patternUV * vec2f(params.aspectRatio, 1.0));

	var roughnessUv: vec2f =
		1.5 * (pixel - 0.5 * params.size) +
		128.0 * seedOffset(1.0);
	var roughness: f32 =
		roughnessNoise(roughnessUv + vec2f(1.0, 0.0)) -
		roughnessNoise(roughnessUv - vec2f(1.0, 0.0));

	var crumplesUV: vec2f =
		fract(patternUV * 0.02 / max(params.crumpleSize, 0.001) - vec2f(params.seed)) * 32.0;
	var crumples: f32 =
		params.crumples *
		(crumplesShape(crumplesUV + vec2f(0.05, 0.0)) -
			crumplesShape(crumplesUV));

	var fiberUV: vec2f = 2.0 / max(params.fiberSize, 0.001) * patternUV;
	var fiber: f32 = fiberNoise(fiberUV, 64.0 * seedOffset(2.0));
	fiber = 0.5 * params.fiber * (fiber - 1.0);

	var normal: vec2f = vec2f(0.0);
	var normalImage: vec2f = vec2f(0.0);

	var foldsUV: vec2f = patternUV * 0.12;
	foldsUV = rotate(foldsUV, 4.0 * params.seed);
	var w: vec2f = folds(foldsUV);
	foldsUV = rotate(foldsUV + vec2f(0.007 * cos(params.seed)), 0.01 * sin(params.seed));
	var w2: vec2f = folds(foldsUV);

	var dropPattern: f32 = params.drops * drops(patternUV * 2.0);

	var fade: f32 = params.fade * fbm(0.17 * patternUV + vec2f(10.0 * params.seed));
	fade = clamp(8.0 * fade * fade * fade, 0.0, 1.0);

	w = mix(w, vec2f(0.0), fade);
	w2 = mix(w2, vec2f(0.0), fade);
	crumples = mix(crumples, 0.0, fade);
	dropPattern = mix(dropPattern, 0.0, fade);
	fiber *= mix(1.0, 0.5, fade);
	roughness *= mix(1.0, 0.5, fade);

	normal += params.folds * min(5.0 * params.contrast, 1.0) * 4.0 * max(vec2f(0.0), w + w2);
	normalImage += params.folds * 2.0 * w;
	normal += vec2f(crumples);
	normalImage += vec2f(1.5 * crumples);
	normal += vec2f(3.0 * dropPattern);
	normalImage += vec2f(0.2 * dropPattern);
	normal += vec2f(params.roughness * 1.5 * roughness);
	normal += vec2f(fiber);
	normalImage += vec2f(params.roughness * 0.75 * roughness);
	normalImage += vec2f(0.2 * fiber);

	var lightPos: vec3f = vec3f(1.0, 2.0, 1.0);
	var res: f32 = dot(
		normalize(vec3f(normal, 9.5 - 9.0 * pow(params.contrast, 0.1))),
		normalize(lightPos)
	);

	imageUV += 0.02 * normalImage;
	var frame: f32 = getUvFrame(imageUV);
	var displacedSource: vec4f = textureSampleLevel(source,sourceSampler,clamp(vec2f(imageUV.x,1.0-imageUV.y),vec2f(0),vec2f(1)),0);
	var displacedRgb: vec3f = select(sourceRgb,displacedSource.rgb / max(displacedSource.a,0.001),displacedSource.a > 0.001);
	displacedRgb += vec3f(0.6 * pow(params.contrast, 0.4) * (res - 0.7));

	var frontRgb: vec3f = mix(vec3f(1.0), params.colorFront.rgb, params.colorFront.a);
	var backRgb: vec3f = mix(vec3f(1.0), params.colorBack.rgb, params.colorBack.a);
	var paperTone: vec3f = mix(backRgb, frontRgb, clamp(res, 0.0, 1.0));
	var texturedRgb: vec3f = displacedRgb * (0.72 + 0.42 * res);
	texturedRgb = mix(texturedRgb, texturedRgb * paperTone, 0.65);
	texturedRgb -= vec3f(0.007 * dropPattern);
	texturedRgb = mix(sourceRgb, texturedRgb, frame);

	var finalRgb: vec3f = mix(sourceRgb, clamp(texturedRgb, vec3f(0.0), vec3f(1.0)), params.amount);
	return vec4f(finalRgb * sourceAlpha, sourceAlpha);
}

`;

export const PAPER_CROP_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: vec4f;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
  return textureLoad(source,vec2i(input.position.xy)+vec2i(0,1),0);
}
`;
