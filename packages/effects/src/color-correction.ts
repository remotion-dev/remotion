import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	COLOR_SPACE_GLSL,
	SHADOWS_HIGHLIGHTS_GLSL,
	VIBRANCE_GLSL,
	WHITE_BALANCE_GLSL,
} from './color-correction-shader-utils.js';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateSignedUnitInterval,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_EXPOSURE = 0 as const;
const DEFAULT_CONTRAST = 1 as const;
const DEFAULT_PIVOT = 0.5 as const;
const DEFAULT_SHADOWS = 0 as const;
const DEFAULT_HIGHLIGHTS = 0 as const;
const DEFAULT_WHITES = 0 as const;
const DEFAULT_BLACKS = 0 as const;
const DEFAULT_TEMPERATURE = 0 as const;
const DEFAULT_TINT = 0 as const;
const DEFAULT_SATURATION = 1 as const;
const DEFAULT_VIBRANCE = 0 as const;
const MIN_EXPOSURE = -5 as const;
const MAX_EXPOSURE = 5 as const;

const signedAdjustmentSchema = (description: string) =>
	({
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 0,
		description,
		hiddenFromList: false,
	}) as const;

const colorCorrectionSchema = {
	exposure: {
		type: 'number',
		min: MIN_EXPOSURE,
		max: MAX_EXPOSURE,
		step: 0.1,
		default: DEFAULT_EXPOSURE,
		description: 'Exposure',
		hiddenFromList: false,
	},
	contrast: {
		type: 'number',
		min: 0,
		max: 3,
		step: 0.01,
		default: DEFAULT_CONTRAST,
		description: 'Contrast',
		hiddenFromList: false,
	},
	pivot: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PIVOT,
		description: 'Contrast pivot',
		hiddenFromList: false,
	},
	shadows: signedAdjustmentSchema('Shadows'),
	highlights: signedAdjustmentSchema('Highlights'),
	whites: signedAdjustmentSchema('Whites'),
	blacks: signedAdjustmentSchema('Blacks'),
	temperature: signedAdjustmentSchema('Temperature'),
	tint: signedAdjustmentSchema('Tint'),
	saturation: {
		type: 'number',
		min: 0,
		max: 3,
		step: 0.01,
		default: DEFAULT_SATURATION,
		description: 'Saturation',
		hiddenFromList: false,
	},
	vibrance: signedAdjustmentSchema('Vibrance'),
} as const satisfies InteractivitySchema;

export type ColorCorrectionParams = {
	/** Exposure adjustment in stops, from `-5` to `5`. Defaults to `0`. */
	readonly exposure?: number;
	/** Contrast multiplier. Defaults to `1`. */
	readonly contrast?: number;
	/** Contrast pivot from `0` to `1`. Defaults to `0.5`. */
	readonly pivot?: number;
	/** Shadow adjustment from `-1` to `1`. Defaults to `0`. */
	readonly shadows?: number;
	/** Highlight adjustment from `-1` to `1`. Defaults to `0`. */
	readonly highlights?: number;
	/** White-region adjustment from `-1` to `1`. Defaults to `0`. */
	readonly whites?: number;
	/** Black-region adjustment from `-1` to `1`. Defaults to `0`. */
	readonly blacks?: number;
	/** Blue-to-amber temperature adjustment from `-1` to `1`. Defaults to `0`. */
	readonly temperature?: number;
	/** Green-to-magenta tint adjustment from `-1` to `1`. Defaults to `0`. */
	readonly tint?: number;
	/** Saturation multiplier. Defaults to `1`. */
	readonly saturation?: number;
	/** Vibrance adjustment from `-1` to `1`. Defaults to `0`. */
	readonly vibrance?: number;
};

type ColorCorrectionResolved = Required<ColorCorrectionParams>;

type ColorCorrectionState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uExposure: WebGLUniformLocation | null;
		readonly uContrast: WebGLUniformLocation | null;
		readonly uPivot: WebGLUniformLocation | null;
		readonly uShadows: WebGLUniformLocation | null;
		readonly uHighlights: WebGLUniformLocation | null;
		readonly uWhites: WebGLUniformLocation | null;
		readonly uBlacks: WebGLUniformLocation | null;
		readonly uTemperature: WebGLUniformLocation | null;
		readonly uTint: WebGLUniformLocation | null;
		readonly uSaturation: WebGLUniformLocation | null;
		readonly uVibrance: WebGLUniformLocation | null;
	};
};

const resolve = (params: ColorCorrectionParams): ColorCorrectionResolved => ({
	exposure: params.exposure ?? DEFAULT_EXPOSURE,
	contrast: params.contrast ?? DEFAULT_CONTRAST,
	pivot: params.pivot ?? DEFAULT_PIVOT,
	shadows: params.shadows ?? DEFAULT_SHADOWS,
	highlights: params.highlights ?? DEFAULT_HIGHLIGHTS,
	whites: params.whites ?? DEFAULT_WHITES,
	blacks: params.blacks ?? DEFAULT_BLACKS,
	temperature: params.temperature ?? DEFAULT_TEMPERATURE,
	tint: params.tint ?? DEFAULT_TINT,
	saturation: params.saturation ?? DEFAULT_SATURATION,
	vibrance: params.vibrance ?? DEFAULT_VIBRANCE,
});

const validateColorCorrectionParams = (params: ColorCorrectionParams): void => {
	assertEffectParamsObject(params, 'Color correction');
	assertOptionalFiniteNumber(params.exposure, 'exposure');
	assertOptionalFiniteNumber(params.contrast, 'contrast');
	assertOptionalFiniteNumber(params.pivot, 'pivot');
	assertOptionalFiniteNumber(params.shadows, 'shadows');
	assertOptionalFiniteNumber(params.highlights, 'highlights');
	assertOptionalFiniteNumber(params.whites, 'whites');
	assertOptionalFiniteNumber(params.blacks, 'blacks');
	assertOptionalFiniteNumber(params.temperature, 'temperature');
	assertOptionalFiniteNumber(params.tint, 'tint');
	assertOptionalFiniteNumber(params.saturation, 'saturation');
	assertOptionalFiniteNumber(params.vibrance, 'vibrance');

	const resolved = resolve(params);
	if (resolved.exposure < MIN_EXPOSURE) {
		throw new TypeError(
			`"exposure" must be >= ${MIN_EXPOSURE}, but got ${JSON.stringify(resolved.exposure)}`,
		);
	}

	if (resolved.exposure > MAX_EXPOSURE) {
		throw new TypeError(
			`"exposure" must be <= ${MAX_EXPOSURE}, but got ${JSON.stringify(resolved.exposure)}`,
		);
	}

	validateNonNegative(resolved.contrast, 'contrast');
	validateUnitInterval(resolved.pivot, 'pivot');
	validateSignedUnitInterval(resolved.shadows, 'shadows');
	validateSignedUnitInterval(resolved.highlights, 'highlights');
	validateSignedUnitInterval(resolved.whites, 'whites');
	validateSignedUnitInterval(resolved.blacks, 'blacks');
	validateSignedUnitInterval(resolved.temperature, 'temperature');
	validateSignedUnitInterval(resolved.tint, 'tint');
	validateNonNegative(resolved.saturation, 'saturation');
	validateSignedUnitInterval(resolved.vibrance, 'vibrance');
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uExposure;
uniform float uContrast;
uniform float uPivot;
uniform float uShadows;
uniform float uHighlights;
uniform float uWhites;
uniform float uBlacks;
uniform float uTemperature;
uniform float uTint;
uniform float uSaturation;
uniform float uVibrance;

${COLOR_SPACE_GLSL}
${WHITE_BALANCE_GLSL}
${SHADOWS_HIGHLIGHTS_GLSL}
${VIBRANCE_GLSL}

vec3 applyEndpointTones(vec3 color, float blacks, float whites) {
	float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float blackWeight = 1.0 - smoothstep(0.0, 0.35, luminance);
	float whiteWeight = smoothstep(0.65, 1.0, luminance);
	blackWeight *= blackWeight;
	whiteWeight *= whiteWeight;

	// Moving tones toward their named endpoint uses the full adjustment.
	// Moving them away is damped to avoid flattening the image too aggressively.
	if (blacks >= 0.0) {
		color += (vec3(1.0) - color) * blacks * blackWeight * 0.2;
	} else {
		color *= 1.0 + blacks * blackWeight;
	}

	if (whites >= 0.0) {
		color += (vec3(1.0) - color) * whites * whiteWeight;
	} else {
		color *= 1.0 + whites * whiteWeight * 0.2;
	}

	return clamp(color, 0.0, 1.0);
}

void main() {
	vec4 sourceColor = texture(uSource, vUv);
	float alpha = sourceColor.a;

	if (alpha <= 0.0) {
		fragColor = vec4(0.0);
		return;
	}

	if (
		uExposure == 0.0 &&
		uContrast == 1.0 &&
		uPivot == 0.5 &&
		uShadows == 0.0 &&
		uHighlights == 0.0 &&
		uWhites == 0.0 &&
		uBlacks == 0.0 &&
		uTemperature == 0.0 &&
		uTint == 0.0 &&
		uSaturation == 1.0 &&
		uVibrance == 0.0
	) {
		fragColor = sourceColor;
		return;
	}

	vec3 color = sourceColor.rgb / alpha;
	vec3 linear = srgbToLinear(color) * exp2(uExposure);
	linear = applyWhiteBalanceLinear(linear, uTemperature, uTint);
	color = linearToSrgb(linear);

	float tonalStops = getShadowsHighlightsStops(
		color,
		uShadows,
		uHighlights
	);
	linear = srgbToLinear(color) * exp2(tonalStops);
	color = linearToSrgb(linear);
	color = applyEndpointTones(color, uBlacks, uWhites);
	color = clamp((color - vec3(uPivot)) * uContrast + vec3(uPivot), 0.0, 1.0);

	float luminance = dot(color, vec3(0.213, 0.715, 0.072));
	color = clamp(
		vec3(luminance) + (color - vec3(luminance)) * uSaturation,
		0.0,
		1.0
	);
	color = applyVibrance(color, uVibrance);

	fragColor = vec4(color * alpha, alpha);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create color correction shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(
			`Color correction shader compile failed: ${log ?? '(no log)'}`,
		);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create color correction shader program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(
			`Color correction shader link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create color correction texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupColorCorrection = (
	target: HTMLCanvasElement,
): ColorCorrectionState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('color correction effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl);
	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create color correction vertex array');
	}

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create color correction vertex buffer');
	}

	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);

	const aPos = gl.getAttribLocation(program, 'aPos');
	const aUv = gl.getAttribLocation(program, 'aUv');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(aUv);
	gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
	gl.bindVertexArray(null);

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource: createTexture(gl),
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uExposure: gl.getUniformLocation(program, 'uExposure'),
			uContrast: gl.getUniformLocation(program, 'uContrast'),
			uPivot: gl.getUniformLocation(program, 'uPivot'),
			uShadows: gl.getUniformLocation(program, 'uShadows'),
			uHighlights: gl.getUniformLocation(program, 'uHighlights'),
			uWhites: gl.getUniformLocation(program, 'uWhites'),
			uBlacks: gl.getUniformLocation(program, 'uBlacks'),
			uTemperature: gl.getUniformLocation(program, 'uTemperature'),
			uTint: gl.getUniformLocation(program, 'uTint'),
			uSaturation: gl.getUniformLocation(program, 'uSaturation'),
			uVibrance: gl.getUniformLocation(program, 'uVibrance'),
		},
	};
};

export const colorCorrection = createEffect<
	ColorCorrectionParams,
	ColorCorrectionState
>({
	type: 'remotion/color-correction',
	label: 'colorCorrection()',
	documentationLink: 'https://www.remotion.dev/docs/effects/color-correction',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `color-correction-${r.exposure}-${r.contrast}-${r.pivot}-${r.shadows}-${r.highlights}-${r.whites}-${r.blacks}-${r.temperature}-${r.tint}-${r.saturation}-${r.vibrance}`;
	},
	setup: setupColorCorrection,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, textureSource, uniforms, vao} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textureSource);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		gl.useProgram(program);
		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uExposure) gl.uniform1f(uniforms.uExposure, r.exposure);
		if (uniforms.uContrast) gl.uniform1f(uniforms.uContrast, r.contrast);
		if (uniforms.uPivot) gl.uniform1f(uniforms.uPivot, r.pivot);
		if (uniforms.uShadows) gl.uniform1f(uniforms.uShadows, r.shadows);
		if (uniforms.uHighlights) {
			gl.uniform1f(uniforms.uHighlights, r.highlights);
		}

		if (uniforms.uWhites) gl.uniform1f(uniforms.uWhites, r.whites);
		if (uniforms.uBlacks) gl.uniform1f(uniforms.uBlacks, r.blacks);
		if (uniforms.uTemperature) {
			gl.uniform1f(uniforms.uTemperature, r.temperature);
		}

		if (uniforms.uTint) gl.uniform1f(uniforms.uTint, r.tint);
		if (uniforms.uSaturation) {
			gl.uniform1f(uniforms.uSaturation, r.saturation);
		}

		if (uniforms.uVibrance) gl.uniform1f(uniforms.uVibrance, r.vibrance);

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, textureSource}) => {
		gl.deleteTexture(textureSource);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: colorCorrectionSchema,
	validateParams: validateColorCorrectionParams,
});
