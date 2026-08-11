import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import {makeHtmlInCanvasPresentation} from '../html-in-canvas-presentation';
import {uploadElementImage} from './upload-element-image';

export type SwapProps = {
	reflection?: number;
	perspective?: number;
	depth?: number;
};

const DEFAULT_REFLECTION = 0.4;
const DEFAULT_PERSPECTIVE = 0.2;
const DEFAULT_DEPTH = 3.0;

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Adapted from https://gl-transitions.com/editor/swap
// Author: gre - License: MIT
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform float u_time;
uniform float u_reflection;
uniform float u_perspective;
uniform float u_depth;

in vec2 v_uv;
out vec4 outColor;

const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds(vec2 p) {
	return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec2 project(vec2 p) {
	return p * vec2(1.0, -1.2) + vec2(0.0, 2.22);
}

vec4 bgColor(vec2 p, vec2 pfr, vec2 pto) {
	vec4 c = black;
	pfr = project(pfr);
	if (inBounds(pfr)) {
		c += mix(black, texture(u_prev, pfr), u_reflection * mix(1.0, 0.0, pfr.y));
	}
	pto = project(pto);
	if (inBounds(pto)) {
		c += mix(black, texture(u_next, pto), u_reflection * mix(1.0, 0.0, pto.y));
	}
	return c;
}

vec4 transition(vec2 p, float progress) {
	vec2 pfr;
	vec2 pto = vec2(-1.0);

	float size = mix(1.0, u_depth, progress);
	float persp = u_perspective * progress;
	pfr = (p + vec2(-0.0, -0.5)) * vec2(
		size / (1.0 - u_perspective * progress),
		size / (1.0 - size * persp * p.x)
	) + vec2(0.0, 0.5);

	size = mix(1.0, u_depth, 1.0 - progress);
	persp = u_perspective * (1.0 - progress);
	pto = (p + vec2(-1.0, -0.5)) * vec2(
		size / (1.0 - u_perspective * (1.0 - progress)),
		size / (1.0 - size * persp * (0.5 - p.x))
	) + vec2(1.0, 0.5);

	if (progress < 0.5) {
		if (inBounds(pfr)) {
			return texture(u_prev, pfr);
		}
		if (inBounds(pto)) {
			return texture(u_next, pto);
		}
	}
	if (inBounds(pto)) {
		return texture(u_next, pto);
	}
	if (inBounds(pfr)) {
		return texture(u_prev, pfr);
	}
	return bgColor(p, pfr, pto);
}

void main() {
	float progress = 1.0 - u_time;
	outColor = transition(v_uv, progress);
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

export const swapShader = (
	canvas: OffscreenCanvas,
): ReturnType<HtmlInCanvasShader<SwapProps>> => {
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
	const uReflection = gl.getUniformLocation(program, 'u_reflection');
	const uPerspective = gl.getUniformLocation(program, 'u_perspective');
	const uDepth = gl.getUniformLocation(program, 'u_depth');

	const cleanup: ReturnType<HtmlInCanvasShader<SwapProps>>['cleanup'] = () => {
		gl.deleteProgram(program);
		gl.deleteTexture(prevTex);
		gl.deleteTexture(nextTex);
	};

	const clear: ReturnType<HtmlInCanvasShader<SwapProps>>['clear'] = () => {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	const draw: ReturnType<HtmlInCanvasShader<SwapProps>>['draw'] = ({
		prevImage,
		nextImage,
		width,
		height,
		time,
		passedProps,
	}) => {
		const {
			reflection = DEFAULT_REFLECTION,
			perspective = DEFAULT_PERSPECTIVE,
			depth = DEFAULT_DEPTH,
		} = passedProps;

		if (!prevImage && !nextImage) {
			return;
		}

		if (prevImage && (prevImage.width === 0 || prevImage.height === 0)) {
			return;
		}

		if (nextImage && (nextImage.width === 0 || nextImage.height === 0)) {
			return;
		}

		// When one side is missing, force the mix to fully show the other.
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
		gl.uniform1f(uReflection, reflection);
		gl.uniform1f(uPerspective, perspective);
		gl.uniform1f(uDepth, depth);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};

	return {
		clear,
		cleanup,
		draw,
	};
};

export const swap = makeHtmlInCanvasPresentation(swapShader);
