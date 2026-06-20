import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateUnitInterval,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_COLOR = '#00ff38' as const;
const DEFAULT_BACKGROUND_COLOR = '#021506' as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_RAY_COUNT = 96 as const;
const DEFAULT_SHARPNESS = 10 as const;
const DEFAULT_INTENSITY = 1 as const;
const DEFAULT_AMOUNT = 1 as const;
const DEFAULT_ROTATION = 0 as const;
const DEFAULT_RADIUS_FALLOFF = 0.55 as const;
const DEFAULT_PHASE = 0 as const;
const DEFAULT_RANDOMNESS = 0.55 as const;
const BASE_THICKNESS = 0.35 as const;
const BASE_LENGTH = 0.85 as const;

const laserRaysSchema = {
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
	backgroundColor: {
		type: 'color',
		default: DEFAULT_BACKGROUND_COLOR,
		description: 'Background color',
	},
	center: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
	rayCount: {
		type: 'number',
		min: 1,
		max: 300,
		step: 1,
		default: DEFAULT_RAY_COUNT,
		description: 'Ray count',
		hiddenFromList: false,
	},
	sharpness: {
		type: 'number',
		min: 0.1,
		max: 40,
		step: 0.1,
		default: DEFAULT_SHARPNESS,
		description: 'Sharpness',
		hiddenFromList: false,
	},
	intensity: {
		type: 'number',
		min: 0,
		max: 3,
		step: 0.01,
		default: DEFAULT_INTENSITY,
		description: 'Intensity',
		hiddenFromList: false,
	},
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	rotation: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
	},
	radiusFalloff: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_RADIUS_FALLOFF,
		description: 'Radius falloff',
		hiddenFromList: false,
	},
	phase: {
		type: 'number',
		step: 1,
		default: DEFAULT_PHASE,
		description: 'Phase',
		hiddenFromList: false,
	},
	randomness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_RANDOMNESS,
		description: 'Randomness',
		hiddenFromList: false,
	},
} as const satisfies SequenceSchema;

export type LaserRaysCenter = readonly [number, number];

export type LaserRaysParams = {
	/** Main color of the laser rays. Defaults to green. */
	readonly color?: string;
	/** Base color between the rays. Defaults to dark green. */
	readonly backgroundColor?: string;
	/** Origin of the rays, normalized from `0` to `1` in x/y. */
	readonly center?: LaserRaysCenter;
	/** Number of radial rays. Defaults to `96`. */
	readonly rayCount?: number;
	/** Contrast of each ray edge. Defaults to `10`. */
	readonly sharpness?: number;
	/** Brightness multiplier for the generated rays. Defaults to `1`. */
	readonly intensity?: number;
	/** Blend amount from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
	/** Rotation of the ray field in degrees. Defaults to `0`. */
	readonly rotation?: number;
	/** How much the rays dim toward the edges from `0` to `1`. Defaults to `0.55`. */
	readonly radiusFalloff?: number;
	/** Radial offset in pixels. Animate to move the rays outward. Defaults to `0`. */
	readonly phase?: number;
	/** Per-ray variation in width, brightness, and reach from `0` to `1`. Defaults to `0.55`. */
	readonly randomness?: number;
};

type LaserRaysResolved = {
	readonly color: string;
	readonly backgroundColor: string;
	readonly center: LaserRaysCenter;
	readonly rayCount: number;
	readonly sharpness: number;
	readonly intensity: number;
	readonly amount: number;
	readonly rotation: number;
	readonly radiusFalloff: number;
	readonly phase: number;
	readonly randomness: number;
};

type LaserRaysState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly colorCtx: CanvasRenderingContext2D;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uColor: WebGLUniformLocation | null;
		readonly uBackgroundColor: WebGLUniformLocation | null;
		readonly uCenter: WebGLUniformLocation | null;
		readonly uRayCount: WebGLUniformLocation | null;
		readonly uSharpness: WebGLUniformLocation | null;
		readonly uIntensity: WebGLUniformLocation | null;
		readonly uAmount: WebGLUniformLocation | null;
		readonly uRotation: WebGLUniformLocation | null;
		readonly uRadiusFalloff: WebGLUniformLocation | null;
		readonly uPhase: WebGLUniformLocation | null;
		readonly uRandomness: WebGLUniformLocation | null;
	};
	cachedColorStr: string;
	cachedColorRgba: ParsedColorRgba;
	cachedBackgroundColorStr: string;
	cachedBackgroundColorRgba: ParsedColorRgba;
};

const resolve = (p: LaserRaysParams): LaserRaysResolved => ({
	color: p.color ?? DEFAULT_COLOR,
	backgroundColor: p.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
	center: [...(p.center ?? DEFAULT_CENTER)] as LaserRaysCenter,
	rayCount: p.rayCount ?? DEFAULT_RAY_COUNT,
	sharpness: p.sharpness ?? DEFAULT_SHARPNESS,
	intensity: p.intensity ?? DEFAULT_INTENSITY,
	amount: p.amount ?? DEFAULT_AMOUNT,
	rotation: p.rotation ?? DEFAULT_ROTATION,
	radiusFalloff: p.radiusFalloff ?? DEFAULT_RADIUS_FALLOFF,
	phase: p.phase ?? DEFAULT_PHASE,
	randomness: p.randomness ?? DEFAULT_RANDOMNESS,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateNonNegative = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be >= 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const assertOptionalCenter = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}

	validateUnitInterval(value[0], `${name}[0]`);
	validateUnitInterval(value[1], `${name}[1]`);
};

const validateLaserRaysParams = (params: LaserRaysParams): void => {
	assertEffectParamsObject(params, 'Laser rays');
	assertOptionalColor(params.color, 'color');
	assertOptionalColor(params.backgroundColor, 'backgroundColor');
	assertOptionalCenter(params.center, 'center');
	assertOptionalFiniteNumber(params.rayCount, 'rayCount');
	assertOptionalFiniteNumber(params.sharpness, 'sharpness');
	assertOptionalFiniteNumber(params.intensity, 'intensity');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	assertOptionalFiniteNumber(params.radiusFalloff, 'radiusFalloff');
	assertOptionalFiniteNumber(params.phase, 'phase');
	assertOptionalFiniteNumber(params.randomness, 'randomness');

	const r = resolve(params);
	validatePositive(r.rayCount, 'rayCount');
	validatePositive(r.sharpness, 'sharpness');
	validateNonNegative(r.intensity, 'intensity');
	validateUnitInterval(r.amount, 'amount');
	validateUnitInterval(r.radiusFalloff, 'radiusFalloff');
	validateUnitInterval(r.randomness, 'randomness');
};

const LASER_RAYS_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const LASER_RAYS_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec4 uColor;
uniform vec4 uBackgroundColor;
uniform vec2 uCenter;
uniform float uRayCount;
uniform float uSharpness;
uniform float uIntensity;
uniform float uAmount;
uniform float uRotation;
uniform float uRadiusFalloff;
uniform float uPhase;
uniform float uRandomness;

float hash(float n) {
	return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
	vec4 source = texture(uSource, vUv);
	if (source.a <= 0.0) {
		fragColor = source;
		return;
	}

	vec2 pixel = vUv * uResolution;
	vec2 center = uCenter * uResolution;
	vec2 delta = pixel - center;
	delta.x /= max(uResolution.y / max(uResolution.x, 0.001), 0.001);

	float angle = atan(delta.y, delta.x) + uRotation;
	float radiusPx = length(delta);
	float radius = radiusPx / max(length(uResolution), 0.001);
	float rayPosition = angle * uRayCount;
	float rayIndex = floor(rayPosition / 6.28318530718);
	float widthVariation = mix(1.0, mix(0.55, 1.45, hash(rayIndex + 11.0)), uRandomness);
	float brightnessVariation = mix(1.0, mix(0.55, 1.25, hash(rayIndex + 23.0)), uRandomness);
	float lengthVariation = mix(1.0, mix(0.65, 1.35, hash(rayIndex + 37.0)), uRandomness);
	float localThickness = clamp(${BASE_THICKNESS.toString()} * widthVariation, 0.01, 1.0);
	float effectiveSharpness = max(uSharpness / localThickness, 0.001);
	float ray = pow(max(0.0, 0.5 + 0.5 * cos(rayPosition)), effectiveSharpness);
	float segment = 0.68 + 0.32 * sin((radiusPx - uPhase) * 0.035 + hash(rayIndex + 51.0) * 6.28318530718);
	float maxRadius = max(length(uResolution) * ${BASE_LENGTH.toString()} * lengthVariation, 1.0);
	float lengthMask = 1.0 - smoothstep(maxRadius * 0.55, maxRadius, radiusPx);
	float streak = ray * brightnessVariation * segment * lengthMask;
	float glow = exp(-radius * 16.0);
	float falloff = mix(1.0, clamp(1.0 - radius * 1.45, 0.0, 1.0), uRadiusFalloff);
	float energy = clamp((streak + glow * 0.75) * falloff * uIntensity, 0.0, 1.0);

	vec3 sourceStraight = source.rgb / source.a;
	vec3 backgroundStraight = uBackgroundColor.rgb / max(uBackgroundColor.a, 0.001);
	vec3 colorStraight = uColor.rgb / max(uColor.a, 0.001);
	vec3 laserStraight = mix(backgroundStraight, colorStraight, energy);
	vec3 finalStraight = mix(sourceStraight, laserStraight, uAmount);

	fragColor = vec4(finalStraight * source.a, source.a);
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
		throw new Error(`Laser rays shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Laser rays program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createLaserRaysState = (target: HTMLCanvasElement): LaserRaysState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('laser rays effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, LASER_RAYS_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, LASER_RAYS_FS);
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
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);

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
		texture,
		colorCtx,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uBackgroundColor: gl.getUniformLocation(program, 'uBackgroundColor'),
			uCenter: gl.getUniformLocation(program, 'uCenter'),
			uRayCount: gl.getUniformLocation(program, 'uRayCount'),
			uSharpness: gl.getUniformLocation(program, 'uSharpness'),
			uIntensity: gl.getUniformLocation(program, 'uIntensity'),
			uAmount: gl.getUniformLocation(program, 'uAmount'),
			uRotation: gl.getUniformLocation(program, 'uRotation'),
			uRadiusFalloff: gl.getUniformLocation(program, 'uRadiusFalloff'),
			uPhase: gl.getUniformLocation(program, 'uPhase'),
			uRandomness: gl.getUniformLocation(program, 'uRandomness'),
		},
		cachedColorStr: '',
		cachedColorRgba: [0, 255, 56, 255],
		cachedBackgroundColorStr: '',
		cachedBackgroundColorRgba: [2, 21, 6, 255],
	};
};

const setColorUniform = (
	gl: WebGL2RenderingContext,
	location: WebGLUniformLocation | null,
	color: ParsedColorRgba,
): void => {
	if (!location) {
		return;
	}

	gl.uniform4f(
		location,
		color[0] / 255,
		color[1] / 255,
		color[2] / 255,
		color[3] / 255,
	);
};

export const laserRays = createEffect<LaserRaysParams, LaserRaysState>({
	type: 'remotion/laser-rays',
	label: 'laserRays()',
	documentationLink: 'https://www.remotion.dev/docs/effects/laser-rays',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `laser-rays-${r.color}-${r.backgroundColor}-${r.center.join('-')}-${r.rayCount}-${r.sharpness}-${r.intensity}-${r.amount}-${r.rotation}-${r.radiusFalloff}-${r.phase}-${r.randomness}`;
	},
	setup: (target) => createLaserRaysState(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture, uniforms} = state;

		if (state.cachedColorStr !== r.color) {
			state.cachedColorStr = r.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
		}

		if (state.cachedBackgroundColorStr !== r.backgroundColor) {
			state.cachedBackgroundColorStr = r.backgroundColor;
			state.cachedBackgroundColorRgba = parseColorRgba(
				state.colorCtx,
				r.backgroundColor,
			);
		}

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

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

		gl.useProgram(program);
		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
		setColorUniform(gl, uniforms.uColor, state.cachedColorRgba);
		setColorUniform(
			gl,
			uniforms.uBackgroundColor,
			state.cachedBackgroundColorRgba,
		);
		if (uniforms.uCenter)
			gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
		if (uniforms.uRayCount) gl.uniform1f(uniforms.uRayCount, r.rayCount);
		if (uniforms.uSharpness) gl.uniform1f(uniforms.uSharpness, r.sharpness);
		if (uniforms.uIntensity) gl.uniform1f(uniforms.uIntensity, r.intensity);
		if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, r.amount);
		if (uniforms.uRotation)
			gl.uniform1f(uniforms.uRotation, (r.rotation * Math.PI) / 180);
		if (uniforms.uRadiusFalloff)
			gl.uniform1f(uniforms.uRadiusFalloff, r.radiusFalloff);
		if (uniforms.uPhase) gl.uniform1f(uniforms.uPhase, r.phase);
		if (uniforms.uRandomness) gl.uniform1f(uniforms.uRandomness, r.randomness);

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: laserRaysSchema,
	validateParams: validateLaserRaysParams,
});
