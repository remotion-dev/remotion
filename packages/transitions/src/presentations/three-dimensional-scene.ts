import {uploadElementImage} from './upload-element-image';

export const makeThreeDimensionalSceneRenderer = (canvas: OffscreenCanvas) => {
	const gl = canvas.getContext('webgl2', {
		alpha: true,
		antialias: true,
		premultipliedAlpha: true,
	});
	if (!gl) {
		throw new Error('Failed to create 3D transition canvas context');
	}

	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create 3D transition program');
	}

	for (const [type, source] of [
		[
			gl.VERTEX_SHADER,
			`#version 300 es
in vec2 a_uv;
uniform vec2 u_resolution;
uniform vec2 u_origin;
uniform vec2 u_rotation;
uniform float u_translation;
uniform float u_perspective;
uniform bool u_vertical;
out vec2 v_uv;

void main() {
	vec2 point = (a_uv - u_origin) * u_resolution;
	float depth;
	if (u_vertical) {
		depth = point.y * u_rotation.y;
		point.y = point.y * u_rotation.x + u_translation * u_resolution.y;
	} else {
		depth = -point.x * u_rotation.y;
		point.x = point.x * u_rotation.x + u_translation * u_resolution.x;
	}
	point += (u_origin - 0.5) * u_resolution;
	gl_Position = vec4(point.x * 2.0 / u_resolution.x, -point.y * 2.0 / u_resolution.y, 0.0, 1.0 - depth / u_perspective);
	v_uv = a_uv;
}`,
		],
		[
			gl.FRAGMENT_SHADER,
			`#version 300 es
precision highp float;
uniform sampler2D u_image;
in vec2 v_uv;
out vec4 outColor;

void main() {
	outColor = texture(u_image, v_uv);
}`,
		],
	] as const) {
		const shader = gl.createShader(type);
		if (!shader) {
			throw new Error('Failed to create 3D transition shader');
		}

		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const message = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			gl.deleteProgram(program);
			throw new Error(`Failed to compile 3D transition shader: ${message}`);
		}

		gl.attachShader(program, shader);
		gl.deleteShader(shader);
	}

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const message = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Failed to link 3D transition program: ${message}`);
	}

	const vertexArray = gl.createVertexArray();
	const buffer = gl.createBuffer();
	const texture = gl.createTexture();
	gl.bindVertexArray(vertexArray);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
		gl.STATIC_DRAW,
	);
	const uvLocation = gl.getAttribLocation(program, 'a_uv');
	gl.enableVertexAttribArray(uvLocation);
	gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CW);

	const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
	const originLocation = gl.getUniformLocation(program, 'u_origin');
	const rotationLocation = gl.getUniformLocation(program, 'u_rotation');
	const translationLocation = gl.getUniformLocation(program, 'u_translation');
	const perspectiveLocation = gl.getUniformLocation(program, 'u_perspective');
	const verticalLocation = gl.getUniformLocation(program, 'u_vertical');
	const imageLocation = gl.getUniformLocation(program, 'u_image');

	return {
		clear: () => {
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
		},
		cleanup: () => {
			gl.deleteTexture(texture);
			gl.deleteBuffer(buffer);
			gl.deleteVertexArray(vertexArray);
			gl.deleteProgram(program);
		},
		draw: ({
			image,
			width,
			height,
			vertical,
			angle,
			originX,
			originY,
			translation,
			perspective,
		}: {
			image: OffscreenCanvas;
			width: number;
			height: number;
			vertical: boolean;
			angle: number;
			originX: number;
			originY: number;
			translation: number;
			perspective: number;
		}) => {
			gl.viewport(0, 0, width, height);
			gl.useProgram(program);
			gl.bindVertexArray(vertexArray);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			uploadElementImage(gl, image);
			gl.uniform1i(imageLocation, 0);
			gl.uniform2f(resolutionLocation, width, height);
			gl.uniform2f(originLocation, originX, originY);
			gl.uniform2f(rotationLocation, Math.cos(angle), Math.sin(angle));
			gl.uniform1f(translationLocation, translation);
			gl.uniform1f(perspectiveLocation, perspective);
			gl.uniform1i(verticalLocation, Number(vertical));
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		},
	};
};
