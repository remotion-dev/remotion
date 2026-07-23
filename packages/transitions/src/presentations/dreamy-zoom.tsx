import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import {makeHtmlInCanvasPresentation} from '../html-in-canvas-presentation';
import {uploadElementImage} from './upload-element-image';

export type DreamyZoomProps = {
	rotation?: number;
	scale?: number;
};

const DEFAULT_ROTATION = 6;
const DEFAULT_SCALE = 1.2;

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Adapted from https://gl-transitions.com/editor/DreamyZoom
// Author: Zeh Fernando · License: MIT
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform float u_time;
uniform float u_rotation;
uniform float u_scale;
uniform float u_ratio;

in vec2 v_uv;
out vec4 outColor;

const float DEG2RAD = 0.03926990816987241548078304229099;

vec4 transition(vec2 uv, float progress) {
	float phase = progress < 0.5 ? progress * 2.0 : (progress - 0.5) * 2.0;
	float angleOffset = progress < 0.5 ? mix(0.0, u_rotation * DEG2RAD, phase) : mix(-u_rotation * DEG2RAD, 0.0, phase);
	float newScale = progress < 0.5 ? mix(1.0, u_scale, phase) : mix(u_scale, 1.0, phase);

	vec2 center = vec2(0.0, 0.0);
	vec2 p = (uv.xy - vec2(0.5, 0.5)) / newScale * vec2(u_ratio, 1.0);
	float angle = atan(p.y, p.x) + angleOffset;
	float dist = distance(center, p);

	p.x = cos(angle) * dist / u_ratio + 0.5;
	p.y = sin(angle) * dist + 0.5;

	vec4 c = progress < 0.5 ? texture(u_prev, p) : texture(u_next, p);
	return c + (progress < 0.5 ? mix(0.0, 1.0, phase) : mix(1.0, 0.0, phase));
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

export const dreamyZoomShader = (
	canvas: OffscreenCanvas,
): ReturnType<HtmlInCanvasShader<DreamyZoomProps>> => {
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
	const uRotation = gl.getUniformLocation(program, 'u_rotation');
	const uScale = gl.getUniformLocation(program, 'u_scale');
	const uRatio = gl.getUniformLocation(program, 'u_ratio');

	const cleanup: ReturnType<
		HtmlInCanvasShader<DreamyZoomProps>
	>['cleanup'] = () => {
		gl.deleteProgram(program);
		gl.deleteTexture(prevTex);
		gl.deleteTexture(nextTex);
	};

	const clear: ReturnType<
		HtmlInCanvasShader<DreamyZoomProps>
	>['clear'] = () => {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	const draw: ReturnType<HtmlInCanvasShader<DreamyZoomProps>>['draw'] = ({
		prevImage,
		nextImage,
		width,
		height,
		time,
		passedProps,
	}) => {
		const {rotation = DEFAULT_ROTATION, scale = DEFAULT_SCALE} = passedProps;

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
		gl.uniform1f(uRotation, rotation);
		gl.uniform1f(uScale, scale);
		gl.uniform1f(uRatio, width / height);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};

	return {
		clear,
		cleanup,
		draw,
	};
};

export const dreamyZoom = makeHtmlInCanvasPresentation(dreamyZoomShader);
