import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const SHRINKWRAP_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
struct Params { size: vec2f, amount: f32, displacement: f32, highlightIntensity: f32, wrinkleDensity: f32, edgeTension: f32, phase: f32, seed: f32, }
fn hash21(p: vec2f) -> f32 {
	var p3: vec3f = fract(vec3f(p.xyx) * vec3f(443.8975, 397.2973, 491.1871));
	p3 += vec3f(dot(p3, p3.yzx + vec3f(19.19) + vec3f(params.seed * 0.131)));
	return fract((p3.x + p3.y) * p3.z);
}

fn valueNoise(p: vec2f) -> f32 {
	var i: vec2f = floor(p);
	var f: vec2f = fract(p);
	f = f * f * (vec2f(3.0) - 2.0 * f);

	var a: f32 = hash21(i);
	var b: f32 = hash21(i + vec2f(1.0, 0.0));
	var c: f32 = hash21(i + vec2f(0.0, 1.0));
	var d: f32 = hash21(i + vec2f(1.0, 1.0));

	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

fn fbm(point: vec2f) -> f32 {
 var p=point;
	var value: f32 = 0.0;
	var amplitude: f32 = 0.5;

	for (var i: i32 = 0; i < 4; i++) {
		value += valueNoise(p) * amplitude;
		p = p * 2.03 + vec2f(17.1, 31.7);
		amplitude *= 0.5;
	}

	return value;
}

fn rotate2d(angle: f32) -> mat2x2f {
	var c: f32 = cos(angle);
	var s: f32 = sin(angle);
	return mat2x2f(vec2f(c,-s),vec2f(s,c));
}

fn phaseVec(xFactor: f32, yFactor: f32) -> vec2f {
	return vec2f(params.phase * xFactor, params.phase * yFactor);
}

fn warpVec(p: vec2f, scale: f32, amount: f32, seedOffset: f32) -> vec2f {
	return vec2f(
		fbm(p / scale + phaseVec(0.21, 0.13) + vec2f(seedOffset, 1.7)) - 0.5,
		fbm(p / scale + phaseVec(-0.17, 0.29) + vec2f(seedOffset + 9.1, 6.4))
			- 0.5
	) * amount;
}

fn bandField(coord: f32, spacing: f32, width: f32) -> f32 {
	var centered: f32 = abs(fract(coord / spacing) - 0.5) * spacing;
	return 1.0 - smoothstep(width, width * 3.8, centered);
}

fn curvedFoldField(px: vec2f, baseAngle: f32, spacing: f32, width: f32, seedOffset: f32) -> f32 {
	var angleNoise: f32 =
		(fbm(px / (spacing * 5.8) + phaseVec(0.08, -0.11) + vec2f(seedOffset, 3.1))
			- 0.5) * 1.35;
	var warped: vec2f = px + warpVec(
		px + vec2f(seedOffset * 13.0, seedOffset * 7.0),
		spacing * 5.4,
		spacing * 0.95,
		seedOffset
	);
	var q: vec2f = rotate2d(baseAngle + angleNoise) * warped;
	var phase: f32 =
		(fbm(q / (spacing * 3.4) + phaseVec(-0.14, 0.19) + vec2f(seedOffset, 8.6))
			- 0.5) * spacing * 1.3;
	var band: f32 = bandField(q.y + phase, spacing, width);
	var breakup: f32 = smoothstep(
		0.24,
		0.88,
		fbm(
			vec2f(q.x / (spacing * 2.6), q.y / (spacing * 7.5)) +
				phaseVec(0.12, 0.07) +
				vec2f(seedOffset)
		)
	);
	var softness: f32 =
		0.65 +
		fbm(q / (spacing * 8.2) + phaseVec(-0.05, 0.16) + vec2f(seedOffset, 2.3)) *
			0.35;

	return band * breakup * softness;
}

fn edgeMask(uv: vec2f) -> f32 {
	var pxFromEdge: vec2f = min(uv, vec2f(1.0) - uv) * params.size;
	var minSide: f32 = min(params.size.x, params.size.y);
	var side: f32 = 1.0 - smoothstep(0.0, minSide * 0.16, min(pxFromEdge.x, pxFromEdge.y));
	var corner: f32 = 1.0 - smoothstep(
		0.0,
		minSide * 0.23,
		length(pxFromEdge)
	);

	return clamp(side * 0.55 + corner * 0.85, 0.0, 1.0);
}

fn heightMap(uv: vec2f) -> f32 {
	var px: vec2f = uv * params.size;
	var minSide: f32 = min(params.size.x, params.size.y);
	var density: f32 = clamp(params.wrinkleDensity, 0.0, 1.0);
	var spacing: f32 = mix(minSide * 0.31, minSide * 0.13, density);
	var width: f32 = mix(minSide * 0.03, minSide * 0.013, density);

	var broadWarp: vec2f = warpVec(px, minSide * 0.42, minSide * 0.06, params.seed + 1.0);
	var detailWarp: vec2f = warpVec(px, minSide * 0.17, minSide * 0.018, params.seed + 6.0);
	var warpedPx: vec2f = px + broadWarp + detailWarp;

	var h: f32 =
		(fbm(warpedPx / (minSide * 0.26) + phaseVec(0.11, -0.09) + vec2f(params.seed * 0.17))
			- 0.5) * 0.08;
	var broadFold: f32 = curvedFoldField(warpedPx, -0.74, spacing * 1.0, width, 3.1);
	var crossFold: f32 = curvedFoldField(
		warpedPx + broadWarp * 0.7,
		0.31,
		spacing * 1.9,
		width * 1.55,
		9.7
	);
	var microFold: f32 = curvedFoldField(
		warpedPx - detailWarp * 0.6,
		1.04,
		spacing * 0.66,
		width * 0.62,
		15.3
	);
	h += broadFold * 0.22;
	h += crossFold * 0.11;
	h += microFold * 0.045;
	h +=
		(1.0 -
			abs(
				fbm(
					warpedPx / (minSide * 0.11) +
						phaseVec(-0.23, 0.27) +
						vec2f(params.seed * 0.3)
				) *
					2.0 -
					1.0
			)) * 0.018;

	var edge: f32 = edgeMask(uv) * clamp(params.edgeTension, 0.0, 1.0);
	var edgeNoise: f32 =
		fbm(warpedPx / (minSide * 0.18) + phaseVec(0.18, 0.21) + vec2f(params.seed * 0.41, 8.0));
	h += edge * (0.16 + edgeNoise * 0.11);

	return h;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let vUv=vec2f(input.uv.x,1.0-input.uv.y);
	if (params.amount <= 0.0) {
		return textureSampleLevel(source, sourceSampler, vec2f(vUv.x,1.0-vUv.y), 0);
	}

	var texel: vec2f = vec2f(1.0) / params.size;
	var left: f32 = heightMap(vUv - vec2f(texel.x, 0.0));
	var right: f32 = heightMap(vUv + vec2f(texel.x, 0.0));
	var down: f32 = heightMap(vUv - vec2f(0.0, texel.y));
	var up: f32 = heightMap(vUv + vec2f(0.0, texel.y));
	var gradient: vec2f = vec2f(right - left, up - down);
	var reliefScale: f32 = mix(42.0, 115.0, params.wrinkleDensity);
	var warpStrength: f32 = reliefScale * 0.32;

	var sampleOffset: vec2f = gradient * warpStrength * params.displacement * params.amount;
	var sampleUv: vec2f = clamp(vUv - sampleOffset * texel, vec2f(0.0), vec2f(1.0));
	var color: vec4f = textureSampleLevel(source, sourceSampler, vec2f(sampleUv.x,1.0-sampleUv.y), 0);

	var alpha: f32 = color.a;
	if (alpha <= 0.001) {
		return vec4f(0.0);
	}

	var rgb: vec3f = color.rgb / alpha;
	var normal: vec3f = normalize(vec3f(-gradient * reliefScale, 1.0));
	var light: vec3f = normalize(vec3f(-0.42, 0.58, 0.72));
	var halfVector: vec3f = normalize(light + vec3f(0.0, 0.0, 1.0));
	var specular: f32 = pow(max(dot(normal, halfVector), 0.0), 24.0);
	var directional: f32 = dot(gradient, normalize(vec2f(-0.45, 0.72)));
	var creaseHighlight: f32 = smoothstep(0.02, 0.07, directional);
	var creaseShadow: f32 = smoothstep(0.02, 0.07, -directional);
	var edge: f32 = edgeMask(vUv) * params.edgeTension;
	var edgeGlint: f32 = edge * smoothstep(
		0.35,
		0.95,
		fbm(vUv * params.size / 90.0 + phaseVec(0.31, -0.24) + vec2f(params.seed))
	);

	var highlight: f32 = clamp(
		(specular * 0.55 + creaseHighlight * 0.4 + edgeGlint * 0.18)
			* params.highlightIntensity
			* params.amount,
		0.0,
		1.15
	);
	var shadow: f32 = clamp((creaseShadow * 0.1 + edge * 0.06) * params.amount, 0.0, 0.25);

	rgb *= 1.0 - shadow;
	rgb += (vec3f(1.0) - rgb) * min(highlight, 1.0);
	rgb += vec3f(max(highlight - 1.0, 0.0)) * 0.35;

	return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)) * alpha, alpha);
}

`;
