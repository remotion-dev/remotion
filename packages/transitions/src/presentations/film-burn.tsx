import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import {makeHtmlInCanvasPresentation} from '../html-in-canvas-presentation';
import {uploadElementImage} from './upload-element-image';

export type FilmBurnProps = {
	seed?: number;
};

const DEFAULT_SEED = 2.31;

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Adapted from https://gl-transitions.com/editor/FilmBurn
// Author: Anastasia Dunbar · License: MIT
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform float u_time;
uniform float u_seed;

in vec2 v_uv;
out vec4 outColor;

#define PI 3.14159265358979323
#define CLAMPS(x) clamp(x, 0.0, 1.0)
#define REPEATS 50.0

float sigmoid(float x, float a) {
	float b = pow(x * 2.0, a) / 2.0;
	if (x > 0.5) {
		b = 1.0 - pow(2.0 - (x * 2.0), a) / 2.0;
	}
	return b;
}

float rand(float co) {
	return fract(sin((co * 24.9898) + u_seed) * 43758.5453);
}

float rand(vec2 co) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float apow(float a, float b) {
	return pow(abs(a), b) * sign(b);
}

vec3 pow3(vec3 a, vec3 b) {
	return vec3(apow(a.r, b.r), apow(a.g, b.g), apow(a.b, b.b));
}

float smoothMix(float a, float b, float c) {
	return mix(a, b, sigmoid(c, 2.0));
}

float random(vec2 co, float shft) {
	co += 10.0;
	return smoothMix(
		fract(
			sin(
				dot(
					co.xy,
					vec2(12.9898 + (floor(shft) * 0.5), 78.233 + u_seed)
				)
			) * 43758.5453
		),
		fract(
			sin(
				dot(
					co.xy,
					vec2(12.9898 + (floor(shft + 1.0) * 0.5), 78.233 + u_seed)
				)
			) * 43758.5453
		),
		fract(shft)
	);
}

float smoothRandom(vec2 co, float shft) {
	return smoothMix(
		smoothMix(
			random(floor(co), shft),
			random(floor(co + vec2(1.0, 0.0)), shft),
			fract(co.x)
		),
		smoothMix(
			random(floor(co + vec2(0.0, 1.0)), shft),
			random(floor(co + vec2(1.0, 1.0)), shft),
			fract(co.x)
		),
		fract(co.y)
	);
}

vec4 sampleTexture(vec2 p, float progress) {
	return mix(texture(u_prev, p), texture(u_next, p), sigmoid(progress, 10.0));
}

vec4 transition(vec2 p, float progress) {
	vec3 f = vec3(0.0);
	for (float i = 0.0; i < 13.0; i++) {
		f += sin(((p.x * rand(i) * 6.0) + (progress * 8.0)) + rand(i + 1.43)) *
			sin(
				((p.y * rand(i + 4.4) * 6.0) + (progress * 6.0)) +
					rand(i + 2.4)
			);
		f += 1.0 - CLAMPS(
			length(
				p -
					vec2(
						smoothRandom(vec2(progress * 1.3), i + 1.0),
						smoothRandom(vec2(progress * 0.5), i + 6.25)
					)
			) * mix(20.0, 70.0, rand(i))
		);
	}

	f += 4.0;
	f /= 11.0;
	f = pow3(
		f * vec3(1.0, 0.7, 0.6),
		vec3(1.0, 2.0 - sin(progress * PI), 1.3)
	);
	f *= sin(progress * PI);

	p -= 0.5;
	p *= 1.0 + (smoothRandom(vec2(progress * 5.0), 6.3) * sin(progress * PI) * 0.05);
	p += 0.5;

	vec4 blurredImage = vec4(0.0);
	float blurAmount = sin(progress * PI) * 0.03;
	for (float i = 0.0; i < REPEATS; i++) {
		vec2 q = vec2(
			cos(degrees((i / REPEATS) * 360.0)),
			sin(degrees((i / REPEATS) * 360.0))
		) * (rand(vec2(i, p.x + p.y)) + blurAmount);
		vec2 uv2 = p + (q * blurAmount);
		blurredImage += sampleTexture(uv2, progress);
	}

	blurredImage /= REPEATS;
	return blurredImage + vec4(f, 0.0);
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

export const filmBurnShader = (
	canvas: OffscreenCanvas,
): ReturnType<HtmlInCanvasShader<FilmBurnProps>> => {
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
	const uSeed = gl.getUniformLocation(program, 'u_seed');

	const cleanup: ReturnType<
		HtmlInCanvasShader<FilmBurnProps>
	>['cleanup'] = () => {
		gl.deleteProgram(program);
		gl.deleteTexture(prevTex);
		gl.deleteTexture(nextTex);
	};

	const clear: ReturnType<HtmlInCanvasShader<FilmBurnProps>>['clear'] = () => {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	const draw: ReturnType<HtmlInCanvasShader<FilmBurnProps>>['draw'] = ({
		prevImage,
		nextImage,
		width,
		height,
		time,
		passedProps,
	}) => {
		const {seed = DEFAULT_SEED} = passedProps;

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
		gl.uniform1f(uSeed, seed);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};

	return {
		clear,
		cleanup,
		draw,
	};
};

export const filmBurn = makeHtmlInCanvasPresentation(filmBurnShader);
