import type {HelperCanvasState, InternalState} from '../internal-state';

// Vertex shader - now includes texture coordinates and w values for perspective
const vsSource = `
		attribute vec2 aPosition;
		attribute vec2 aTexCoord;
		attribute float aW;
		uniform mat4 uTransform;
		uniform mat4 uProjection;
		varying vec2 vTexCoord;

		void main() {
				gl_Position = uProjection * uTransform * vec4(aPosition, 0.0, aW);
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
	helperCanvasState,
}: {
	canvasWidth: number;
	canvasHeight: number;
	helperCanvasState: HelperCanvasState;
}) => {
	if (helperCanvasState.current) {
		// Resize canvas if dimensions changed
		if (
			helperCanvasState.current.canvas.width !== canvasWidth ||
			helperCanvasState.current.canvas.height !== canvasHeight
		) {
			helperCanvasState.current.canvas.width = canvasWidth;
			helperCanvasState.current.canvas.height = canvasHeight;
		}

		// Always reset viewport and clear when reusing
		helperCanvasState.current.gl.viewport(0, 0, canvasWidth, canvasHeight);
		helperCanvasState.current.gl.clearColor(0, 0, 0, 0);
		helperCanvasState.current.gl.clear(
			helperCanvasState.current.gl.COLOR_BUFFER_BIT,
		);

		return helperCanvasState.current;
	}

	const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);

	const gl =
		canvas.getContext('webgl', {
			premultipliedAlpha: true,
		}) ?? undefined;

	if (!gl) {
		throw new Error('WebGL not supported');
	}

	// Compile shaders and create program once
	const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();
	if (!program) {
		throw new Error('Could not create program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
	}

	// Get attribute and uniform locations once
	const locations = {
		aPosition: gl.getAttribLocation(program, 'aPosition'),
		aTexCoord: gl.getAttribLocation(program, 'aTexCoord'),
		aW: gl.getAttribLocation(program, 'aW'),
		uTransform: gl.getUniformLocation(program, 'uTransform'),
		uProjection: gl.getUniformLocation(program, 'uProjection'),
		uTexture: gl.getUniformLocation(program, 'uTexture'),
	};

	// Shaders can be deleted after linking
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	const cleanup = () => {
		gl.deleteProgram(program);
		const loseContext = gl.getExtension('WEBGL_lose_context');
		if (loseContext) {
			loseContext.loseContext();
		}
	};

	helperCanvasState.current = {canvas, gl, program, locations, cleanup};

	return helperCanvasState.current;
};

export const transformIn3d = ({
	matrix,
	sourceCanvas,
	untransformedRect,
	rectAfterTransforms,
	internalState,
	w1,
	w2,
	w3,
	w4,
}: {
	untransformedRect: DOMRect;
	matrix: DOMMatrix;
	sourceCanvas: OffscreenCanvas;
	rectAfterTransforms: DOMRect;
	internalState: InternalState;
	w1: number;
	w2: number;
	w3: number;
	w4: number;
}) => {
	console.log(w1, w2, w3, w4);

	const {canvas, gl, program, locations} = createHelperCanvas({
		canvasWidth: rectAfterTransforms.width,
		canvasHeight: rectAfterTransforms.height,
		helperCanvasState: internalState.helperCanvasState,
	});

	// Use the cached program
	gl.useProgram(program);

	// Setup viewport and clear (already done in createHelperCanvas, but ensure it's set)
	gl.viewport(0, 0, rectAfterTransforms.width, rectAfterTransforms.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Enable blending
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	// Create vertex buffer
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	// prettier-ignore
	// Each vertex: x, y, texU, texV, w
	const vertices = new Float32Array([
		untransformedRect.x, untransformedRect.y, 0, 0, w1,
		untransformedRect.x + untransformedRect.width, untransformedRect.y, 1, 0, w2,
		untransformedRect.x, untransformedRect.y + untransformedRect.height, 0, 1, w3,
		untransformedRect.x, untransformedRect.y + untransformedRect.height, 0, 1, w3,
		untransformedRect.x + untransformedRect.width, untransformedRect.y, 1, 0, w2,
		untransformedRect.x + untransformedRect.width, untransformedRect.y + untransformedRect.height, 1, 1, w4,
	]);

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	// Setup attributes using cached locations (stride = 5 floats = 20 bytes)
	gl.enableVertexAttribArray(locations.aPosition);
	gl.vertexAttribPointer(locations.aPosition, 2, gl.FLOAT, false, 5 * 4, 0);

	gl.enableVertexAttribArray(locations.aTexCoord);
	gl.vertexAttribPointer(locations.aTexCoord, 2, gl.FLOAT, false, 5 * 4, 2 * 4);

	gl.enableVertexAttribArray(locations.aW);
	gl.vertexAttribPointer(locations.aW, 1, gl.FLOAT, false, 5 * 4, 4 * 4);

	// Create and configure texture
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		sourceCanvas,
	);

	// Set uniforms using cached locations
	const transformMatrix = matrix.toFloat32Array();
	const zScale = 1_000_000_000;

	// Projection matrix accounts for the output canvas dimensions
	const projectionMatrix = new Float32Array([
		2 / rectAfterTransforms.width,
		0,
		0,
		0,
		0,
		-2 / rectAfterTransforms.height,
		0,
		0,
		0,
		0,
		-2 / zScale,
		0,
		-1 + (2 * -rectAfterTransforms.x) / rectAfterTransforms.width,
		1 - (2 * -rectAfterTransforms.y) / rectAfterTransforms.height,
		0,
		1,
	]);

	gl.uniformMatrix4fv(locations.uTransform, false, transformMatrix);
	gl.uniformMatrix4fv(locations.uProjection, false, projectionMatrix);
	gl.uniform1i(locations.uTexture, 0);

	// Draw
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// Clean up per-frame resources only
	gl.disableVertexAttribArray(locations.aPosition);
	gl.disableVertexAttribArray(locations.aTexCoord);
	gl.disableVertexAttribArray(locations.aW);
	gl.deleteTexture(texture);
	gl.deleteBuffer(vertexBuffer);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Reset state
	gl.disable(gl.BLEND);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

	return {
		canvas,
		rect: rectAfterTransforms,
	};
};
