export const makeInternalState = () => {
	let drawn3dPixels = 0;
	let drawn3dTextures = 0;

	return {
		getDrawn3dPixels: () => drawn3dPixels,
		getDrawn3dTextures: () => drawn3dTextures,
		add3DTransform: ({
			canvasWidth,
			canvasHeight,
		}: {
			canvasWidth: number;
			canvasHeight: number;
		}) => {
			drawn3dPixels += canvasWidth * canvasHeight;
			drawn3dTextures++;
		},
	};
};

export type InternalState = ReturnType<typeof makeInternalState>;
