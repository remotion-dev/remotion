export type ShatterState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aUv;
layout(location = 2) in float aShade;
layout(location = 3) in float aSide;

uniform vec2 uResolution;

out vec2 vUv;
out float vShade;
out float vSide;

void main() {
	float distance = max(uResolution.x, uResolution.y) * 2.0;
	float near = distance * 0.05;
	float w = distance + aPosition.z;
	vec2 position = vec2(
		(aPosition.x - uResolution.x * 0.5) * 2.0 / uResolution.x,
		(uResolution.y * 0.5 - aPosition.y) * 2.0 / uResolution.y
	);
	// Keep homogeneous coordinates so WebGL clips shards at the near plane
	// and interpolates their texture coordinates with perspective correction.
	gl_Position = vec4(position * distance, w - 2.0 * near, w);
	vUv = vec2(aUv.x, 1.0 - aUv.y);
	vShade = aShade;
	vSide = aSide;
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uSource;

in vec2 vUv;
in float vShade;
in float vSide;
out vec4 fragColor;

void main() {
	vec4 source = texture(uSource, vUv);
	// The sides inherit the source alpha at the shard edge. A transparent
	// image must not acquire opaque geometry when extrusion is enabled.
	vec3 color = mix(source.rgb, vec3(source.a), vSide);
	fragColor = vec4(color * vShade, source.a);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create Shatter shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Shatter shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

export const setupShatter = (gl: WebGL2RenderingContext): ShatterState => {
	const program = gl.createProgram();
	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	const texture = gl.createTexture();
	const shaders: WebGLShader[] = [];

	try {
		if (!program || !vao || !vbo || !texture) {
			throw new Error('Failed to create Shatter WebGL resources');
		}

		shaders.push(compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
		shaders.push(compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
		for (const shader of shaders) {
			gl.attachShader(program, shader);
		}

		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(
				`Shatter program link failed: ${gl.getProgramInfoLog(program) ?? '(no log)'}`,
			);
		}

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 28, 12);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 28, 20);
		gl.enableVertexAttribArray(3);
		gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 28, 24);
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return {
			gl,
			program,
			vao,
			vbo,
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
		};
	} catch (error) {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteVertexArray(vao);
		gl.deleteProgram(program);
		throw error;
	} finally {
		for (const shader of shaders) {
			gl.deleteShader(shader);
		}
	}
};

export const drawShatter = ({
	state,
	source,
	width,
	height,
	flipSourceY,
	vertices,
}: {
	readonly state: ShatterState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly flipSourceY: boolean;
	readonly vertices: Float32Array;
}): void => {
	const {gl, program, vao, vbo, texture, uSource, uResolution} = state;
	gl.viewport(0, 0, width, height);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Faces arrive in painter's order. Blending preserves translucent sources
	// without letting their transparent pixels occlude the fragments behind.
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.useProgram(program);
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);
	gl.uniform1i(uSource, 0);
	gl.uniform2f(uResolution, width, height);
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 7);

	gl.bindVertexArray(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
	gl.disable(gl.BLEND);
};

export const cleanupShatter = ({
	gl,
	program,
	vao,
	vbo,
	texture,
}: ShatterState): void => {
	gl.deleteTexture(texture);
	gl.deleteBuffer(vbo);
	gl.deleteVertexArray(vao);
	gl.deleteProgram(program);
};
