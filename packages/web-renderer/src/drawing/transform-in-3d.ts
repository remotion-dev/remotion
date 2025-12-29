function compileShader(
	shaderGl: WebGLRenderingContext,
	source: string,
	type: number,
) {
	const shader = shaderGl.createShader(type);
	if (!shader) {
		throw new Error('Could not create shader');
	}

	shaderGl.shaderSource(shader, source);
	shaderGl.compileShader(shader);

	if (!shaderGl.getShaderParameter(shader, shaderGl.COMPILE_STATUS)) {
		const log = shaderGl.getShaderInfoLog(shader);
		shaderGl.deleteShader(shader);
		throw new Error('Shader compile error: ' + log);
	}

	return shader;
}

const createHelperCanvas = ({
	canvasWidth,
	canvasHeight,
}: {
	canvasWidth: number;
	canvasHeight: number;
}) => {
	const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
	const gl = canvas.getContext('webgl', {
		premultipliedAlpha: true,
	});

	if (!gl) {
		throw new Error('WebGL not supported');
	}

	// Vertex shader - now includes texture coordinates
	const vsSource = `
        attribute vec2 aPosition;
        attribute vec2 aTexCoord;
        uniform mat4 uTransform;
        uniform mat4 uProjection;
        varying vec2 vTexCoord;

        void main() {
            gl_Position = uProjection * uTransform * vec4(aPosition, 0.0, 1.0);
            vTexCoord = aTexCoord;
        }
    `;

	// Fragment shader - samples from texture and unpremultiplies alpha
	const fsSource = `
        precision mediump float;
        uniform sampler2D uTexture;
        varying vec2 vTexCoord;

        void main() {
            gl_FragColor = texture2D(uTexture, vTexCoord);
        }
    `;

	// Create program
	const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
	}

	gl.useProgram(program);

	// Clear and draw
	gl.clearColor(0, 0, 0, 0); // Transparent background
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Enable blending for transparency
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	return {canvas, gl, program, vertexShader, fragmentShader};
};

export const transformIn3d = ({
	matrix,
	sourceCanvas,
	untransformedRect,
	rectAfterTransforms,
}: {
	untransformedRect: DOMRect;
	matrix: DOMMatrix;
	sourceCanvas: OffscreenCanvas;
	rectAfterTransforms: DOMRect;
}) => {
	const {canvas, gl, program} = createHelperCanvas({
		canvasWidth: rectAfterTransforms.width,
		canvasHeight: rectAfterTransforms.height,
	});

	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	// Create a quad (two triangles) with texture coordinates
	// prettier-ignore
	const vertices = new Float32Array([
		// Position (x, y) + TexCoord (u, v)
		// First:
		untransformedRect.x, untransformedRect.y, 0, 0, // bottom-left
		untransformedRect.x + untransformedRect.width, untransformedRect.y, 1, 0, // bottom-right
		untransformedRect.x, untransformedRect.y + untransformedRect.height, 0, 1, // top-left
		// Second:
		untransformedRect.x, untransformedRect.y + untransformedRect.height, 0, 1, // top-left
		untransformedRect.x + untransformedRect.width, untransformedRect.y, 1, 0, // bottom-right
		untransformedRect.x + untransformedRect.width, untransformedRect.y + untransformedRect.height, 1, 1, // top-right
	]);

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	const aPosition = gl.getAttribLocation(program, 'aPosition');
	const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');

	// Position attribute (2 floats, stride 4 floats, offset 0)
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 4 * 4, 0);

	// Texture coordinate attribute (2 floats, stride 4 floats, offset 2)
	gl.enableVertexAttribArray(aTexCoord);
	gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

	// Create and configure texture
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	// Upload the source canvas as a texture
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		sourceCanvas,
	);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	// The transform matrix
	const transformMatrix = matrix.toFloat32Array();

	const zScale = 1_000_000_000; // By default infinite in chrome

	// Create orthographic projection matrix for pixel coordinates with offset
	const projectionMatrix = new Float32Array([
		2 / canvas.width,
		0,
		0,
		0,
		0,
		-2 / canvas.height,
		0,
		0,
		0,
		0,
		-2 / zScale,
		0,
		-1 + (2 * -rectAfterTransforms.x) / canvas.width,
		1 - (2 * -rectAfterTransforms.y) / canvas.height,
		0,
		1,
	]);

	const uTransform = gl.getUniformLocation(program, 'uTransform');
	const uProjection = gl.getUniformLocation(program, 'uProjection');
	const uTexture = gl.getUniformLocation(program, 'uTexture');

	gl.uniformMatrix4fv(uTransform, false, transformMatrix);
	gl.uniformMatrix4fv(uProjection, false, projectionMatrix);
	gl.uniform1i(uTexture, 0); // Use texture unit 0

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// Clean up resources to prevent leaks and ensure clean state for reuse
	gl.disableVertexAttribArray(aPosition);
	gl.disableVertexAttribArray(aTexCoord);

	// Clean up resources to prevent leaks and ensure clean state for reuse
	gl.deleteTexture(texture);
	gl.deleteBuffer(vertexBuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.deleteTexture(texture);

	// Reset pixel store state
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

	// Reset blend function to the initial state
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	return {
		canvas,
		rect: rectAfterTransforms,
		cleanup: () => {
			const loseContext = gl.getExtension('WEBGL_lose_context');
			if (loseContext) {
				loseContext.loseContext();
			}
		},
	};
};
