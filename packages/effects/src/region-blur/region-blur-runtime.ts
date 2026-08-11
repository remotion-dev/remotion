import {Internals} from 'remotion';
import {
	BLUR_FS_HORIZONTAL,
	BLUR_FS_VERTICAL,
	BLUR_VS,
} from '../blur/blur-shaders.js';
import {publicUvToShaderUv} from '../uv-coordinate.js';
import type {RegionBlurUvCoordinate} from './index.js';

const {createWebGL2ContextError} = Internals;

const COMPOSITE_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler2D uBlurred;
uniform vec2 uResolution;
uniform vec2 uTopLeft;
uniform vec2 uBottomRight;
uniform float uFeather;
uniform float uRoundness;

float roundedBoxDistance(vec2 point, vec2 center, vec2 halfSize, float radius) {
	vec2 offset = abs(point - center) - halfSize + vec2(radius);
	return length(max(offset, vec2(0.0))) + min(max(offset.x, offset.y), 0.0) - radius;
}

void main() {
	vec2 minimum = vec2(uTopLeft.x, uBottomRight.y) * uResolution;
	vec2 maximum = vec2(uBottomRight.x, uTopLeft.y) * uResolution;
	vec2 halfSize = (maximum - minimum) * 0.5;
	vec2 center = (minimum + maximum) * 0.5;
	float cornerRadius = min(halfSize.x, halfSize.y) * uRoundness;
	float distanceToRegion = roundedBoxDistance(
		vUv * uResolution,
		center,
		halfSize,
		cornerRadius
	);
	float mask = uFeather <= 0.0
		? (distanceToRegion <= 0.0 ? 1.0 : 0.0)
		: 1.0 - smoothstep(-uFeather * 0.5, uFeather * 0.5, distanceToRegion);

	fragColor = mix(texture(uSource, vUv), texture(uBlurred, vUv), mask);
}
`;

type BlurUniforms = {
	readonly source: WebGLUniformLocation | null;
	readonly radius: WebGLUniformLocation | null;
	readonly texelSize: WebGLUniformLocation | null;
};

export type RegionBlurState = {
	readonly gl: WebGL2RenderingContext;
	readonly horizontalProgram: WebGLProgram;
	readonly verticalProgram: WebGLProgram;
	readonly compositeProgram: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly horizontalTexture: WebGLTexture;
	readonly blurredTexture: WebGLTexture;
	readonly framebuffer: WebGLFramebuffer;
	readonly horizontalUniforms: BlurUniforms;
	readonly verticalUniforms: BlurUniforms;
	readonly compositeUniforms: {
		readonly source: WebGLUniformLocation | null;
		readonly blurred: WebGLUniformLocation | null;
		readonly resolution: WebGLUniformLocation | null;
		readonly topLeft: WebGLUniformLocation | null;
		readonly bottomRight: WebGLUniformLocation | null;
		readonly feather: WebGLUniformLocation | null;
		readonly roundness: WebGLUniformLocation | null;
	};
};

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
		throw new Error(`Shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const createProgram = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
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

const getBlurUniforms = (
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): BlurUniforms => ({
	source: gl.getUniformLocation(program, 'uSource'),
	radius: gl.getUniformLocation(program, 'uRadius'),
	texelSize: gl.getUniformLocation(program, 'uTexelSize'),
});

export const setupRegionBlur = (target: HTMLCanvasElement): RegionBlurState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('region blur effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const horizontalProgram = createProgram(gl, BLUR_VS, BLUR_FS_HORIZONTAL);
	const verticalProgram = createProgram(gl, BLUR_VS, BLUR_FS_VERTICAL);
	const compositeProgram = createProgram(
		gl,
		BLUR_VS,
		COMPOSITE_FRAGMENT_SHADER,
	);
	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	const framebuffer = gl.createFramebuffer();
	if (!vao || !vbo || !framebuffer) {
		throw new Error('Failed to create region blur WebGL resources');
	}

	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
	gl.bindVertexArray(null);

	return {
		gl,
		horizontalProgram,
		verticalProgram,
		compositeProgram,
		vao,
		vbo,
		sourceTexture: createTexture(gl),
		horizontalTexture: createTexture(gl),
		blurredTexture: createTexture(gl),
		framebuffer,
		horizontalUniforms: getBlurUniforms(gl, horizontalProgram),
		verticalUniforms: getBlurUniforms(gl, verticalProgram),
		compositeUniforms: {
			source: gl.getUniformLocation(compositeProgram, 'uSource'),
			blurred: gl.getUniformLocation(compositeProgram, 'uBlurred'),
			resolution: gl.getUniformLocation(compositeProgram, 'uResolution'),
			topLeft: gl.getUniformLocation(compositeProgram, 'uTopLeft'),
			bottomRight: gl.getUniformLocation(compositeProgram, 'uBottomRight'),
			feather: gl.getUniformLocation(compositeProgram, 'uFeather'),
			roundness: gl.getUniformLocation(compositeProgram, 'uRoundness'),
		},
	};
};

const draw = (state: RegionBlurState): void => {
	state.gl.bindVertexArray(state.vao);
	state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);
	state.gl.bindVertexArray(null);
};

const allocateTexture = (
	gl: WebGL2RenderingContext,
	texture: WebGLTexture,
	width: number,
	height: number,
): void => {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		width,
		height,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	);
};

const renderBlurPass = ({
	state,
	program,
	uniforms,
	input,
	output,
	width,
	height,
	radius,
}: {
	readonly state: RegionBlurState;
	readonly program: WebGLProgram;
	readonly uniforms: BlurUniforms;
	readonly input: WebGLTexture;
	readonly output: WebGLTexture;
	readonly width: number;
	readonly height: number;
	readonly radius: number;
}): void => {
	const {gl} = state;
	gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		output,
		0,
	);
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
		throw new Error('Region blur framebuffer is incomplete');
	}

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, input);
	gl.useProgram(program);
	if (uniforms.source) gl.uniform1i(uniforms.source, 0);
	if (uniforms.radius) gl.uniform1f(uniforms.radius, radius);
	if (uniforms.texelSize) {
		gl.uniform2f(uniforms.texelSize, 1 / width, 1 / height);
	}

	draw(state);
};

export const applyRegionBlur = ({
	state,
	source,
	width,
	height,
	flipSourceY,
	topLeft,
	bottomRight,
	blurRadius,
	feather,
	roundness,
}: {
	readonly state: RegionBlurState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly flipSourceY: boolean;
	readonly topLeft: RegionBlurUvCoordinate;
	readonly bottomRight: RegionBlurUvCoordinate;
	readonly blurRadius: number;
	readonly feather: number;
	readonly roundness: number;
}): void => {
	const {gl} = state;
	gl.viewport(0, 0, width, height);
	gl.clearColor(0, 0, 0, 0);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.bindTexture(gl.TEXTURE_2D, state.sourceTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);
	allocateTexture(gl, state.horizontalTexture, width, height);
	allocateTexture(gl, state.blurredTexture, width, height);

	renderBlurPass({
		state,
		program: state.horizontalProgram,
		uniforms: state.horizontalUniforms,
		input: state.sourceTexture,
		output: state.horizontalTexture,
		width,
		height,
		radius: blurRadius,
	});
	renderBlurPass({
		state,
		program: state.verticalProgram,
		uniforms: state.verticalUniforms,
		input: state.horizontalTexture,
		output: state.blurredTexture,
		width,
		height,
		radius: blurRadius,
	});

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(state.compositeProgram);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, state.sourceTexture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, state.blurredTexture);
	const topLeftShader = publicUvToShaderUv(topLeft);
	const bottomRightShader = publicUvToShaderUv(bottomRight);
	const uniforms = state.compositeUniforms;
	if (uniforms.source) gl.uniform1i(uniforms.source, 0);
	if (uniforms.blurred) gl.uniform1i(uniforms.blurred, 1);
	if (uniforms.resolution) gl.uniform2f(uniforms.resolution, width, height);
	if (uniforms.topLeft) {
		gl.uniform2f(uniforms.topLeft, topLeftShader[0], topLeftShader[1]);
	}

	if (uniforms.bottomRight) {
		gl.uniform2f(
			uniforms.bottomRight,
			bottomRightShader[0],
			bottomRightShader[1],
		);
	}

	if (uniforms.feather) gl.uniform1f(uniforms.feather, feather);
	if (uniforms.roundness) gl.uniform1f(uniforms.roundness, roundness);
	draw(state);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};

export const cleanupRegionBlur = (state: RegionBlurState): void => {
	const {gl} = state;
	gl.deleteFramebuffer(state.framebuffer);
	gl.deleteTexture(state.sourceTexture);
	gl.deleteTexture(state.horizontalTexture);
	gl.deleteTexture(state.blurredTexture);
	gl.deleteBuffer(state.vbo);
	gl.deleteVertexArray(state.vao);
	gl.deleteProgram(state.horizontalProgram);
	gl.deleteProgram(state.verticalProgram);
	gl.deleteProgram(state.compositeProgram);
};
