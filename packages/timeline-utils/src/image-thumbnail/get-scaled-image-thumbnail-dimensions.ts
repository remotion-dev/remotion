export const getScaledImageThumbnailDimensions = ({
	naturalWidth,
	naturalHeight,
	canvasHeight,
}: {
	readonly naturalWidth: number;
	readonly naturalHeight: number;
	readonly canvasHeight: number;
}) => {
	if (naturalWidth === 0 || naturalHeight === 0 || canvasHeight === 0) {
		return {
			scaledWidth: 0,
			scaledHeight: 0,
		};
	}

	const scale = canvasHeight / naturalHeight;

	return {
		scaledWidth: naturalWidth * scale,
		scaledHeight: canvasHeight,
	};
};
