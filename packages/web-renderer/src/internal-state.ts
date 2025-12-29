export const makeInternalState = () => {
	let drawnPrecomposedPixels = 0;
	let precomposedTextures = 0;

	return {
		getDrawn3dPixels: () => drawnPrecomposedPixels,
		getPrecomposedTiles: () => precomposedTextures,
		addPrecompose: ({
			canvasWidth,
			canvasHeight,
		}: {
			canvasWidth: number;
			canvasHeight: number;
		}) => {
			drawnPrecomposedPixels += canvasWidth * canvasHeight;
			precomposedTextures++;
		},
	};
};

export type InternalState = ReturnType<typeof makeInternalState>;
