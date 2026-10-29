import {Internals} from 'remotion';
import {parseColorRgba, type ParsedColorRgba} from '../color-utils.js';
import {
	WEATHER_COMPOSITE_FRAGMENT_SHADER,
	WEATHER_COMPOSITE_VERTEX_SHADER,
	WEATHER_FRAGMENT_SHADER,
	WEATHER_VERTEX_SHADER,
} from './shaders.js';

export type WeatherRenderParams = {
	readonly time: number;
	readonly count: number;
	readonly size: number;
	readonly sizeVariation: number;
	readonly sceneDepth: number;
	readonly speed: number;
	readonly speedVariation: number;
	readonly wind: number;
	readonly windVariation: number;
	readonly spread: number;
	readonly wiggleAmount: number;
	readonly wiggleAmountVariation: number;
	readonly wiggleFrequency: number;
	readonly wiggleFrequencyVariation: number;
	readonly color: string;
	readonly opacity: number;
	readonly transferMode: 'composite' | 'lighten';
	readonly compositeWithOriginal: boolean;
	readonly appearance: 'refracting' | 'soft-solid';
	readonly offset: readonly [number, number];
	readonly seed: number;
};

export type WeatherState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly compositeProgram: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly sourceTexture: WebGLTexture;
	readonly weatherTexture: WebGLTexture;
	readonly framebuffer: WebGLFramebuffer;
	readonly uniforms: Record<string, WebGLUniformLocation | null>;
	readonly compositeUniforms: Record<string, WebGLUniformLocation | null>;
	readonly colorCtx: CanvasRenderingContext2D;
	readonly floatingPoint: boolean;
	cachedColor: string | null;
	cachedColorRgba: ParsedColorRgba;
	width: number;
	height: number;
};

export const setupWeather = (
	target: HTMLCanvasElement,
	effectName: string,
): WeatherState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) throw Internals.createWebGL2ContextError(`${effectName} effect`);

	const shaders: WebGLShader[] = [];
	const program = gl.createProgram();
	const compositeProgram = gl.createProgram();
	const vao = gl.createVertexArray();
	const sourceTexture = gl.createTexture();
	const weatherTexture = gl.createTexture();
	const framebuffer = gl.createFramebuffer();
	try {
		if (
			!program ||
			!compositeProgram ||
			!vao ||
			!sourceTexture ||
			!weatherTexture ||
			!framebuffer
		) {
			throw new Error(`Could not allocate ${effectName} WebGL resources`);
		}

		for (const [nextProgram, vertexSource, fragmentSource] of [
			[program, WEATHER_VERTEX_SHADER, WEATHER_FRAGMENT_SHADER],
			[
				compositeProgram,
				WEATHER_COMPOSITE_VERTEX_SHADER,
				WEATHER_COMPOSITE_FRAGMENT_SHADER,
			],
		] as const) {
			for (const [type, source] of [
				[gl.VERTEX_SHADER, vertexSource],
				[gl.FRAGMENT_SHADER, fragmentSource],
			] as const) {
				const shader = gl.createShader(type);
				if (!shader) throw new Error(`Could not create ${effectName} shader`);
				shaders.push(shader);
				gl.shaderSource(shader, source);
				gl.compileShader(shader);
				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					throw new Error(
						`${effectName} shader compile failed: ${gl.getShaderInfoLog(shader)}`,
					);
				}

				gl.attachShader(nextProgram, shader);
			}

			gl.linkProgram(nextProgram);
			if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
				throw new Error(
					`${effectName} program link failed: ${gl.getProgramInfoLog(nextProgram)}`,
				);
			}
		}

		for (const texture of [sourceTexture, weatherTexture]) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
		const colorCanvas = document.createElement('canvas');
		colorCanvas.width = 1;
		colorCanvas.height = 1;
		const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
		if (!colorCtx) {
			throw new Error(`Could not create ${effectName} color parsing context`);
		}

		return {
			gl,
			program,
			compositeProgram,
			vao,
			sourceTexture,
			weatherTexture,
			framebuffer,
			uniforms: Object.fromEntries(
				[
					'uSource',
					'uResolution',
					'uSnow',
					'uTime',
					'uSeed',
					'uOffset',
					'uSize',
					'uSizeVariation',
					'uSceneDepth',
					'uSpeed',
					'uSpeedVariation',
					'uWind',
					'uWindVariation',
					'uSpread',
					'uWiggleAmount',
					'uWiggleAmountVariation',
					'uWiggleFrequency',
					'uWiggleFrequencyVariation',
					'uColor',
					'uOpacity',
					'uRefract',
				].map((name) => [name, gl.getUniformLocation(program, name)]),
			),
			compositeUniforms: Object.fromEntries(
				['uSource', 'uWeather', 'uCompositeWithOriginal', 'uLighten'].map(
					(name) => [name, gl.getUniformLocation(compositeProgram, name)],
				),
			),
			colorCtx,
			// A half-float target avoids rounding away faint overlapping particles.
			// WebGL2 implementations without float render targets use RGBA8.
			floatingPoint: gl.getExtension('EXT_color_buffer_float') !== null,
			cachedColor: null,
			cachedColorRgba: [0, 0, 0, 0],
			width: 0,
			height: 0,
		};
	} catch (error) {
		gl.deleteFramebuffer(framebuffer);
		gl.deleteTexture(weatherTexture);
		gl.deleteTexture(sourceTexture);
		gl.deleteVertexArray(vao);
		gl.deleteProgram(compositeProgram);
		gl.deleteProgram(program);
		throw error;
	} finally {
		for (const shader of shaders) gl.deleteShader(shader);
	}
};

export const drawWeather = ({
	state,
	source,
	width,
	height,
	flipSourceY,
	params,
	type,
}: {
	state: WeatherState;
	source: TexImageSource;
	width: number;
	height: number;
	flipSourceY: boolean;
	params: WeatherRenderParams;
	type: 'rain' | 'snow';
}): void => {
	const {gl, uniforms, compositeUniforms} = state;
	if (state.cachedColor !== params.color) {
		state.cachedColorRgba = parseColorRgba(state.colorCtx, params.color);
		state.cachedColor = params.color;
	}

	const color = state.cachedColorRgba;
	gl.viewport(0, 0, width, height);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, state.sourceTexture);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, state.weatherTexture);
	gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebuffer);
	if (state.width !== width || state.height !== height) {
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			state.floatingPoint ? gl.RGBA16F : gl.RGBA8,
			width,
			height,
			0,
			gl.RGBA,
			state.floatingPoint ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
			null,
		);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			state.weatherTexture,
			0,
		);
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			throw new Error('Could not allocate weather effect render target');
		}

		state.width = width;
		state.height = height;
	}

	// All particles are drawn in index order with premultiplied source-over.
	// Each instance only shades its bounding quad, regardless of particle count.
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.disable(gl.SCISSOR_TEST);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.useProgram(state.program);
	gl.bindVertexArray(state.vao);
	gl.uniform1i(uniforms.uSource, 0);
	gl.uniform2f(uniforms.uResolution, width, height);
	gl.uniform1i(uniforms.uSnow, type === 'snow' ? 1 : 0);
	gl.uniform1f(uniforms.uTime, params.time);
	gl.uniform1ui(uniforms.uSeed, params.seed);
	gl.uniform2f(uniforms.uOffset, params.offset[0], params.offset[1]);
	gl.uniform1f(uniforms.uSize, params.size);
	gl.uniform1f(uniforms.uSizeVariation, params.sizeVariation);
	gl.uniform1f(uniforms.uSceneDepth, params.sceneDepth);
	gl.uniform1f(uniforms.uSpeed, params.speed);
	gl.uniform1f(uniforms.uSpeedVariation, params.speedVariation);
	gl.uniform1f(uniforms.uWind, params.wind);
	gl.uniform1f(uniforms.uWindVariation, params.windVariation);
	gl.uniform1f(uniforms.uSpread, params.spread);
	gl.uniform1f(uniforms.uWiggleAmount, params.wiggleAmount);
	gl.uniform1f(uniforms.uWiggleAmountVariation, params.wiggleAmountVariation);
	gl.uniform1f(uniforms.uWiggleFrequency, params.wiggleFrequency);
	gl.uniform1f(
		uniforms.uWiggleFrequencyVariation,
		params.wiggleFrequencyVariation,
	);
	gl.uniform4f(
		uniforms.uColor,
		color[0] / 255,
		color[1] / 255,
		color[2] / 255,
		color[3] / 255,
	);
	gl.uniform1f(uniforms.uOpacity, params.opacity);
	gl.uniform1i(uniforms.uRefract, params.appearance === 'refracting' ? 1 : 0);
	gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, params.count);

	gl.disable(gl.BLEND);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, state.weatherTexture);
	gl.useProgram(state.compositeProgram);
	gl.uniform1i(compositeUniforms.uSource, 0);
	gl.uniform1i(compositeUniforms.uWeather, 1);
	gl.uniform1i(
		compositeUniforms.uCompositeWithOriginal,
		params.compositeWithOriginal ? 1 : 0,
	);
	gl.uniform1i(
		compositeUniforms.uLighten,
		params.transferMode === 'lighten' ? 1 : 0,
	);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};

export const cleanupWeather = (state: WeatherState): void => {
	const {gl} = state;
	gl.deleteFramebuffer(state.framebuffer);
	gl.deleteTexture(state.weatherTexture);
	gl.deleteTexture(state.sourceTexture);
	gl.deleteVertexArray(state.vao);
	gl.deleteProgram(state.compositeProgram);
	gl.deleteProgram(state.program);
};
