import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
	type SequenceProps,
} from 'remotion';

export type LightLeakProps = Omit<
	SequenceProps,
	'children' | 'layout' | 'durationInFrames'
> & {
	readonly durationInFrames: number;
	readonly seed?: number;
	readonly hueShift?: number;
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

uniform float evolveProgress;
uniform float retractProgress;
uniform float seed;
uniform float retractSeed;
uniform float hueShift;
uniform vec2 resolution;

const float Pi = 3.14159;

vec3 computePattern(vec2 uv, float s, float t) {
    vec2 p = uv * 0.8;
    p += vec2(sin(s * 1.61803) * 5.0, cos(s * 2.71828) * 5.0);

    for(int i = 1; i < 5; i++)
    {
        vec2 newp = p;
        float fi = float(i);
        float phase = s * 0.7 * fi;
        newp.x += 0.6 / fi * cos(fi * p.y + t * 0.7 + 0.3 * fi + phase) + 20.0;
        newp.y += 0.6 / fi * cos(fi * p.x + t * 0.7 + 0.3 * float(i + 10) + phase) - 20.0 + 15.0;
        p = newp;
    }

    float v1 = 0.5 * sin(2.0 * p.x) + 0.5;
    float v2 = 0.5 * sin(2.0 * p.y) + 0.5;
    float blend = sin(p.x + p.y) * 0.5 + 0.5;
    float brightness = v1 * 0.5 + v2 * 0.5;
    float patternValue = brightness * 0.6 + blend * 0.4;

    return vec3(brightness, blend, patternValue);
}

void main()
{
    float refScale = 1.92;
    vec2 uv = (gl_FragCoord.xy / resolution) * vec2(refScale, refScale * resolution.y / resolution.x);

    vec3 patA = computePattern(uv, seed, evolveProgress * Pi);
    float threshA = 1.0 - evolveProgress;
    float revealAlpha = smoothstep(threshA, threshA + 0.3, patA.z);

    vec2 maxUv = vec2(refScale, refScale * resolution.y / resolution.x);
    vec2 retractUv = maxUv - uv;
    vec3 patB = computePattern(retractUv, retractSeed, retractProgress * Pi);
    float threshB = 1.0 - retractProgress;
    float eraseAlpha = smoothstep(threshB, threshB + 0.3, patB.z);

    float alpha = revealAlpha * (1.0 - eraseAlpha);

    vec3 yellow = vec3(1.0, 0.85, 0.2);
    vec3 orange = vec3(1.0, 0.5, 0.05);
    vec3 col = mix(yellow, orange, patA.y);
    col *= 0.6 + 0.6 * patA.x;

    float angle = hueShift * Pi / 180.0;
    float cosA = cos(angle);
    float sinA = sin(angle);
    mat3 hueRot = mat3(
        cosA + (1.0 - cosA) / 3.0,
        (1.0 - cosA) / 3.0 - sinA * 0.57735,
        (1.0 - cosA) / 3.0 + sinA * 0.57735,
        (1.0 - cosA) / 3.0 + sinA * 0.57735,
        cosA + (1.0 - cosA) / 3.0,
        (1.0 - cosA) / 3.0 - sinA * 0.57735,
        (1.0 - cosA) / 3.0 - sinA * 0.57735,
        (1.0 - cosA) / 3.0 + sinA * 0.57735,
        cosA + (1.0 - cosA) / 3.0
    );
    col = clamp(hueRot * col, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
}
`;

type GlContext = {
	gl: WebGLRenderingContext;
	resLoc: WebGLUniformLocation;
	evolveProgressLoc: WebGLUniformLocation;
	retractProgressLoc: WebGLUniformLocation;
	seedLoc: WebGLUniformLocation;
	retractSeedLoc: WebGLUniformLocation;
	hueShiftLoc: WebGLUniformLocation;
};

const LightLeakCanvas: React.FC<{
	readonly seed: number;
	readonly hueShift: number;
}> = ({seed, hueShift}) => {
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
				evolveProgressLoc: gl.getUniformLocation(program, 'evolveProgress')!,
				retractProgressLoc: gl.getUniformLocation(program, 'retractProgress')!,
				seedLoc: gl.getUniformLocation(program, 'seed')!,
				retractSeedLoc: gl.getUniformLocation(program, 'retractSeed')!,
				hueShiftLoc: gl.getUniformLocation(program, 'hueShift')!,
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
			evolveProgressLoc,
			retractProgressLoc,
			seedLoc,
			retractSeedLoc,
			hueShiftLoc,
		} = ctx;

		const normalized =
			durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);
		const evolveProgress = Math.min(1, normalized * 2);
		const retractProgress = Math.max(0, normalized * 2 - 1);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(evolveProgressLoc, evolveProgress);
		gl.uniform1f(retractProgressLoc, retractProgress);
		gl.uniform1f(seedLoc, seed);
		gl.uniform1f(retractSeedLoc, seed + 42.0);
		gl.uniform1f(hueShiftLoc, hueShift);
		gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}, [frame, durationInFrames, seed, hueShift, width, height]);

	return (
		<AbsoluteFill>
			<canvas ref={canvasRef} width={width} height={height} />
		</AbsoluteFill>
	);
};

/*
 * @description Renders a WebGL-based light leak effect as a Sequence.
 * @see [Documentation](https://www.remotion.dev/docs/light-leaks/light-leak)
 */
export const LightLeak: React.FC<LightLeakProps> = ({
	seed = 0,
	hueShift = 0,
	...sequenceProps
}) => {
	if (typeof seed !== 'number' || !Number.isFinite(seed)) {
		throw new TypeError(
			`"seed" must be a finite number, but got ${JSON.stringify(seed)}`,
		);
	}

	if (typeof hueShift !== 'number' || !Number.isFinite(hueShift)) {
		throw new TypeError(
			`"hueShift" must be a finite number, but got ${JSON.stringify(hueShift)}`,
		);
	}

	if (hueShift < 0 || hueShift > 360) {
		throw new RangeError(
			`"hueShift" must be between 0 and 360, but got ${hueShift}`,
		);
	}

	return (
		<Sequence {...sequenceProps}>
			<LightLeakCanvas seed={seed} hueShift={hueShift} />
		</Sequence>
	);
};
