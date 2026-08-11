export type ImageFit = 'contain' | 'cover' | 'fill';

export const calculateImageFit = (
	fit: ImageFit,
	imageSize: {
		width: number;
		height: number;
	},
	canvasSize: {
		width: number;
		height: number;
	},
): [number, number, number, number, number, number, number, number] => {
	switch (fit) {
		case 'fill': {
			return [
				0,
				0,
				imageSize.width,
				imageSize.height,
				0,
				0,
				canvasSize.width,
				canvasSize.height,
			];
		}

		case 'contain': {
			const ratio = Math.min(
				canvasSize.width / imageSize.width,
				canvasSize.height / imageSize.height,
			);

			const centerX = (canvasSize.width - imageSize.width * ratio) / 2;
			const centerY = (canvasSize.height - imageSize.height * ratio) / 2;

			return [
				0,
				0,
				imageSize.width,
				imageSize.height,
				centerX,
				centerY,
				imageSize.width * ratio,
				imageSize.height * ratio,
			];
		}

		case 'cover': {
			const ratio = Math.max(
				canvasSize.width / imageSize.width,
				canvasSize.height / imageSize.height,
			);
			const centerX = (canvasSize.width - imageSize.width * ratio) / 2;
			const centerY = (canvasSize.height - imageSize.height * ratio) / 2;

			return [
				0,
				0,
				imageSize.width,
				imageSize.height,
				centerX,
				centerY,
				imageSize.width * ratio,
				imageSize.height * ratio,
			];
		}

		default:
			throw new Error('Unknown fit: ' + fit);
	}
};
