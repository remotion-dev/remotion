import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import {makeHtmlInCanvasPresentation} from '../html-in-canvas-presentation';
import {uploadElementImage} from './upload-element-image';

export type DissolveProps = {
	lineWidth?: number;
	spreadColor?: string;
	hotColor?: string;
	pow?: number;
	intensity?: number;
};

const DEFAULT_LINE_WIDTH = 0.1;
const DEFAULT_SPREAD_COLOR = '#ff0000';
const DEFAULT_HOT_COLOR = '#e6e633';
const DEFAULT_POW = 5.0;
const DEFAULT_INTENSITY = 1.0;

const parseHexColor = (hex: string): [number, number, number] => {
	const cleaned = hex.startsWith('#') ? hex.slice(1) : hex;
	if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
		throw new Error(
			`Invalid color "${hex}" passed to dissolve(). Expected a "#rrggbb" hex string.`,
		);
	}

	return [
		parseInt(cleaned.slice(0, 2), 16) / 255,
		parseInt(cleaned.slice(2, 4), 16) / 255,
		parseInt(cleaned.slice(4, 6), 16) / 255,
	];
};

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Adapted from https://gl-transitions.com/editor/dissolve
// Author: hjm1fb · License: MIT
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform float u_time;
uniform float u_line_width;
uniform vec3 u_spread_color;
uniform vec3 u_hot_color;
uniform float u_pow;
uniform float u_intensity;

in vec2 v_uv;
out vec4 outColor;

vec4 transition(vec2 uv, float progress) {
	vec4 from = texture(u_next, uv);
	vec4 to = texture(u_prev, uv);
	float burn = 0.5 + 0.5 * (0.299 * from.r + 0.587 * from.g + 0.114 * from.b);
	float show = burn - progress;
	if (show < 0.001) {
		return to;
	}
	float factor = 1.0 - smoothstep(0.0, u_line_width, show);
	vec3 burnColor = mix(u_spread_color, u_hot_color, factor);
	burnColor = pow(burnColor, vec3(u_pow)) * u_intensity;
	vec3 finalRGB = mix(from.rgb, burnColor, factor * step(0.0001, progress));
	return vec4(finalRGB, from.a);
}

void main() {
	// In Remotion's HTML-in-canvas convention, u_prev is bound to the incoming
	// scene and u_next is bound to the outgoing scene, so the gl-transitions
	// "from" → u_next and "to" → u_prev. With this binding, progress = u_time
	// (no inversion) maps to the gl-transitions convention where progress = 0
	// shows the outgoing scene and progress = 1 shows the incoming one.
	float progress = u_time;
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

export const dissolveShader = (
	canvas: OffscreenCanvas,
): ReturnType<HtmlInCanvasShader<DissolveProps>> => {
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
	const uLineWidth = gl.getUniformLocation(program, 'u_line_width');
	const uSpreadColor = gl.getUniformLocation(program, 'u_spread_color');
	const uHotColor = gl.getUniformLocation(program, 'u_hot_color');
	const uPow = gl.getUniformLocation(program, 'u_pow');
	const uIntensity = gl.getUniformLocation(program, 'u_intensity');

	const cleanup: ReturnType<
		HtmlInCanvasShader<DissolveProps>
	>['cleanup'] = () => {
		gl.deleteProgram(program);
		gl.deleteTexture(prevTex);
		gl.deleteTexture(nextTex);
	};

	const clear: ReturnType<HtmlInCanvasShader<DissolveProps>>['clear'] = () => {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	const draw: ReturnType<HtmlInCanvasShader<DissolveProps>>['draw'] = ({
		prevImage,
		nextImage,
		width,
		height,
		time,
		passedProps,
	}) => {
		const {
			lineWidth = DEFAULT_LINE_WIDTH,
			spreadColor = DEFAULT_SPREAD_COLOR,
			hotColor = DEFAULT_HOT_COLOR,
			pow = DEFAULT_POW,
			intensity = DEFAULT_INTENSITY,
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

		const spread = parseHexColor(spreadColor);
		const hot = parseHexColor(hotColor);

		gl.uniform1f(uTime, effectiveTime);
		gl.uniform1f(uLineWidth, lineWidth);
		gl.uniform3f(uSpreadColor, spread[0], spread[1], spread[2]);
		gl.uniform3f(uHotColor, hot[0], hot[1], hot[2]);
		gl.uniform1f(uPow, pow);
		gl.uniform1f(uIntensity, intensity);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};

	return {
		clear,
		cleanup,
		draw,
	};
};

export const dissolve = makeHtmlInCanvasPresentation(dissolveShader);
