import type {EffectsProp} from 'remotion';
import type {HtmlInCanvasShader} from '../html-in-canvas-presentation';
import {makeHtmlInCanvasPresentation} from '../html-in-canvas-presentation';
import type {TransitionPresentation} from '../types';
import type {SlideDirection} from './slide';
import {uploadElementImage} from './upload-element-image';

export type BlurSlideDirection = SlideDirection;

export type BlurSlideProps = {
	direction?: BlurSlideDirection;
	blur?: number;
};

const DEFAULT_DIRECTION: BlurSlideDirection = 'from-left';
const DEFAULT_BLUR = 0.5;

const VALID_DIRECTIONS: BlurSlideDirection[] = [
	'from-left',
	'from-right',
	'from-top',
	'from-bottom',
];

const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
	gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Pass 1: slide both scenes along u_direction, wrapping around the edges
// (REPEAT), crossfade them around the midpoint and apply a box blur along
// the direction of travel.
const SLIDE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform float u_progress;
uniform vec2 u_direction;
uniform float u_blur_length;

in vec2 v_uv;
out vec4 outColor;

const int SAMPLES = 32;

void main() {
	// Both scenes travel together; the exiting scene wraps around the edges
	// while the entering scene takes over through a crossfade in the middle.
	vec2 slidUv = v_uv - u_direction * u_progress;
	float mixFactor = smoothstep(0.3, 0.7, u_progress);

	vec4 color = vec4(0.0);
	for (int i = 0; i < SAMPLES; i++) {
		float t = (float(i) / float(SAMPLES - 1) - 0.5) * u_blur_length;
		vec2 uv = slidUv + u_direction * t;
		color += mix(texture(u_prev, uv), texture(u_next, uv), mixFactor);
	}

	outColor = color / float(SAMPLES);
}`;

// Pass 2: blur the intermediate result along the same direction once more.
// Two box blurs combine into a triangle kernel, which hides the banding a
// single wide box blur would produce.
const BLUR_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_source;
uniform vec2 u_direction;
uniform float u_blur_length;

in vec2 v_uv;
out vec4 outColor;

const int SAMPLES = 32;

void main() {
	vec4 color = vec4(0.0);
	for (int i = 0; i < SAMPLES; i++) {
		float t = (float(i) / float(SAMPLES - 1) - 0.5) * u_blur_length;
		vec2 uv = v_uv + u_direction * t;
		// The framebuffer texture is stored bottom-up, so flip Y when sampling it.
		color += texture(u_source, vec2(uv.x, 1.0 - uv.y));
	}

	outColor = color / float(SAMPLES);
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

const createProgram = (
	gl: WebGL2RenderingContext,
	fragmentShader: string,
): WebGLProgram => {
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	const vs = compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER);
	const fs = compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
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
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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

const getDirectionVector = (
	direction: BlurSlideDirection,
): [number, number] => {
	// v_uv has its origin in the top-left corner, so +y points down.
	switch (direction) {
		case 'from-left':
			return [1, 0];
		case 'from-right':
			return [-1, 0];
		case 'from-top':
			return [0, 1];
		case 'from-bottom':
			return [0, -1];
		default:
			throw new Error(`Invalid direction: ${direction}`);
	}
};

const validateProps = (props: BlurSlideProps) => {
	const direction = props.direction ?? DEFAULT_DIRECTION;
	const blur = props.blur ?? DEFAULT_BLUR;

	if (!VALID_DIRECTIONS.includes(direction)) {
		throw new TypeError(
			`direction passed to blurSlide() must be one of ${VALID_DIRECTIONS.map((d) => `"${d}"`).join(', ')}, received ${JSON.stringify(direction)}`,
		);
	}

	if (typeof blur !== 'number' || !Number.isFinite(blur)) {
		throw new TypeError(
			`blur passed to blurSlide() must be a finite number, received ${blur}`,
		);
	}

	if (blur < 0) {
		throw new TypeError(
			`blur passed to blurSlide() must be greater than or equal to 0, received ${blur}`,
		);
	}
};

export const blurSlideShader = (
	canvas: OffscreenCanvas,
): ReturnType<HtmlInCanvasShader<BlurSlideProps>> => {
	const gl = canvas.getContext('webgl2', {premultipliedAlpha: true});
	if (!gl) {
		throw new Error('Failed to create WebGL2 context');
	}

	const slideProgram = createProgram(gl, SLIDE_FRAGMENT_SHADER);
	const blurProgram = createProgram(gl, BLUR_FRAGMENT_SHADER);
	const prevTex = createTexture(gl);
	const nextTex = createTexture(gl);
	const intermediateTex = createTexture(gl);

	const framebuffer = gl.createFramebuffer();
	if (!framebuffer) {
		throw new Error('Failed to create framebuffer');
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		intermediateTex,
		0,
	);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	let intermediateWidth = 1;
	let intermediateHeight = 1;

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);
	// Both programs share the same vertex shader, so the attribute location matches.
	const aPos = gl.getAttribLocation(slideProgram, 'a_pos');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

	const uPrev = gl.getUniformLocation(slideProgram, 'u_prev');
	const uNext = gl.getUniformLocation(slideProgram, 'u_next');
	const uProgress = gl.getUniformLocation(slideProgram, 'u_progress');
	const uSlideDirection = gl.getUniformLocation(slideProgram, 'u_direction');
	const uSlideBlurLength = gl.getUniformLocation(slideProgram, 'u_blur_length');

	const uSource = gl.getUniformLocation(blurProgram, 'u_source');
	const uBlurDirection = gl.getUniformLocation(blurProgram, 'u_direction');
	const uBlurBlurLength = gl.getUniformLocation(blurProgram, 'u_blur_length');

	const cleanup: ReturnType<
		HtmlInCanvasShader<BlurSlideProps>
	>['cleanup'] = () => {
		gl.deleteProgram(slideProgram);
		gl.deleteProgram(blurProgram);
		gl.deleteTexture(prevTex);
		gl.deleteTexture(nextTex);
		gl.deleteTexture(intermediateTex);
		gl.deleteFramebuffer(framebuffer);
		gl.deleteBuffer(buffer);
		gl.deleteVertexArray(vao);
	};

	const clear: ReturnType<HtmlInCanvasShader<BlurSlideProps>>['clear'] = () => {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	};

	const draw: ReturnType<HtmlInCanvasShader<BlurSlideProps>>['draw'] = ({
		prevImage,
		nextImage,
		width,
		height,
		time,
		passedProps,
	}) => {
		const {direction = DEFAULT_DIRECTION, blur = DEFAULT_BLUR} = passedProps;

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
		const linearProgress = 1 - effectiveTime;
		// Ease the slide so that it starts and ends at rest. The blur is
		// proportional to the speed of the slide, which peaks halfway through.
		const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);
		const velocity = 4 * linearProgress * (1 - linearProgress);
		// Each pass covers half of the kernel; together they form a triangle
		// kernel spanning `blur * velocity` of the frame.
		const passBlurLength = (blur * velocity) / 2;
		const [dirX, dirY] = getDirectionVector(direction);

		gl.bindVertexArray(vao);

		if (intermediateWidth !== width || intermediateHeight !== height) {
			gl.bindTexture(gl.TEXTURE_2D, intermediateTex);
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
			intermediateWidth = width;
			intermediateHeight = height;
		}

		// Pass 1: slide + crossfade + first blur into the intermediate texture.
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(slideProgram);

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
		gl.uniform1f(uProgress, progress);
		gl.uniform2f(uSlideDirection, dirX, dirY);
		gl.uniform1f(uSlideBlurLength, passBlurLength);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		// Pass 2: second blur into the output canvas.
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(blurProgram);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, intermediateTex);
		gl.uniform1i(uSource, 0);
		gl.uniform2f(uBlurDirection, dirX, dirY);
		gl.uniform1f(uBlurBlurLength, passBlurLength);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};

	return {
		clear,
		cleanup,
		draw,
	};
};

const makeBlurSlide = makeHtmlInCanvasPresentation(blurSlideShader);

export const blurSlide = (
	props: BlurSlideProps & {effects?: EffectsProp} = {},
): TransitionPresentation<BlurSlideProps & {effects?: EffectsProp}> => {
	validateProps(props);
	return makeBlurSlide(props);
};
