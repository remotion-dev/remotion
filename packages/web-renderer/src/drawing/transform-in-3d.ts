import type {HelperCanvasState, InternalState} from '../internal-state';

const vsSource = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    uniform mat4 uTransform;
    uniform vec2 uResolution;
    uniform vec2 uOffset;
    varying vec2 vTexCoord;

    void main() {
        vec4 pos = uTransform * vec4(aPosition, 0.0, 1.0);
        pos.xy = pos.xy + uOffset * pos.w;

        // Convert homogeneous coords to clip space
        gl_Position = vec4(
            (pos.x / uResolution.x) * 2.0 - pos.w,   // x
            pos.w - (pos.y / uResolution.y) * 2.0,   // y (flipped)
            0.0,
            pos.w
        );

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
		uTransform: gl.getUniformLocation(program, 'uTransform'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uOffset: gl.getUniformLocation(program, 'uOffset'),
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
	sourceRect,
	destRect,
	internalState,
}: {
	sourceRect: DOMRect;
	matrix: DOMMatrix;
	sourceCanvas: OffscreenCanvas;
	destRect: DOMRect;
	internalState: InternalState;
}) => {
	const {canvas, gl, program, locations} = createHelperCanvas({
		canvasWidth: destRect.width,
		canvasHeight: destRect.height,
		helperCanvasState: internalState.helperCanvasState,
	});

	// Use the cached program
	gl.useProgram(program);

	// Setup viewport and clear (already done in createHelperCanvas, but ensure it's set)
	gl.viewport(0, 0, destRect.width, destRect.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Enable blending
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	// Create position buffer
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// prettier-ignore
	const positions = new Float32Array([
		sourceRect.x, sourceRect.y, // top left
		sourceRect.x + sourceRect.width, sourceRect.y, // top right
		sourceRect.x, sourceRect.y + sourceRect.height, // bottom left
		sourceRect.x, sourceRect.y + sourceRect.height, // bottom left
		sourceRect.x + sourceRect.width, sourceRect.y, // top right
		sourceRect.x + sourceRect.width, sourceRect.y + sourceRect.height, // bottom right
	]);

	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(locations.aPosition);
	gl.vertexAttribPointer(locations.aPosition, 2, gl.FLOAT, false, 0, 0);

	// Create texture coordinate buffer
	const texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

	// prettier-ignore
	const texCoords = new Float32Array([
		0, 0, // top left
		1, 0, // top right
		0, 1, // bottom left
		0, 1, // bottom left
		1, 0, // top right
		1, 1, // bottom right
	]);

	gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(locations.aTexCoord);
	gl.vertexAttribPointer(locations.aTexCoord, 2, gl.FLOAT, false, 0, 0);

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

	gl.uniformMatrix4fv(locations.uTransform, false, transformMatrix);
	gl.uniform2f(locations.uResolution, destRect.width, destRect.height);
	gl.uniform2f(locations.uOffset, -destRect.x, -destRect.y);
	gl.uniform1i(locations.uTexture, 0);

	// Draw
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// Clean up per-frame resources only
	gl.disableVertexAttribArray(locations.aPosition);
	gl.disableVertexAttribArray(locations.aTexCoord);
	gl.deleteTexture(texture);
	gl.deleteBuffer(positionBuffer);
	gl.deleteBuffer(texCoordBuffer);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Reset state
	gl.disable(gl.BLEND);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

	return canvas;
};
