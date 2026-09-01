export const uploadElementImage = (
	gl: WebGL2RenderingContext,
	elementImage: OffscreenCanvas,
): void => {
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		elementImage,
	);
};
