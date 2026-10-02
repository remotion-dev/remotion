import {createEffect, type InteractivitySchema} from 'remotion';

// A grid of light leaks drawn in a single WebGL pass. Chrome keeps at most 16
// WebGL contexts alive and every effect chain uses two, so nine separate
// lightLeak() tiles would force-lose contexts. The pattern and hue math are
// ported from @remotion/effects/light-leak.

export type LeakGridParams = {
	readonly cols?: number;
	readonly rows?: number;
	readonly gap?: number;
	readonly radius?: number;
	readonly inset?: number;
	readonly seed?: number;
	readonly seedOffset?: number;
	readonly hueShift?: number;
	readonly hueSpread?: number;
	readonly progress?: number;
	readonly progressWobble?: number;
	readonly phase?: number;
	// Per-tile entrance, 0 (hidden) to 1 (fully shown). Up to 16 tiles.
	readonly appear?: readonly number[];
};

type Resolved = Required<Omit<LeakGridParams, 'appear'>> & {
	appear: number[];
};

const resolve = (p: LeakGridParams): Resolved => ({
	cols: p.cols ?? 3,
	rows: p.rows ?? 3,
	gap: p.gap ?? 18,
	radius: p.radius ?? 20,
	inset: p.inset ?? 20,
	seed: p.seed ?? 1,
	seedOffset: p.seedOffset ?? 0,
	hueShift: p.hueShift ?? 0,
	hueSpread: p.hueSpread ?? 0,
	progress: p.progress ?? 0.45,
	progressWobble: p.progressWobble ?? 0.18,
	phase: p.phase ?? 0,
	appear: Array.from({length: 16}, (_, i) => p.appear?.[i] ?? 1),
});

const schema = {
	seed: {
		type: 'number',
		default: 1,
		description: 'Seed',
		hiddenFromList: false,
	},
	hueShift: {
		type: 'number',
		min: 0,
		max: 360,
		default: 0,
		description: 'Hue Shift',
		hiddenFromList: false,
	},
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.45,
		description: 'Progress',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const VS = /* glsl */ `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FS = /* glsl */ `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 resolution;
uniform vec2 grid;
uniform float gap;
uniform float radius;
uniform float inset;
uniform float seed;
uniform float seedOffset;
uniform float hueShift;
uniform float hueSpread;
uniform float progress;
uniform float progressWobble;
uniform float phase;
uniform float appear[16];

const float Pi = 3.14159;

vec3 computePattern(vec2 uv, float s, float t) {
  vec2 p = uv * 0.8;
  p += vec2(sin(s * 1.61803) * 5.0, cos(s * 2.71828) * 5.0);
  for (int i = 1; i < 5; i++) {
    vec2 newp = p;
    float fi = float(i);
    float ph = s * 0.7 * fi;
    newp.x += 0.6 / fi * cos(fi * p.y + t * 0.7 + 0.3 * fi + ph) + 20.0;
    newp.y += 0.6 / fi * cos(fi * p.x + t * 0.7 + 0.3 * float(i + 10) + ph) - 20.0 + 15.0;
    p = newp;
  }
  float v1 = 0.5 * sin(2.0 * p.x) + 0.5;
  float v2 = 0.5 * sin(2.0 * p.y) + 0.5;
  float blend = sin(p.x + p.y) * 0.5 + 0.5;
  float brightness = v1 * 0.5 + v2 * 0.5;
  return vec3(brightness, blend, brightness * 0.6 + blend * 0.4);
}

vec3 hueRotate(vec3 col, float degrees) {
  float angle = degrees * Pi / 180.0;
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
  return clamp(hueRot * col, 0.0, 1.0);
}

float roundedBox(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec4 leak(vec2 uv, vec2 maxUv, float s, float prog, float hue) {
  float evolve = min(1.0, prog * 2.0);
  float retract = max(0.0, prog * 2.0 - 1.0);
  vec3 patA = computePattern(uv, s, evolve * Pi);
  float threshA = 1.0 - evolve;
  float reveal = smoothstep(threshA, threshA + 0.3, patA.z);
  vec2 retractUv = maxUv - uv;
  vec3 patB = computePattern(retractUv, s + 42.0, retract * Pi);
  float threshB = 1.0 - retract;
  float erase = smoothstep(threshB, threshB + 0.3, patB.z);
  vec3 col = mix(vec3(1.0, 0.85, 0.2), vec3(1.0, 0.5, 0.05), patA.y);
  col *= 0.6 + 0.6 * patA.x;
  return vec4(hueRotate(col, hue), reveal * (1.0 - erase));
}

void main() {
  // Top-left origin in pixels.
  vec2 px = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
  vec2 area = resolution - 2.0 * inset;
  vec2 tile = (area - gap * (grid - 1.0)) / grid;
  vec2 local = px - inset;
  vec2 cell = floor(local / (tile + gap));
  cell = clamp(cell, vec2(0.0), grid - 1.0);
  vec2 center = inset + cell * (tile + gap) + tile * 0.5;
  int index = int(cell.y * grid.x + cell.x);
  float a = appear[index];
  vec2 halfSize = tile * 0.5 * (0.55 + 0.45 * a);

  float d = roundedBox(px - center, halfSize, radius);
  float inside = 1.0 - smoothstep(-0.75, 0.75, d);
  float shadowD = roundedBox(px - center - vec2(0.0, 10.0), halfSize, radius);
  float shadow = 0.2 * (1.0 - smoothstep(-6.0, 26.0, shadowD));
  float visible = min(1.0, a * 1.6);

  float fi = float(index);
  vec2 uvTile = (px - center + halfSize) / (2.0 * halfSize);
  vec2 maxUv = vec2(1.92, 1.92 * tile.y / tile.x);
  vec2 uv = vec2(uvTile.x, 1.0 - uvTile.y) * maxUv;
  float tileProgress = progress + progressWobble * sin(phase + fi * 0.93);
  vec4 l = leak(uv, maxUv, seed + fi * 11.0 + seedOffset, clamp(tileProgress, 0.0, 1.0), mod(hueShift + fi * hueSpread, 360.0));

  vec3 base = vec3(0.078, 0.059, 0.043);
  vec3 col = mix(base, l.rgb, l.a);
  float alphaTile = inside * visible;
  float alphaShadow = shadow * visible * (1.0 - inside);
  // Premultiplied output.
  fragColor = vec4(col * alphaTile, alphaTile + alphaShadow);
}
`;

type State = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	u: Record<string, WebGLUniformLocation | null>;
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create shader for leakGrid()');
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`leakGrid() shader: ${gl.getShaderInfoLog(shader)}`);
	}
	return shader;
};

export const leakGrid = createEffect<LeakGridParams, State>({
	type: 'dev.remotion.whatsnew.leakGrid',
	label: 'leakGrid()',
	documentationLink: null,
	backend: 'webgl2',
	calculateKey: (params) => `leak-grid-${JSON.stringify(resolve(params))}`,
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw new Error('Could not get a WebGL2 context for leakGrid().');
		}
		const program = gl.createProgram();
		if (!program) {
			throw new Error('Failed to create program for leakGrid()');
		}
		const vs = compile(gl, gl.VERTEX_SHADER, VS);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(`leakGrid() link: ${gl.getProgramInfoLog(program)}`);
		}
		const vao = gl.createVertexArray();
		const vbo = gl.createBuffer();
		if (!vao || !vbo) {
			throw new Error('Failed to create buffers for leakGrid()');
		}
		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW,
		);
		const aPos = gl.getAttribLocation(program, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 8, 0);
		gl.bindVertexArray(null);

		const names = [
			'resolution',
			'grid',
			'gap',
			'radius',
			'inset',
			'seed',
			'seedOffset',
			'hueShift',
			'hueSpread',
			'progress',
			'progressWobble',
			'phase',
			'appear',
		];
		const u = Object.fromEntries(
			names.map((n) => [n, gl.getUniformLocation(program, n)]),
		);
		return {gl, program, vao, vbo, u};
	},
	apply: ({width, height, params, state}) => {
		const r = resolve(params);
		const {gl, program, vao, u} = state;
		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);
		gl.bindVertexArray(vao);
		gl.uniform2f(u.resolution, width, height);
		gl.uniform2f(u.grid, r.cols, r.rows);
		gl.uniform1f(u.gap, r.gap);
		gl.uniform1f(u.radius, r.radius);
		gl.uniform1f(u.inset, r.inset);
		gl.uniform1f(u.seed, r.seed);
		gl.uniform1f(u.seedOffset, r.seedOffset);
		gl.uniform1f(u.hueShift, r.hueShift);
		gl.uniform1f(u.hueSpread, r.hueSpread);
		gl.uniform1f(u.progress, r.progress);
		gl.uniform1f(u.progressWobble, r.progressWobble);
		gl.uniform1f(u.phase, r.phase);
		gl.uniform1fv(u.appear, new Float32Array(r.appear));
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo}) => {
		gl.deleteBuffer(vbo);
		gl.deleteVertexArray(vao);
		gl.deleteProgram(program);
	},
	schema,
	validateParams: (params) => {
		const r = resolve(params);
		if (r.cols * r.rows > 16) {
			throw new TypeError('leakGrid() supports at most 16 tiles');
		}
	},
});
