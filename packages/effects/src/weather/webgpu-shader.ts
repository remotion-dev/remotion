import {WEBGPU_SINGLE_PASS_VERTEX} from '../webgpu-single-pass-runtime.js';
// Adapted from EffectCraft's CC Rainfall / CC Snowfall; see ../../THIRD_PARTY_LICENSES.md.
export const WEATHER_WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params {
 resolution: vec2f, offset: vec2f, color: vec4f,
 snow: f32, time: f32, seed: u32, size: f32,
 sizeVariation: f32, sceneDepth: f32, speed: f32, speedVariation: f32,
 wind: f32, windVariation: f32, spread: f32, wiggleAmount: f32,
 wiggleAmountVariation: f32, wiggleFrequency: f32, wiggleFrequencyVariation: f32, opacity: f32,
 refract: f32, composite: f32, lighten: f32, padding: f32,
}
struct ParticleOutput {
 @builtin(position) position: vec4f,
 @location(0) @interpolate(flat) particlePosition: vec2f,
 @location(1) @interpolate(flat) line: vec2f,
 @location(2) @interpolate(flat) radius: f32,
 @location(3) @interpolate(flat) color: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var weather: texture_2d<f32>;
fn noise(i: u32, key: u32) -> f32 {
	var h: u32 = (i * 0x8da6b343u) ^ (key * 0xd8163841u) ^ (params.seed * 0xcb1ab31fu);
	h ^= h >> 13u;
	h *= 0x5bd1e995u;
	h ^= h >> 15u;
	return f32(h & 0x00ffffffu) / 16777216.0;
}

fn signedNoise(i: u32, key: u32) -> f32 {
	return noise(i, key) * 2.0 - 1.0;
}

fn wrap(value: f32, margin: f32, size: f32) -> f32 {
	return -margin + (value + margin - floor((value + margin)/(size + 2.0*margin))*(size+2.0*margin));
}

fn sourcePixel(p: vec2i) -> vec4f {
	var size: vec2i = vec2i(textureDimensions(source));
	if (p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y) {
		return vec4f(0.0);
	}
	return textureLoad(source,p,0);
}

// Bilinear sampling with transparent borders, at pixel centers of +0.5.
fn sourceAt(position: vec2f) -> vec4f {
	var p: vec2f = position - vec2f(0.5);
	var base: vec2i = vec2i(floor(p));
	var f: vec2f = fract(p);
	return mix(
		mix(sourcePixel(base), sourcePixel(base + vec2i(1, 0)), f.x),
		mix(sourcePixel(base + vec2i(0, 1)), sourcePixel(base + vec2i(1, 1)), f.x),
		f.y
	);
}

@vertex fn particleVertex(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> ParticleOutput {
 var output: ParticleOutput;
	var i: u32 = instanceIndex;
	var depth: f32 = 1.0 / (1.0 + noise(i, 1u) * params.sceneDepth / 2500.0);
	var offset: vec2f = (params.offset - vec2f(0.5)) * params.resolution;
	var position: vec2f ;
	var line: vec2f = vec2f(0.0);
	var radius: f32 ;
	var alpha: f32 ;
	if (params.snow == 1) {
		radius = max(params.size * 0.5 * depth * (1.0 + params.sizeVariation * signedNoise(i, 2u)), 0.05);
		var speed: f32 = params.speed * (params.resolution.y / 600.0) * depth * (1.0 + params.speedVariation * signedNoise(i, 3u));
		var wind: f32 = params.wind * (params.resolution.y / 1200.0) * depth * (1.0 + params.windVariation * signedNoise(i, 4u))
			+ params.spread * signedNoise(i, 8u) * depth;
		var amplitude: f32 = params.wiggleAmount * 2.0 * depth * (1.0 + params.wiggleAmountVariation * signedNoise(i, 5u));
		var frequency: f32 = params.wiggleFrequency * (1.0 + params.wiggleFrequencyVariation * signedNoise(i, 6u));
		var phase: f32 = noise(i, 9u) * 6.283185307179586;
		var margin: f32 = radius + abs(amplitude) + 2.0;
		position.y = wrap(noise(i, 10u) * (params.resolution.y + 2.0 * margin) + speed * params.time + offset.y, margin, params.resolution.y);
		position.x = wrap(noise(i, 11u) * (params.resolution.x + 2.0 * margin) + wind * params.time + offset.x, margin, params.resolution.x)
			+ amplitude * sin(frequency * params.time * 6.283185307179586 + phase);
		alpha = params.opacity * (0.4 + 0.6 * depth);
	} else {
		var speed: f32 = params.speed / 4000.0 * params.resolution.y * 2.2 * depth;
		var wind: f32 = params.wind / 1000.0 * params.resolution.y * (1.0 + params.windVariation * signedNoise(i, 2u)) * depth
			+ params.spread * signedNoise(i, 7u) * depth;
		var length: f32 = max(speed * 0.04 * max(params.size, 0.2), 1.0);
		var horizontalLength: f32 = wind * 0.04 * max(params.size, 0.2);
		var margin: f32 = length + abs(horizontalLength) + 4.0;
		position.y = wrap(noise(i, 3u) * (params.resolution.y + 2.0 * margin) + speed * params.time + offset.y, margin, params.resolution.y);
		position.x = wrap(noise(i, 4u) * (params.resolution.x + 2.0 * margin) + wind * params.time + offset.x, margin, params.resolution.x);
		line = vec2f(-horizontalLength, -length);
		radius = max(params.size * 0.6 * depth, 0.25);
		alpha = params.opacity * (0.35 + 0.65 * depth);
	}

	var color: vec3f = params.color.rgb;
	if (params.snow == 0 && params.refract == 1) {
		var sampleColor: vec4f = sourceAt(position + vec2f(2.0, 0.0));
		if (sampleColor.a > 0.0) {
			var straight: vec3f = select(vec3f(0),sampleColor.rgb/max(sampleColor.a,0.000001),sampleColor.a>0.000001);
			color *= straight * 0.6 + vec3f(0.5);
		}
	}

	output.particlePosition = position;
	output.line = line;
	output.radius = radius;
	output.color = vec4f(color, alpha * params.color.a);
	var padding: f32 = max(radius, 0.5) + 1.0;
	var minimum: vec2f = min(position, position + line) - vec2f(padding);
	var maximum: vec2f = max(position, position + line) + vec2f(padding);
	var corner: vec2f = vec2f(f32(vertexIndex & 1u), f32(vertexIndex >> 1u));
	var pixel: vec2f = mix(minimum, maximum, corner);
	output.position = vec4f(pixel.x / params.resolution.x * 2.0 - 1.0, 1.0 - pixel.y / params.resolution.y * 2.0, 0.0, 1.0);
return output;
}
@fragment fn particleFragment(input: ParticleOutput) -> @location(0) vec4f {
	if (input.color.a <= 0.00001) { discard; }
	var delta: vec2f = input.position.xy - input.particlePosition;
	var radius: f32 = max(input.radius, 0.5);
	var fade: f32 = min(input.radius / 0.5, 1.0);
	var coverage: f32 ;
	if (params.snow == 1) {
		var distanceSquared: f32 = dot(delta, delta) / (radius * radius);
		if (distanceSquared >= 1.0) { discard; }
		var q: f32 = 1.0 - distanceSquared;
		coverage = q * q;
	} else {
		var lengthSquared: f32 = dot(input.line, input.line);
		var along: f32 = select(0.0,clamp(dot(delta, input.line)/max(lengthSquared,0.00000001),0.0,1.0),lengthSquared>0.0);
		coverage = clamp(radius - length(delta - input.line * along) + 0.5, 0.0, 1.0);
	}
	var alpha: f32 = coverage * input.color.a * fade;
	if (alpha <= 0.000001) { discard; }
	return vec4f(input.color.rgb * alpha, alpha);
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
 let result=textureSampleLevel(weather,sourceSampler,input.uv,0);
 if(params.composite==0.0) { return result; }
 let original=textureSampleLevel(source,sourceSampler,input.uv,0);
 if(params.lighten==1.0) { return vec4f(max(original.rgb,result.rgb),original.a+result.a-original.a*result.a); }
 return result+original*(1.0-result.a);
}
`;
