// The entry contract for setup/apply. Resource contents are never reset: effects
// own their programs, uniforms, VAOs, textures and framebuffer attachments.
export const createWebGLStateReset = (
	gl: WebGL2RenderingContext,
	textureUnits: number,
) => {
	const drawBuffers = [gl.BACK];
	const capabilities = [
		gl.BLEND,
		gl.DEPTH_TEST,
		gl.STENCIL_TEST,
		gl.CULL_FACE,
		gl.SCISSOR_TEST,
		gl.RASTERIZER_DISCARD,
		gl.POLYGON_OFFSET_FILL,
		gl.SAMPLE_ALPHA_TO_COVERAGE,
		gl.SAMPLE_COVERAGE,
	];
	const pixelStoreParameters = [
		gl.PACK_ROW_LENGTH,
		gl.PACK_SKIP_PIXELS,
		gl.PACK_SKIP_ROWS,
		gl.UNPACK_ROW_LENGTH,
		gl.UNPACK_IMAGE_HEIGHT,
		gl.UNPACK_SKIP_PIXELS,
		gl.UNPACK_SKIP_ROWS,
		gl.UNPACK_SKIP_IMAGES,
	];

	// Cache context constants once, rather than allocate reset arguments and
	// arrays for every effect application. Dimensions and orientation can vary.
	return (width: number, height: number, flipSourceY: boolean): void => {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawBuffers(drawBuffers);
		gl.readBuffer(gl.BACK);
		gl.viewport(0, 0, width, height);
		gl.scissor(0, 0, width, height);
		for (const capability of capabilities) {
			gl.disable(capability);
		}

		gl.enable(gl.DITHER);
		gl.colorMask(true, true, true, true);
		gl.depthMask(true);
		gl.stencilMask(0xffffffff);
		gl.clearColor(0, 0, 0, 0);
		gl.clearDepth(1);
		gl.clearStencil(0);
		gl.useProgram(null);
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
		gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
		for (let unit = 0; unit < textureUnits; unit++) {
			gl.bindSampler(unit, null);
		}

		gl.activeTexture(gl.TEXTURE0);
		gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
		for (const parameter of pixelStoreParameters) {
			gl.pixelStorei(parameter, 0);
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.pixelStorei(
			gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
			gl.BROWSER_DEFAULT_WEBGL,
		);
	};
};
