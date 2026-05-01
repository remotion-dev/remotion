import React, {useCallback, useEffect, useRef, useState} from 'react';
import {type SequenceControls, type SequenceSchema} from 'remotion';
import {
	AbsoluteFill,
	Internals,
	Sequence,
	useDelayRender,
	useVideoConfig,
	type AbsoluteFillLayout,
	type LayoutAndStyle,
	type SequenceProps,
} from 'remotion';

export type StarburstProps = Omit<
	SequenceProps,
	'children' | 'durationInFrames' | keyof LayoutAndStyle
> &
	Omit<AbsoluteFillLayout, 'layout'> & {
		readonly durationInFrames?: number;
		readonly rays: number;
		readonly colors: readonly string[];
		readonly rotation?: number;
		readonly smoothness?: number;
		readonly vignette?: number;
		readonly originOffsetX?: number;
		readonly originOffsetY?: number;
	};

const hexToRgb = (hex: string): [number, number, number] => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) {
		throw new Error(`Invalid hex color: ${hex}`);
	}

	return [
		parseInt(result[1], 16) / 255,
		parseInt(result[2], 16) / 255,
		parseInt(result[3], 16) / 255,
	];
};

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float numRays;
uniform float rotationOffset;
uniform float smoothEdge;
uniform vec2 resolution;
uniform sampler2D colorPalette;
uniform float numColors;
uniform float vignetteAmount;
uniform vec2 originOffset;

const float Pi = 3.14159265359;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 center = uv - 0.5 - originOffset;
    center.x *= resolution.x / resolution.y;

    float angle = atan(center.y, center.x) + rotationOffset;
    float normalizedAngle = (angle + Pi) / (2.0 * Pi);
    float sector = normalizedAngle * numRays;
    float rayIndex = mod(floor(sector), numRays);

    float colorIndex = mod(rayIndex, numColors);
    float texCoord = (colorIndex + 0.5) / numColors;
    vec3 col = texture2D(colorPalette, vec2(texCoord, 0.5)).rgb;

    float fractSector = fract(sector);
    float edgeSmooth = smoothEdge * 0.5;
    float nextColorIndex = mod(rayIndex + 1.0, numColors);
    float nextTexCoord = (nextColorIndex + 0.5) / numColors;
    vec3 nextCol = texture2D(colorPalette, vec2(nextTexCoord, 0.5)).rgb;

    float blend = smoothstep(1.0 - edgeSmooth, 1.0, fractSector);
    col = mix(col, nextCol, blend);
    float blendStart = smoothstep(edgeSmooth, 0.0, fractSector);
    float prevColorIndex = mod(rayIndex - 1.0 + numColors, numColors);
    float prevTexCoord = (prevColorIndex + 0.5) / numColors;
    vec3 prevCol = texture2D(colorPalette, vec2(prevTexCoord, 0.5)).rgb;
    col = mix(col, prevCol, blendStart);

    vec2 vignetteCenter = (uv - 0.5) * vec2(resolution.x / resolution.y, 1.0);
    float dist = length(vignetteCenter);
    float radius = vignetteAmount * 3.0;
    float alpha = smoothstep(radius, radius * 0.5, dist);

    gl_FragColor = vec4(col, alpha);
}
`;

type GlContext = {
	gl: WebGLRenderingContext;
	resLoc: WebGLUniformLocation;
	numRaysLoc: WebGLUniformLocation;
	rotationOffsetLoc: WebGLUniformLocation;
	smoothEdgeLoc: WebGLUniformLocation;
	numColorsLoc: WebGLUniformLocation;
	vignetteAmountLoc: WebGLUniformLocation;
	originOffsetLoc: WebGLUniformLocation;
	colorTexture: WebGLTexture;
};

const StarburstCanvas: React.FC<{
	readonly rays: number;
	readonly colors: readonly string[];
	readonly rotation: number;
	readonly smoothness: number;
	readonly vignette: number;
	readonly originOffsetX: number;
	readonly originOffsetY: number;
}> = ({
	rays,
	colors,
	rotation,
	smoothness,
	vignette,
	originOffsetX,
	originOffsetY,
}) => {
	const {width, height} = useVideoConfig();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const glRef = useRef<GlContext | null>(null);

	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender());

	const initGl = useCallback(
		(canvas: HTMLCanvasElement): GlContext | null => {
			const gl = canvas.getContext('webgl', {
				premultipliedAlpha: false,
				alpha: true,
			});
			if (!gl) {
				cancelRender(
					new Error(
						'Failed to get WebGL context. Try rendering with --gl=angle to enable WebGL.',
					),
				);
				return null;
			}

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			const compile = (type: number, src: string) => {
				const s = gl.createShader(type)!;
				gl.shaderSource(s, src);
				gl.compileShader(s);
				return s;
			};

			const program = gl.createProgram()!;
			gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
			gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
			gl.linkProgram(program);
			gl.useProgram(program);

			const buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
				gl.STATIC_DRAW,
			);
			const pos = gl.getAttribLocation(program, 'position');
			gl.enableVertexAttribArray(pos);
			gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

			const colorTexture = gl.createTexture()!;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, colorTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			const paletteLoc = gl.getUniformLocation(program, 'colorPalette')!;
			gl.uniform1i(paletteLoc, 0);

			continueRender(handle);

			return {
				gl,
				resLoc: gl.getUniformLocation(program, 'resolution')!,
				numRaysLoc: gl.getUniformLocation(program, 'numRays')!,
				rotationOffsetLoc: gl.getUniformLocation(program, 'rotationOffset')!,
				smoothEdgeLoc: gl.getUniformLocation(program, 'smoothEdge')!,
				numColorsLoc: gl.getUniformLocation(program, 'numColors')!,
				vignetteAmountLoc: gl.getUniformLocation(program, 'vignetteAmount')!,
				originOffsetLoc: gl.getUniformLocation(program, 'originOffset')!,
				colorTexture,
			};
		},
		[continueRender, handle, cancelRender],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || glRef.current) return;
		glRef.current = initGl(canvas);
	}, [initGl]);

	useEffect(() => {
		const ctx = glRef.current;
		if (!ctx) return;
		const {
			gl,
			resLoc,
			numRaysLoc,
			rotationOffsetLoc,
			smoothEdgeLoc,
			numColorsLoc,
			vignetteAmountLoc,
			originOffsetLoc,
			colorTexture,
		} = ctx;

		const rotationRad = (rotation * Math.PI) / 180;

		const pixelData = new Uint8Array(colors.length * 4);
		for (let i = 0; i < colors.length; i++) {
			const rgb = hexToRgb(colors[i]);
			pixelData[i * 4] = Math.round(rgb[0] * 255);
			pixelData[i * 4 + 1] = Math.round(rgb[1] * 255);
			pixelData[i * 4 + 2] = Math.round(rgb[2] * 255);
			pixelData[i * 4 + 3] = 255;
		}

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, colorTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			colors.length,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			pixelData,
		);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(numRaysLoc, rays);
		gl.uniform1f(numColorsLoc, colors.length);
		gl.uniform1f(rotationOffsetLoc, rotationRad);
		gl.uniform1f(smoothEdgeLoc, smoothness);
		gl.uniform1f(vignetteAmountLoc, vignette);
		gl.uniform2f(originOffsetLoc, originOffsetX, originOffsetY);
		gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}, [
		rays,
		colors,
		rotation,
		smoothness,
		vignette,
		originOffsetX,
		originOffsetY,
		width,
		height,
	]);

	return (
		<AbsoluteFill>
			<canvas ref={canvasRef} width={width} height={height} />
		</AbsoluteFill>
	);
};

/*
 * @description Renders a static WebGL-based starburst ray pattern as a Sequence.
 * @see [Documentation](https://www.remotion.dev/docs/starburst/starburst)
 */
const starburstSchema = {
	rays: {
		type: 'number',
		min: 2,
		max: 100,
		step: 1,
		default: 12,
		description: 'Number of Rays',
	},
	rotation: {
		type: 'number',
		min: 0,
		max: 360,
		step: 1,
		default: 0,
		description: 'Rotation',
	},
	smoothness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Edge Smoothness',
	},
	vignette: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Vignette',
	},
	originOffsetX: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Origin Offset X',
	},
	originOffsetY: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Origin Offset Y',
	},
	'style.translate': {
		type: 'translate',
		step: 1,
		default: '0px 0px',
		description: 'Position',
	},
	'style.scale': {
		type: 'number',
		min: 0.05,
		max: 100,
		step: 0.01,
		default: 1,
		description: 'Scale',
	},
	'style.rotate': {
		type: 'rotation',
		step: 1,
		default: '0deg',
		description: 'Rotation',
	},
	'style.opacity': {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Opacity',
	},
} as const satisfies SequenceSchema;

const StarburstInner: React.FC<
	StarburstProps & {
		readonly _experimentalControls: SequenceControls | undefined;
	}
> = ({
	rays,
	colors,
	rotation = 0,
	smoothness = 0,
	vignette = 1,
	originOffsetX = 0,
	originOffsetY = 0,
	durationInFrames,
	style,
	_experimentalControls: controls,
	...sequenceProps
}) => {
	const {durationInFrames: videoDuration} = useVideoConfig();
	const resolvedDuration = durationInFrames ?? videoDuration;

	if (typeof rays !== 'number' || !Number.isFinite(rays)) {
		throw new TypeError(
			`"rays" must be a finite number, but got ${JSON.stringify(rays)}`,
		);
	}

	if (rays < 2 || rays > 100) {
		throw new RangeError(`"rays" must be between 2 and 100, but got ${rays}`);
	}

	if (!Array.isArray(colors) || colors.length < 2) {
		throw new TypeError(
			`"colors" must be an array with at least 2 colors, but got ${JSON.stringify(colors)}`,
		);
	}

	if (typeof rotation !== 'number' || !Number.isFinite(rotation)) {
		throw new TypeError(
			`"rotation" must be a finite number, but got ${JSON.stringify(rotation)}`,
		);
	}

	if (typeof smoothness !== 'number' || !Number.isFinite(smoothness)) {
		throw new TypeError(
			`"smoothness" must be a finite number, but got ${JSON.stringify(smoothness)}`,
		);
	}

	if (smoothness < 0 || smoothness > 1) {
		throw new RangeError(
			`"smoothness" must be between 0 and 1, but got ${smoothness}`,
		);
	}

	if (typeof vignette !== 'number' || !Number.isFinite(vignette)) {
		throw new TypeError(
			`"vignette" must be a finite number, but got ${JSON.stringify(vignette)}`,
		);
	}

	if (vignette < 0 || vignette > 1) {
		throw new RangeError(
			`"vignette" must be between 0 and 1, but got ${vignette}`,
		);
	}

	return (
		<Sequence
			durationInFrames={resolvedDuration}
			name="<Starburst>"
			_experimentalControls={controls}
			{...sequenceProps}
			style={style}
		>
			<StarburstCanvas
				rays={rays}
				colors={colors}
				rotation={rotation}
				smoothness={smoothness}
				vignette={vignette}
				originOffsetX={originOffsetX}
				originOffsetY={originOffsetY}
			/>
		</Sequence>
	);
};

export const Starburst = Internals.wrapInSchema(
	StarburstInner,
	starburstSchema,
);

Starburst.displayName = 'Starburst';

Internals.addSequenceStackTraces(Starburst);
