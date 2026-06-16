import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 1 as const;
const DEFAULT_DISPLACEMENT = 5 as const;
const DEFAULT_HIGHLIGHT_INTENSITY = 0.75 as const;
const DEFAULT_WRINKLE_DENSITY = 0.42 as const;
const DEFAULT_EDGE_TENSION = 0.45 as const;
const DEFAULT_PHASE = 0 as const;
const DEFAULT_SEED = 0 as const;

const shrinkwrapSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	displacement: {
		type: 'number',
		min: 0,
		max: 30,
		step: 0.1,
		default: DEFAULT_DISPLACEMENT,
		description: 'Displacement',
		hiddenFromList: false,
	},
	highlightIntensity: {
		type: 'number',
		min: 0,
		max: 2,
		step: 0.01,
		default: DEFAULT_HIGHLIGHT_INTENSITY,
		description: 'Highlight intensity',
		hiddenFromList: false,
	},
	wrinkleDensity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_WRINKLE_DENSITY,
		description: 'Wrinkle density',
		hiddenFromList: false,
	},
	edgeTension: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_EDGE_TENSION,
		description: 'Edge tension',
		hiddenFromList: false,
	},
	phase: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_PHASE,
		description: 'Phase',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type ShrinkwrapParams = {
	/** Strength of the shrinkwrap layer from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
	/** Pixel displacement caused by the plastic wrinkles. Defaults to `5`. */
	readonly displacement?: number;
	/** Brightness of the glossy highlights. Defaults to `0.75`. */
	readonly highlightIntensity?: number;
	/** Amount of small procedural wrinkles from `0` to `1`. Defaults to `0.42`. */
	readonly wrinkleDensity?: number;
	/** Strength of stretched edge highlights from `0` to `1`. Defaults to `0.45`. */
	readonly edgeTension?: number;
	/** Offset into the continuous wrinkle field. Defaults to `0`. */
	readonly phase?: number;
	/** Seed for the deterministic wrinkle pattern. Defaults to `0`. */
	readonly seed?: number;
};

type ShrinkwrapResolved = {
	amount: number;
	displacement: number;
	highlightIntensity: number;
	wrinkleDensity: number;
	edgeTension: number;
	phase: number;
	seed: number;
};

const resolve = (p: ShrinkwrapParams): ShrinkwrapResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	displacement: p.displacement ?? DEFAULT_DISPLACEMENT,
	highlightIntensity: p.highlightIntensity ?? DEFAULT_HIGHLIGHT_INTENSITY,
	wrinkleDensity: p.wrinkleDensity ?? DEFAULT_WRINKLE_DENSITY,
	edgeTension: p.edgeTension ?? DEFAULT_EDGE_TENSION,
	phase: p.phase ?? DEFAULT_PHASE,
	seed: p.seed ?? DEFAULT_SEED,
});

const validateShrinkwrapParams = (params: ShrinkwrapParams): void => {
	assertEffectParamsObject(params, 'Shrinkwrap');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.displacement, 'displacement');
	assertOptionalFiniteNumber(params.highlightIntensity, 'highlightIntensity');
	assertOptionalFiniteNumber(params.wrinkleDensity, 'wrinkleDensity');
	assertOptionalFiniteNumber(params.edgeTension, 'edgeTension');
	assertOptionalFiniteNumber(params.phase, 'phase');
	assertOptionalFiniteNumber(params.seed, 'seed');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validateNonNegative(r.displacement, 'displacement');
	validateNonNegative(r.highlightIntensity, 'highlightIntensity');
	validateUnitInterval(r.wrinkleDensity, 'wrinkleDensity');
	validateUnitInterval(r.edgeTension, 'edgeTension');
};

type ShrinkwrapState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uDisplacement: WebGLUniformLocation | null;
	readonly uHighlightIntensity: WebGLUniformLocation | null;
	readonly uWrinkleDensity: WebGLUniformLocation | null;
	readonly uEdgeTension: WebGLUniformLocation | null;
	readonly uPhase: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
};

const SHRINKWRAP_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SHRINKWRAP_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uDisplacement;
uniform float uHighlightIntensity;
uniform float uWrinkleDensity;
uniform float uEdgeTension;
uniform float uPhase;
uniform float uSeed;

float hash21(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1871));
	p3 += dot(p3, p3.yzx + 19.19 + uSeed * 0.131);
	return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);

	float a = hash21(i);
	float b = hash21(i + vec2(1.0, 0.0));
	float c = hash21(i + vec2(0.0, 1.0));
	float d = hash21(i + vec2(1.0, 1.0));

	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;

	for (int i = 0; i < 4; i++) {
		value += valueNoise(p) * amplitude;
		p = p * 2.03 + vec2(17.1, 31.7);
		amplitude *= 0.5;
	}

	return value;
}

mat2 rotate2d(float angle) {
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c, -s, s, c);
}

vec2 phaseVec(float xFactor, float yFactor) {
	return vec2(uPhase * xFactor, uPhase * yFactor);
}

vec2 warpVec(vec2 p, float scale, float amount, float seedOffset) {
	return vec2(
		fbm(p / scale + phaseVec(0.21, 0.13) + vec2(seedOffset, 1.7)) - 0.5,
		fbm(p / scale + phaseVec(-0.17, 0.29) + vec2(seedOffset + 9.1, 6.4))
			- 0.5
	) * amount;
}

float bandField(float coord, float spacing, float width) {
	float centered = abs(fract(coord / spacing) - 0.5) * spacing;
	return 1.0 - smoothstep(width, width * 3.8, centered);
}

float curvedFoldField(
	vec2 px,
	float baseAngle,
	float spacing,
	float width,
	float seedOffset
) {
	float angleNoise =
		(fbm(px / (spacing * 5.8) + phaseVec(0.08, -0.11) + vec2(seedOffset, 3.1))
			- 0.5) * 1.35;
	vec2 warped = px + warpVec(
		px + vec2(seedOffset * 13.0, seedOffset * 7.0),
		spacing * 5.4,
		spacing * 0.95,
		seedOffset
	);
	vec2 q = rotate2d(baseAngle + angleNoise) * warped;
	float phase =
		(fbm(q / (spacing * 3.4) + phaseVec(-0.14, 0.19) + vec2(seedOffset, 8.6))
			- 0.5) * spacing * 1.3;
	float band = bandField(q.y + phase, spacing, width);
	float breakup = smoothstep(
		0.24,
		0.88,
		fbm(
			vec2(q.x / (spacing * 2.6), q.y / (spacing * 7.5)) +
				phaseVec(0.12, 0.07) +
				vec2(seedOffset)
		)
	);
	float softness =
		0.65 +
		fbm(q / (spacing * 8.2) + phaseVec(-0.05, 0.16) + vec2(seedOffset, 2.3)) *
			0.35;

	return band * breakup * softness;
}

float edgeMask(vec2 uv) {
	vec2 pxFromEdge = min(uv, 1.0 - uv) * uResolution;
	float minSide = min(uResolution.x, uResolution.y);
	float side = 1.0 - smoothstep(0.0, minSide * 0.16, min(pxFromEdge.x, pxFromEdge.y));
	float corner = 1.0 - smoothstep(
		0.0,
		minSide * 0.23,
		length(pxFromEdge)
	);

	return clamp(side * 0.55 + corner * 0.85, 0.0, 1.0);
}

float heightMap(vec2 uv) {
	vec2 px = uv * uResolution;
	float minSide = min(uResolution.x, uResolution.y);
	float density = clamp(uWrinkleDensity, 0.0, 1.0);
	float spacing = mix(minSide * 0.31, minSide * 0.13, density);
	float width = mix(minSide * 0.03, minSide * 0.013, density);

	vec2 broadWarp = warpVec(px, minSide * 0.42, minSide * 0.06, uSeed + 1.0);
	vec2 detailWarp = warpVec(px, minSide * 0.17, minSide * 0.018, uSeed + 6.0);
	vec2 warpedPx = px + broadWarp + detailWarp;

	float h =
		(fbm(warpedPx / (minSide * 0.26) + phaseVec(0.11, -0.09) + vec2(uSeed * 0.17))
			- 0.5) * 0.08;
	float broadFold = curvedFoldField(warpedPx, -0.74, spacing * 1.0, width, 3.1);
	float crossFold = curvedFoldField(
		warpedPx + broadWarp * 0.7,
		0.31,
		spacing * 1.9,
		width * 1.55,
		9.7
	);
	float microFold = curvedFoldField(
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
						vec2(uSeed * 0.3)
				) *
					2.0 -
					1.0
			)) * 0.018;

	float edge = edgeMask(uv) * clamp(uEdgeTension, 0.0, 1.0);
	float edgeNoise =
		fbm(warpedPx / (minSide * 0.18) + phaseVec(0.18, 0.21) + vec2(uSeed * 0.41, 8.0));
	h += edge * (0.16 + edgeNoise * 0.11);

	return h;
}

void main() {
	if (uAmount <= 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}

	vec2 texel = 1.0 / uResolution;
	float left = heightMap(vUv - vec2(texel.x, 0.0));
	float right = heightMap(vUv + vec2(texel.x, 0.0));
	float down = heightMap(vUv - vec2(0.0, texel.y));
	float up = heightMap(vUv + vec2(0.0, texel.y));
	vec2 gradient = vec2(right - left, up - down);
	float reliefScale = mix(42.0, 115.0, uWrinkleDensity);
	float warpStrength = reliefScale * 0.32;

	vec2 sampleOffset = gradient * warpStrength * uDisplacement * uAmount;
	vec2 sampleUv = clamp(vUv - sampleOffset * texel, vec2(0.0), vec2(1.0));
	vec4 source = texture(uSource, sampleUv);

	float alpha = source.a;
	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 rgb = source.rgb / alpha;
	vec3 normal = normalize(vec3(-gradient * reliefScale, 1.0));
	vec3 light = normalize(vec3(-0.42, 0.58, 0.72));
	vec3 halfVector = normalize(light + vec3(0.0, 0.0, 1.0));
	float specular = pow(max(dot(normal, halfVector), 0.0), 24.0);
	float directional = dot(gradient, normalize(vec2(-0.45, 0.72)));
	float creaseHighlight = smoothstep(0.02, 0.07, directional);
	float creaseShadow = smoothstep(0.02, 0.07, -directional);
	float edge = edgeMask(vUv) * uEdgeTension;
	float edgeGlint = edge * smoothstep(
		0.35,
		0.95,
		fbm(vUv * uResolution / 90.0 + phaseVec(0.31, -0.24) + vec2(uSeed))
	);

	float highlight = clamp(
		(specular * 0.55 + creaseHighlight * 0.4 + edgeGlint * 0.18)
			* uHighlightIntensity
			* uAmount,
		0.0,
		1.15
	);
	float shadow = clamp((creaseShadow * 0.1 + edge * 0.06) * uAmount, 0.0, 0.25);

	rgb *= 1.0 - shadow;
	rgb += (1.0 - rgb) * min(highlight, 1.0);
	rgb += vec3(max(highlight - 1.0, 0.0)) * 0.35;

	fragColor = vec4(clamp(rgb, 0.0, 1.0) * alpha, alpha);
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
		throw new Error(`Shrinkwrap shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Shrinkwrap program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const shrinkwrap = createEffect<ShrinkwrapParams, ShrinkwrapState>({
	type: 'dev.remotion.effects.shrinkwrap',
	label: 'shrinkwrap()',
	documentationLink: 'https://www.remotion.dev/docs/effects/shrinkwrap',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `shrinkwrap-${r.amount}-${r.displacement}-${r.highlightIntensity}-${r.wrinkleDensity}-${r.edgeTension}-${r.phase}-${r.seed}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('shrinkwrap effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, SHRINKWRAP_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, SHRINKWRAP_FS);
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

		const texture = gl.createTexture();
		if (!texture) {
			throw new Error('Failed to create WebGL texture');
		}

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return {
			gl,
			program,
			vao,
			vbo,
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uAmount: gl.getUniformLocation(program, 'uAmount'),
			uDisplacement: gl.getUniformLocation(program, 'uDisplacement'),
			uHighlightIntensity: gl.getUniformLocation(
				program,
				'uHighlightIntensity',
			),
			uWrinkleDensity: gl.getUniformLocation(program, 'uWrinkleDensity'),
			uEdgeTension: gl.getUniformLocation(program, 'uEdgeTension'),
			uPhase: gl.getUniformLocation(program, 'uPhase'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		if (state.uSource) gl.uniform1i(state.uSource, 0);
		if (state.uResolution) gl.uniform2f(state.uResolution, width, height);
		if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);
		if (state.uDisplacement) gl.uniform1f(state.uDisplacement, r.displacement);
		if (state.uHighlightIntensity)
			gl.uniform1f(state.uHighlightIntensity, r.highlightIntensity);
		if (state.uWrinkleDensity)
			gl.uniform1f(state.uWrinkleDensity, r.wrinkleDensity);
		if (state.uEdgeTension) gl.uniform1f(state.uEdgeTension, r.edgeTension);
		if (state.uPhase) gl.uniform1f(state.uPhase, r.phase);
		if (state.uSeed) gl.uniform1f(state.uSeed, r.seed);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
		gl.deleteTexture(texture);
	},
	schema: shrinkwrapSchema,
	validateParams: validateShrinkwrapParams,
});
