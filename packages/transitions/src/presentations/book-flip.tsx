import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import {makeHtmlInCanvasPresentation} from '../html-in-canvas-presentation';
import {uploadElementImage} from './upload-element-image';

export type BookFlipDirection =
	| 'from-left'
	| 'from-right'
	| 'from-top'
	| 'from-bottom';

export type BookFlipProps = {
	direction?: BookFlipDirection;
};

const DIRECTION_FROM_LEFT = 0;
const DIRECTION_FROM_RIGHT = 1;
const DIRECTION_FROM_TOP = 2;
const DIRECTION_FROM_BOTTOM = 3;

const DEFAULT_DIRECTION: BookFlipDirection = 'from-right';

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Adapted from https://gl-transitions.com/editor/BookFlip
// Author: hong · License: MIT
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform float u_time;
uniform float u_direction;

in vec2 v_uv;
out vec4 outColor;

const float EPSILON = 0.0001;

float avoidZero(float value) {
	if (abs(value) < EPSILON) {
		return value < 0.0 ? -EPSILON : EPSILON;
	}

	return value;
}

vec2 skewRight(vec2 p, float progress) {
	float skewX = (p.x - progress) / avoidZero(0.5 - progress) * 0.5;
	float skewY =
		(p.y - 0.5) /
			avoidZero(0.5 + progress * (p.x - 0.5) / 0.5) *
			0.5 +
		0.5;
	return vec2(skewX, skewY);
}

vec2 skewLeft(vec2 p, float progress) {
	float skewX = (p.x - 0.5) / avoidZero(progress - 0.5) * 0.5 + 0.5;
	float skewY =
		(p.y - 0.5) /
			avoidZero(0.5 + (1.0 - progress) * (0.5 - p.x) / 0.5) *
			0.5 +
		0.5;
	return vec2(skewX, skewY);
}

vec4 addShade(float progress) {
	float shadeVal = max(0.7, abs(progress - 0.5) * 2.0);
	return vec4(vec3(shadeVal), 1.0);
}

vec2 toCanonicalUv(vec2 p) {
	if (u_direction < 0.5) {
		return p;
	}

	if (u_direction < 1.5) {
		return vec2(1.0 - p.x, p.y);
	}

	if (u_direction < 2.5) {
		return vec2(p.y, 1.0 - p.x);
	}

	return vec2(1.0 - p.y, p.x);
}

vec2 fromCanonicalUv(vec2 p) {
	if (u_direction < 0.5) {
		return p;
	}

	if (u_direction < 1.5) {
		return vec2(1.0 - p.x, p.y);
	}

	if (u_direction < 2.5) {
		return vec2(1.0 - p.y, p.x);
	}

	return vec2(p.y, 1.0 - p.x);
}

vec4 samplePrev(vec2 p) {
	return texture(u_prev, fromCanonicalUv(p));
}

vec4 sampleNext(vec2 p) {
	return texture(u_next, fromCanonicalUv(p));
}

vec4 transition(vec2 p, float progress) {
	float pr = step(1.0 - progress, p.x);

	if (p.x < 0.5) {
		return mix(
			samplePrev(p),
			sampleNext(skewLeft(p, progress)) * addShade(progress),
			pr
		);
	}

	return mix(
		samplePrev(skewRight(p, progress)) * addShade(progress),
		sampleNext(p),
		pr
	);
}

void main() {
	vec2 p = toCanonicalUv(v_uv);
	float progress = 1.0 - u_time;
	outColor = transition(p, progress);
}`;

const compileShader = (
	gl: WebGL2RenderingContext,
	source: string,
	type: number,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Failed to compile shader: ${log}`);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	const vs = compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER);
	const fs = compileShader(gl, FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Failed to link program: ${log}`);
	}

	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const tex = gl.createTexture();
	if (!tex) {
		throw new Error('Failed to create texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([0, 0, 0, 0]),
	);
	return tex;
};

const getDirectionConstant = (direction: BookFlipDirection): number => {
	switch (direction) {
		case 'from-left':
			return DIRECTION_FROM_LEFT;
		case 'from-right':
			return DIRECTION_FROM_RIGHT;
		case 'from-top':
			return DIRECTION_FROM_TOP;
		case 'from-bottom':
			return DIRECTION_FROM_BOTTOM;
		default:
			return DIRECTION_FROM_RIGHT;
	}
};

export const bookFlipShader = (
	canvas: OffscreenCanvas,
): ReturnType<HtmlInCanvasShader<BookFlipProps>> => {
	const gl = canvas.getContext('webgl2', {premultipliedAlpha: true});
	if (!gl) {
		throw new Error('Failed to create WebGL2 context');
	}

	const program = createProgram(gl);
	const prevTex = createTexture(gl);
	const nextTex = createTexture(gl);

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);
	const aPos = gl.getAttribLocation(program, 'a_pos');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

	const uTime = gl.getUniformLocation(program, 'u_time');
	const uPrev = gl.getUniformLocation(program, 'u_prev');
	const uNext = gl.getUniformLocation(program, 'u_next');
	const uDirection = gl.getUniformLocation(program, 'u_direction');

	const cleanup: ReturnType<
		HtmlInCanvasShader<BookFlipProps>
	>['cleanup'] = () => {
		gl.deleteProgram(program);
		gl.deleteTexture(prevTex);
		gl.deleteTexture(nextTex);
	};

	const clear: ReturnType<HtmlInCanvasShader<BookFlipProps>>['clear'] = () => {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	const draw: ReturnType<HtmlInCanvasShader<BookFlipProps>>['draw'] = ({
		prevImage,
		nextImage,
		width,
		height,
		time,
		passedProps,
	}) => {
		const {direction = DEFAULT_DIRECTION} = passedProps;

		if (!prevImage && !nextImage) {
			return;
		}

		if (prevImage && (prevImage.width === 0 || prevImage.height === 0)) {
			return;
		}

		if (nextImage && (nextImage.width === 0 || nextImage.height === 0)) {
			return;
		}

		// At time=0 the shader outputs nextImage. At time=1 the shader outputs prevImage.
		const effectiveTime = !prevImage ? 0 : !nextImage ? 1 : time;

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, prevTex);
		if (prevImage) {
			uploadElementImage(gl, prevImage);
		}

		gl.uniform1i(uPrev, 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, nextTex);
		if (nextImage) {
			uploadElementImage(gl, nextImage);
		}

		gl.uniform1i(uNext, 1);
		gl.uniform1f(uTime, effectiveTime);
		gl.uniform1f(uDirection, getDirectionConstant(direction));

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};

	return {
		clear,
		cleanup,
		draw,
	};
};

export const bookFlip = makeHtmlInCanvasPresentation(bookFlipShader);
