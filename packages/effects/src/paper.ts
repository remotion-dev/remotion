import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 1 as const;
const DEFAULT_COLOR_FRONT = '#9fadbc' as const;
const DEFAULT_COLOR_BACK = '#ffffff' as const;
const DEFAULT_CONTRAST = 0.3 as const;
const DEFAULT_ROUGHNESS = 0.4 as const;
const DEFAULT_FIBER = 0.3 as const;
const DEFAULT_FIBER_SIZE = 0.2 as const;
const DEFAULT_CRUMPLES = 0.3 as const;
const DEFAULT_CRUMPLE_SIZE = 0.35 as const;
const DEFAULT_FOLDS = 0.65 as const;
const DEFAULT_FOLD_COUNT = 5 as const;
const DEFAULT_DROPS = 0.2 as const;
const DEFAULT_FADE = 0 as const;
const DEFAULT_SEED = 6 as const;
const DEFAULT_SCALE = 0.6 as const;
const MAX_FOLD_COUNT = 15 as const;
const MAX_SEED = 1000 as const;
const NOISE_TEXTURE_SIZE = 256;

const paperSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	colorFront: {
		type: 'color',
		default: DEFAULT_COLOR_FRONT,
		description: 'Front color',
	},
	colorBack: {
		type: 'color',
		default: DEFAULT_COLOR_BACK,
		description: 'Back color',
	},
	contrast: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CONTRAST,
		description: 'Contrast',
		hiddenFromList: false,
	},
	roughness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_ROUGHNESS,
		description: 'Roughness',
		hiddenFromList: false,
	},
	fiber: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FIBER,
		description: 'Fiber',
		hiddenFromList: false,
	},
	fiberSize: {
		type: 'number',
		min: 0.01,
		max: 1,
		step: 0.01,
		default: DEFAULT_FIBER_SIZE,
		description: 'Fiber size',
		hiddenFromList: false,
	},
	crumples: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CRUMPLES,
		description: 'Crumples',
		hiddenFromList: false,
	},
	crumpleSize: {
		type: 'number',
		min: 0.01,
		max: 1,
		step: 0.01,
		default: DEFAULT_CRUMPLE_SIZE,
		description: 'Crumple size',
		hiddenFromList: false,
	},
	folds: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FOLDS,
		description: 'Folds',
		hiddenFromList: false,
	},
	foldCount: {
		type: 'number',
		min: 0,
		max: MAX_FOLD_COUNT,
		step: 1,
		default: DEFAULT_FOLD_COUNT,
		description: 'Fold count',
		hiddenFromList: false,
	},
	drops: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_DROPS,
		description: 'Drops',
		hiddenFromList: false,
	},
	fade: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FADE,
		description: 'Fade',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		min: 0,
		max: MAX_SEED,
		step: 0.01,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	scale: {
		type: 'number',
		min: 0.01,
		max: 4,
		step: 0.01,
		default: DEFAULT_SCALE,
		description: 'Scale',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type PaperParams = {
	/** Strength of the paper texture from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
	/** Light-facing paper color. Defaults to `#9fadbc`. */
	readonly colorFront?: string;
	/** Shadow-facing paper color. Defaults to `#ffffff`. */
	readonly colorBack?: string;
	/** Sharpness of light and color transitions from `0` to `1`. Defaults to `0.3`. */
	readonly contrast?: number;
	/** Fine pixel noise from `0` to `1`. Defaults to `0.4`. */
	readonly roughness?: number;
	/** Curly fiber intensity from `0` to `1`. Defaults to `0.3`. */
	readonly fiber?: number;
	/** Curly fiber scale from `0.01` to `1`. Defaults to `0.2`. */
	readonly fiberSize?: number;
	/** Cell-based crumple intensity from `0` to `1`. Defaults to `0.3`. */
	readonly crumples?: number;
	/** Cell-based crumple scale from `0.01` to `1`. Defaults to `0.35`. */
	readonly crumpleSize?: number;
	/** Fold lighting intensity from `0` to `1`. Defaults to `0.65`. */
	readonly folds?: number;
	/** Number of generated folds from `0` to `15`. Defaults to `5`. */
	readonly foldCount?: number;
	/** Speckle visibility from `0` to `1`. Defaults to `0.2`. */
	readonly drops?: number;
	/** Large-scale mask applied to the paper pattern from `0` to `1`. Defaults to `0`. */
	readonly fade?: number;
	/** Seed for the generated paper pattern from `0` to `1000`. Defaults to `6`. */
	readonly seed?: number;
	/** Scale of the generated paper texture from `0.01` to `4`. Defaults to `0.6`. */
	readonly scale?: number;
};

type PaperResolved = {
	amount: number;
	colorFront: string;
	colorBack: string;
	contrast: number;
	roughness: number;
	fiber: number;
	fiberSize: number;
	crumples: number;
	crumpleSize: number;
	folds: number;
	foldCount: number;
	drops: number;
	fade: number;
	seed: number;
	scale: number;
};

type PaperState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly noiseTexture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uImageAspectRatio: WebGLUniformLocation | null;
	readonly uColorFront: WebGLUniformLocation | null;
	readonly uColorBack: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uContrast: WebGLUniformLocation | null;
	readonly uRoughness: WebGLUniformLocation | null;
	readonly uFiber: WebGLUniformLocation | null;
	readonly uFiberSize: WebGLUniformLocation | null;
	readonly uCrumples: WebGLUniformLocation | null;
	readonly uCrumpleSize: WebGLUniformLocation | null;
	readonly uFolds: WebGLUniformLocation | null;
	readonly uFoldCount: WebGLUniformLocation | null;
	readonly uDrops: WebGLUniformLocation | null;
	readonly uFade: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uScale: WebGLUniformLocation | null;
	readonly uNoiseTexture: WebGLUniformLocation | null;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColorFront: string;
	cachedColorFrontRgba: ParsedColorRgba;
	cachedColorBack: string;
	cachedColorBackRgba: ParsedColorRgba;
	cachedNoiseSeed: number;
};

const resolve = (p: PaperParams): PaperResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	colorFront: p.colorFront ?? DEFAULT_COLOR_FRONT,
	colorBack: p.colorBack ?? DEFAULT_COLOR_BACK,
	contrast: p.contrast ?? DEFAULT_CONTRAST,
	roughness: p.roughness ?? DEFAULT_ROUGHNESS,
	fiber: p.fiber ?? DEFAULT_FIBER,
	fiberSize: p.fiberSize ?? DEFAULT_FIBER_SIZE,
	crumples: p.crumples ?? DEFAULT_CRUMPLES,
	crumpleSize: p.crumpleSize ?? DEFAULT_CRUMPLE_SIZE,
	folds: p.folds ?? DEFAULT_FOLDS,
	foldCount: p.foldCount ?? DEFAULT_FOLD_COUNT,
	drops: p.drops ?? DEFAULT_DROPS,
	fade: p.fade ?? DEFAULT_FADE,
	seed: p.seed ?? DEFAULT_SEED,
	scale: p.scale ?? DEFAULT_SCALE,
});

const validateAtMost = (value: number, max: number, name: string): void => {
	if (value > max) {
		throw new TypeError(
			`"${name}" must be <= ${max}, but got ${JSON.stringify(value)}`,
		);
	}
};

const validatePositiveUnitInterval = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}

	validateAtMost(value, 1, name);
};

const validatePaperParams = (params: PaperParams): void => {
	assertEffectParamsObject(params, 'Paper');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalColor(params.colorFront, 'colorFront');
	assertOptionalColor(params.colorBack, 'colorBack');
	assertOptionalFiniteNumber(params.contrast, 'contrast');
	assertOptionalFiniteNumber(params.roughness, 'roughness');
	assertOptionalFiniteNumber(params.fiber, 'fiber');
	assertOptionalFiniteNumber(params.fiberSize, 'fiberSize');
	assertOptionalFiniteNumber(params.crumples, 'crumples');
	assertOptionalFiniteNumber(params.crumpleSize, 'crumpleSize');
	assertOptionalFiniteNumber(params.folds, 'folds');
	assertOptionalFiniteNumber(params.foldCount, 'foldCount');
	assertOptionalFiniteNumber(params.drops, 'drops');
	assertOptionalFiniteNumber(params.fade, 'fade');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.scale, 'scale');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validateUnitInterval(r.contrast, 'contrast');
	validateUnitInterval(r.roughness, 'roughness');
	validateUnitInterval(r.fiber, 'fiber');
	validatePositiveUnitInterval(r.fiberSize, 'fiberSize');
	validateUnitInterval(r.crumples, 'crumples');
	validatePositiveUnitInterval(r.crumpleSize, 'crumpleSize');
	validateUnitInterval(r.folds, 'folds');
	validateNonNegative(r.foldCount, 'foldCount');
	validateAtMost(r.foldCount, MAX_FOLD_COUNT, 'foldCount');
	validateUnitInterval(r.drops, 'drops');
	validateUnitInterval(r.fade, 'fade');
	validateNonNegative(r.seed, 'seed');
	validateAtMost(r.seed, MAX_SEED, 'seed');
	if (r.scale <= 0) {
		throw new TypeError(
			`"scale" must be greater than 0, but got ${JSON.stringify(r.scale)}`,
		);
	}

	validateAtMost(r.scale, 4, 'scale');
};

const PAPER_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Adapted from @paper-design/shaders, Apache-2.0.
// Paper Shaders, Copyright 2026 Paper.
// Powered by Paper Shaders: https://shaders.paper.design
const PAPER_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uImageAspectRatio;

uniform vec4 uColorFront;
uniform vec4 uColorBack;
uniform float uAmount;
uniform float uContrast;
uniform float uRoughness;
uniform float uFiber;
uniform float uFiberSize;
uniform float uCrumples;
uniform float uCrumpleSize;
uniform float uFolds;
uniform float uFoldCount;
uniform float uDrops;
uniform float uFade;
uniform float uSeed;
uniform float uScale;
uniform sampler2D uNoiseTexture;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float getUvFrame(vec2 uv) {
	float aax = 2.0 * fwidth(uv.x);
	float aay = 2.0 * fwidth(uv.y);

	float left = smoothstep(0.0, aax, uv.x);
	float right = 1.0 - smoothstep(1.0 - aax, 1.0, uv.x);
	float bottom = smoothstep(0.0, aay, uv.y);
	float top = 1.0 - smoothstep(1.0 - aay, 1.0, uv.y);

	return left * right * bottom * top;
}

vec2 rotate(vec2 uv, float th) {
	return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec2 seedOffset(float salt) {
	float seeded = uSeed + salt;
	return fract(
		sin(
			vec2(
				seeded * 12.9898 + 78.233,
				seeded * 39.3468 + 11.135
			)
		) * 43758.5453
	);
}

float randomR(vec2 p) {
	vec2 uv = floor(p) / 100.0 + 0.5;
	return texture(uNoiseTexture, fract(uv)).r;
}

float valueNoise(vec2 st) {
	vec2 i = floor(st);
	vec2 f = fract(st);
	float a = randomR(i);
	float b = randomR(i + vec2(1.0, 0.0));
	float c = randomR(i + vec2(0.0, 1.0));
	float d = randomR(i + vec2(1.0, 1.0));
	vec2 u = f * f * (3.0 - 2.0 * f);
	float x1 = mix(a, b, u.x);
	float x2 = mix(c, d, u.x);
	return mix(x1, x2, u.y);
}

float fbm(vec2 n) {
	float total = 0.0;
	float amplitude = 0.4;
	for (int i = 0; i < 3; i++) {
		total += valueNoise(n) * amplitude;
		n *= 1.99;
		amplitude *= 0.65;
	}
	return total;
}

float randomG(vec2 p) {
	vec2 uv = floor(p) / 50.0 + 0.5;
	return texture(uNoiseTexture, fract(uv)).g;
}

float roughnessNoise(vec2 p) {
	p *= 0.1;
	float o = 0.0;
	for (float i = 0.0; ++i < 4.0; p *= 2.1) {
		vec4 w = vec4(floor(p), ceil(p));
		vec2 f = fract(p);
		o += mix(
			mix(randomG(w.xy), randomG(w.xw), f.y),
			mix(randomG(w.zy), randomG(w.zw), f.y),
			f.x
		);
		o += 0.2 / exp(2.0 * abs(sin(0.2 * p.x + 0.5 * p.y)));
	}
	return o / 3.0;
}

float fiberRandom(vec2 p) {
	vec2 uv = floor(p) / 100.0;
	return texture(uNoiseTexture, fract(uv)).b;
}

float fiberValueNoise(vec2 st) {
	vec2 i = floor(st);
	vec2 f = fract(st);
	float a = fiberRandom(i);
	float b = fiberRandom(i + vec2(1.0, 0.0));
	float c = fiberRandom(i + vec2(0.0, 1.0));
	float d = fiberRandom(i + vec2(1.0, 1.0));
	vec2 u = f * f * (3.0 - 2.0 * f);
	float x1 = mix(a, b, u.x);
	float x2 = mix(c, d, u.x);
	return mix(x1, x2, u.y);
}

float fiberNoiseFbm(in vec2 n, vec2 seedOffset) {
	float total = 0.0;
	float amplitude = 1.0;
	for (int i = 0; i < 4; i++) {
		n = rotate(n, 0.7);
		total += fiberValueNoise(n + seedOffset) * amplitude;
		n *= 2.0;
		amplitude *= 0.6;
	}
	return total;
}

float fiberNoise(vec2 uv, vec2 seedOffset) {
	float epsilon = 0.001;
	float n1 = fiberNoiseFbm(uv + vec2(epsilon, 0.0), seedOffset);
	float n2 = fiberNoiseFbm(uv - vec2(epsilon, 0.0), seedOffset);
	float n3 = fiberNoiseFbm(uv + vec2(0.0, epsilon), seedOffset);
	float n4 = fiberNoiseFbm(uv - vec2(0.0, epsilon), seedOffset);
	return length(vec2(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}

vec2 randomGB(vec2 p) {
	vec2 uv = floor(p) / 50.0 + 0.5;
	return texture(uNoiseTexture, fract(uv)).gb;
}

float crumpledNoise(vec2 t, float pw) {
	vec2 p = floor(t);
	float wsum = 0.0;
	float cl = 0.0;
	for (int y = -1; y < 2; y += 1) {
		for (int x = -1; x < 2; x += 1) {
			vec2 b = vec2(float(x), float(y));
			vec2 q = b + p;
			vec2 q2 = q - floor(q / 8.0) * 8.0;
			vec2 c = q + randomGB(q2);
			vec2 r = c - t;
			float w =
				pow(smoothstep(0.0, 1.0, 1.0 - abs(r.x)), pw) *
				pow(smoothstep(0.0, 1.0, 1.0 - abs(r.y)), pw);
			cl += (0.5 + 0.5 * sin((q2.x + q2.y * 5.0) * 8.0)) * w;
			wsum += w;
		}
	}
	return pow(wsum != 0.0 ? cl / wsum : 0.0, 0.5) * 2.0;
}

float crumplesShape(vec2 uv) {
	return crumpledNoise(uv * 0.25, 16.0) * crumpledNoise(uv * 0.5, 2.0);
}

vec2 folds(vec2 uv) {
	vec3 pp = vec3(0.0);
	float l = 9.0;
	for (float i = 0.0; i < 15.0; i++) {
		if (i >= uFoldCount) {
			break;
		}
		vec2 rand = randomGB(vec2(i, i * uSeed));
		float an = rand.x * TWO_PI;
		vec2 p = vec2(cos(an), sin(an)) * rand.y;
		float dist = distance(uv, p);
		l = min(l, dist);

		if (l == dist) {
			pp.xy = uv - p.xy;
			pp.z = dist;
		}
	}
	return mix(pp.xy, vec2(0.0), pow(pp.z, 0.25));
}

float drops(vec2 uv) {
	vec2 iDropsUV = floor(uv);
	vec2 fDropsUV = fract(uv);
	float dropsMinDist = 1.0;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 neighbor = vec2(float(i), float(j));
			vec2 offset = randomGB(iDropsUV + neighbor);
			offset = 0.5 + 0.5 * sin(10.0 * uSeed + TWO_PI * offset);
			vec2 pos = neighbor + offset - fDropsUV;
			float dist = length(pos);
			dropsMinDist = min(dropsMinDist, dropsMinDist * dist);
		}
	}
	return 1.0 - smoothstep(0.05, 0.09, pow(dropsMinDist, 0.5));
}

void main() {
	vec4 source = texture(uSource, vUv);
	float sourceAlpha = source.a;

	if (sourceAlpha <= 0.001 || uAmount <= 0.0) {
		fragColor = source;
		return;
	}

	vec3 sourceRgb = source.rgb / sourceAlpha;
	vec2 imageUV = vUv;
	vec2 patternUV = vUv - 0.5;
	patternUV /= max(uScale, 0.001);
	patternUV = 5.0 * (patternUV * vec2(uImageAspectRatio, 1.0));

	vec2 roughnessUv =
		1.5 * (gl_FragCoord.xy - 0.5 * uResolution) +
		128.0 * seedOffset(1.0);
	float roughness =
		roughnessNoise(roughnessUv + vec2(1.0, 0.0)) -
		roughnessNoise(roughnessUv - vec2(1.0, 0.0));

	vec2 crumplesUV =
		fract(patternUV * 0.02 / max(uCrumpleSize, 0.001) - uSeed) * 32.0;
	float crumples =
		uCrumples *
		(crumplesShape(crumplesUV + vec2(0.05, 0.0)) -
			crumplesShape(crumplesUV));

	vec2 fiberUV = 2.0 / max(uFiberSize, 0.001) * patternUV;
	float fiber = fiberNoise(fiberUV, 64.0 * seedOffset(2.0));
	fiber = 0.5 * uFiber * (fiber - 1.0);

	vec2 normal = vec2(0.0);
	vec2 normalImage = vec2(0.0);

	vec2 foldsUV = patternUV * 0.12;
	foldsUV = rotate(foldsUV, 4.0 * uSeed);
	vec2 w = folds(foldsUV);
	foldsUV = rotate(foldsUV + 0.007 * cos(uSeed), 0.01 * sin(uSeed));
	vec2 w2 = folds(foldsUV);

	float dropPattern = uDrops * drops(patternUV * 2.0);

	float fade = uFade * fbm(0.17 * patternUV + 10.0 * uSeed);
	fade = clamp(8.0 * fade * fade * fade, 0.0, 1.0);

	w = mix(w, vec2(0.0), fade);
	w2 = mix(w2, vec2(0.0), fade);
	crumples = mix(crumples, 0.0, fade);
	dropPattern = mix(dropPattern, 0.0, fade);
	fiber *= mix(1.0, 0.5, fade);
	roughness *= mix(1.0, 0.5, fade);

	normal.xy += uFolds * min(5.0 * uContrast, 1.0) * 4.0 * max(vec2(0.0), w + w2);
	normalImage.xy += uFolds * 2.0 * w;
	normal.xy += crumples;
	normalImage.xy += 1.5 * crumples;
	normal.xy += 3.0 * dropPattern;
	normalImage.xy += 0.2 * dropPattern;
	normal.xy += uRoughness * 1.5 * roughness;
	normal.xy += fiber;
	normalImage += uRoughness * 0.75 * roughness;
	normalImage += 0.2 * fiber;

	vec3 lightPos = vec3(1.0, 2.0, 1.0);
	float res = dot(
		normalize(vec3(normal, 9.5 - 9.0 * pow(uContrast, 0.1))),
		normalize(lightPos)
	);

	imageUV += 0.02 * normalImage;
	float frame = getUvFrame(imageUV);
	vec4 displacedSource = texture(uSource, clamp(imageUV, vec2(0.0), vec2(1.0)));
	vec3 displacedRgb = displacedSource.a > 0.001
		? displacedSource.rgb / displacedSource.a
		: sourceRgb;
	displacedRgb += 0.6 * pow(uContrast, 0.4) * (res - 0.7);

	vec3 frontRgb = mix(vec3(1.0), uColorFront.rgb, uColorFront.a);
	vec3 backRgb = mix(vec3(1.0), uColorBack.rgb, uColorBack.a);
	vec3 paperTone = mix(backRgb, frontRgb, clamp(res, 0.0, 1.0));
	vec3 texturedRgb = displacedRgb * (0.72 + 0.42 * res);
	texturedRgb = mix(texturedRgb, texturedRgb * paperTone, 0.65);
	texturedRgb -= 0.007 * dropPattern;
	texturedRgb = mix(sourceRgb, texturedRgb, frame);

	vec3 finalRgb = mix(sourceRgb, clamp(texturedRgb, 0.0, 1.0), uAmount);
	fragColor = vec4(finalRgb * sourceAlpha, sourceAlpha);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create WebGL shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Paper shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const linkProgram = (
	gl: WebGL2RenderingContext,
	vs: WebGLShader,
	fs: WebGLShader,
): WebGLProgram => {
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Paper program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createSourceTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create WebGL texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const initialNoiseState = (seed: number): number => {
	const scaledSeed = Math.round(seed * 1000);
	const mixedState = (0x9e3779b9 ^ Math.imul(scaledSeed, 0x85ebca6b)) >>> 0;
	return mixedState === 0 ? 0x9e3779b9 : mixedState;
};

const nextNoiseState = (state: number): number => {
	let next = state;
	next ^= next << 13;
	next ^= next >>> 17;
	next ^= next << 5;
	return next >>> 0;
};

const createNoiseData = (seed: number): Uint8Array => {
	const data = new Uint8Array(NOISE_TEXTURE_SIZE * NOISE_TEXTURE_SIZE * 4);
	let state = initialNoiseState(seed);
	for (let i = 0; i < data.length; i += 4) {
		state = nextNoiseState(state);
		data[i] = state & 0xff;
		state = nextNoiseState(state);
		data[i + 1] = state & 0xff;
		state = nextNoiseState(state);
		data[i + 2] = state & 0xff;
		data[i + 3] = 255;
	}

	return data;
};

const uploadNoiseTexture = (
	gl: WebGL2RenderingContext,
	texture: WebGLTexture,
	seed: number,
): void => {
	const data = createNoiseData(seed);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		NOISE_TEXTURE_SIZE,
		NOISE_TEXTURE_SIZE,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		data,
	);
};

const createNoiseTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create WebGL noise texture');
	}

	uploadNoiseTexture(gl, texture, DEFAULT_SEED);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupPaper = (target: HTMLCanvasElement): PaperState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('paper effect');
	}

	const vs = compileShader(gl, gl.VERTEX_SHADER, PAPER_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, PAPER_FS);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create WebGL vertex array');
	}

	gl.bindVertexArray(vao);

	const data = new Float32Array([
		-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
	]);

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create WebGL buffer');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	const aPos = gl.getAttribLocation(program, 'aPos');
	const aUv = gl.getAttribLocation(program, 'aUv');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(aUv);
	gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

	gl.bindVertexArray(null);

	const sourceTexture = createSourceTexture(gl);
	const noiseTexture = createNoiseTexture(gl);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for color parsing');
	}

	return {
		gl,
		program,
		vao,
		vbo,
		sourceTexture,
		noiseTexture,
		uSource: gl.getUniformLocation(program, 'uSource'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uImageAspectRatio: gl.getUniformLocation(program, 'uImageAspectRatio'),
		uColorFront: gl.getUniformLocation(program, 'uColorFront'),
		uColorBack: gl.getUniformLocation(program, 'uColorBack'),
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uContrast: gl.getUniformLocation(program, 'uContrast'),
		uRoughness: gl.getUniformLocation(program, 'uRoughness'),
		uFiber: gl.getUniformLocation(program, 'uFiber'),
		uFiberSize: gl.getUniformLocation(program, 'uFiberSize'),
		uCrumples: gl.getUniformLocation(program, 'uCrumples'),
		uCrumpleSize: gl.getUniformLocation(program, 'uCrumpleSize'),
		uFolds: gl.getUniformLocation(program, 'uFolds'),
		uFoldCount: gl.getUniformLocation(program, 'uFoldCount'),
		uDrops: gl.getUniformLocation(program, 'uDrops'),
		uFade: gl.getUniformLocation(program, 'uFade'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
		uScale: gl.getUniformLocation(program, 'uScale'),
		uNoiseTexture: gl.getUniformLocation(program, 'uNoiseTexture'),
		colorCtx,
		cachedColorFront: '',
		cachedColorFrontRgba: [159, 173, 188, 255],
		cachedColorBack: '',
		cachedColorBackRgba: [255, 255, 255, 255],
		cachedNoiseSeed: DEFAULT_SEED,
	};
};

const normalizedRgba = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => {
	return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
};

export const paper = createEffect<PaperParams, PaperState>({
	type: 'dev.remotion.effects.paper',
	label: 'paper()',
	documentationLink: 'https://www.remotion.dev/docs/effects/paper',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `paper-${r.amount}-${r.colorFront}-${r.colorBack}-${r.contrast}-${r.roughness}-${r.fiber}-${r.fiberSize}-${r.crumples}-${r.crumpleSize}-${r.folds}-${r.foldCount}-${r.drops}-${r.fade}-${r.seed}-${r.scale}`;
	},
	setup: (target) => setupPaper(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, sourceTexture, noiseTexture} = state;
		if (state.cachedColorFront !== r.colorFront) {
			state.cachedColorFront = r.colorFront;
			state.cachedColorFrontRgba = parseColorRgba(state.colorCtx, r.colorFront);
		}

		if (state.cachedColorBack !== r.colorBack) {
			state.cachedColorBack = r.colorBack;
			state.cachedColorBackRgba = parseColorRgba(state.colorCtx, r.colorBack);
		}

		const [frontRed, frontGreen, frontBlue, frontAlpha] = normalizedRgba(
			state.cachedColorFrontRgba,
		);
		const [backRed, backGreen, backBlue, backAlpha] = normalizedRgba(
			state.cachedColorBackRgba,
		);

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
		if (state.cachedNoiseSeed !== r.seed) {
			uploadNoiseTexture(gl, noiseTexture, r.seed);
			state.cachedNoiseSeed = r.seed;
		}

		if (state.uSource) gl.uniform1i(state.uSource, 0);
		if (state.uResolution) gl.uniform2f(state.uResolution, width, height);
		if (state.uImageAspectRatio)
			gl.uniform1f(state.uImageAspectRatio, width / height);
		if (state.uColorFront)
			gl.uniform4f(
				state.uColorFront,
				frontRed,
				frontGreen,
				frontBlue,
				frontAlpha,
			);
		if (state.uColorBack)
			gl.uniform4f(state.uColorBack, backRed, backGreen, backBlue, backAlpha);
		if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);
		if (state.uContrast) gl.uniform1f(state.uContrast, r.contrast);
		if (state.uRoughness) gl.uniform1f(state.uRoughness, r.roughness);
		if (state.uFiber) gl.uniform1f(state.uFiber, r.fiber);
		if (state.uFiberSize) gl.uniform1f(state.uFiberSize, r.fiberSize);
		if (state.uCrumples) gl.uniform1f(state.uCrumples, r.crumples);
		if (state.uCrumpleSize) gl.uniform1f(state.uCrumpleSize, r.crumpleSize);
		if (state.uFolds) gl.uniform1f(state.uFolds, r.folds);
		if (state.uFoldCount) gl.uniform1f(state.uFoldCount, r.foldCount);
		if (state.uDrops) gl.uniform1f(state.uDrops, r.drops);
		if (state.uFade) gl.uniform1f(state.uFade, r.fade);
		if (state.uSeed) gl.uniform1f(state.uSeed, r.seed);
		if (state.uScale) gl.uniform1f(state.uScale, r.scale);
		if (state.uNoiseTexture) gl.uniform1i(state.uNoiseTexture, 1);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, sourceTexture, noiseTexture}) => {
		gl.deleteTexture(sourceTexture);
		gl.deleteTexture(noiseTexture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: paperSchema,
	validateParams: validatePaperParams,
});
