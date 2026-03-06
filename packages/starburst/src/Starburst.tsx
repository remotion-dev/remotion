import React, {useCallback, useEffect, useRef, useState} from 'react';
import {type SequenceControls, type SequenceSchema} from 'remotion';
import {
	AbsoluteFill,
	Internals,
	Sequence,
	useCurrentFrame,
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
		readonly rays?: number;
		readonly color1?: string;
		readonly color2?: string;
		readonly rotation?: number;
		readonly smoothness?: number;
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

uniform float progress;
uniform float numRays;
uniform vec3 color1;
uniform vec3 color2;
uniform float rotationOffset;
uniform float smoothEdge;
uniform vec2 resolution;

const float Pi = 3.14159265359;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 center = uv - 0.5;
    center.x *= resolution.x / resolution.y;

    float angle = atan(center.y, center.x) + rotationOffset;
    float rayPattern = cos(angle * numRays) * 0.5 + 0.5;

    float edgeSmooth = smoothEdge * 0.5;
    float ray = smoothstep(0.5 - edgeSmooth, 0.5 + edgeSmooth, rayPattern);

    vec3 col = mix(color2, color1, ray);

    float dist = length(center);

    float revealRadius = progress * 2.0;
    float alpha = smoothstep(revealRadius, revealRadius - 0.3, dist);

    float retractProgress = max(0.0, progress * 2.0 - 1.0);
    float innerRadius = retractProgress * 1.5;
    float retractAlpha = smoothstep(innerRadius - 0.3, innerRadius, dist);

    alpha *= retractAlpha;

    gl_FragColor = vec4(col, alpha);
}
`;

type GlContext = {
	gl: WebGLRenderingContext;
	resLoc: WebGLUniformLocation;
	progressLoc: WebGLUniformLocation;
	numRaysLoc: WebGLUniformLocation;
	color1Loc: WebGLUniformLocation;
	color2Loc: WebGLUniformLocation;
	rotationOffsetLoc: WebGLUniformLocation;
	smoothEdgeLoc: WebGLUniformLocation;
};

const StarburstCanvas: React.FC<{
	readonly rays: number;
	readonly color1: string;
	readonly color2: string;
	readonly rotation: number;
	readonly smoothness: number;
}> = ({rays, color1, color2, rotation, smoothness}) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
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

			continueRender(handle);

			return {
				gl,
				resLoc: gl.getUniformLocation(program, 'resolution')!,
				progressLoc: gl.getUniformLocation(program, 'progress')!,
				numRaysLoc: gl.getUniformLocation(program, 'numRays')!,
				color1Loc: gl.getUniformLocation(program, 'color1')!,
				color2Loc: gl.getUniformLocation(program, 'color2')!,
				rotationOffsetLoc: gl.getUniformLocation(program, 'rotationOffset')!,
				smoothEdgeLoc: gl.getUniformLocation(program, 'smoothEdge')!,
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
			progressLoc,
			numRaysLoc,
			color1Loc,
			color2Loc,
			rotationOffsetLoc,
			smoothEdgeLoc,
		} = ctx;

		const normalized =
			durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);

		const rgb1 = hexToRgb(color1);
		const rgb2 = hexToRgb(color2);
		const rotationRad = (rotation * Math.PI) / 180;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(progressLoc, normalized);
		gl.uniform1f(numRaysLoc, rays);
		gl.uniform3f(color1Loc, rgb1[0], rgb1[1], rgb1[2]);
		gl.uniform3f(color2Loc, rgb2[0], rgb2[1], rgb2[2]);
		gl.uniform1f(rotationOffsetLoc, rotationRad);
		gl.uniform1f(smoothEdgeLoc, smoothness);
		gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}, [
		frame,
		durationInFrames,
		rays,
		color1,
		color2,
		rotation,
		smoothness,
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
 * @description Renders a WebGL-based starburst ray effect as a Sequence.
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
		default: 0.1,
		description: 'Edge Smoothness',
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
		readonly controls: SequenceControls | undefined;
	}
> = ({
	rays = 12,
	color1 = '#ffdd00',
	color2 = '#ff8800',
	rotation = 0,
	smoothness = 0.1,
	durationInFrames,
	style,
	controls,
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

	return (
		<Sequence
			durationInFrames={resolvedDuration}
			name="<Starburst>"
			controls={controls}
			{...sequenceProps}
			style={style}
		>
			<StarburstCanvas
				rays={rays}
				color1={color1}
				color2={color2}
				rotation={rotation}
				smoothness={smoothness}
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
