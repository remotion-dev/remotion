import type {PreviewSize} from './utils/preview-size';
import type {Size} from './utils/use-element-size';

export const calculateScale = ({
	canvasSize,
	compositionHeight,
	compositionWidth,
	previewSize,
}: {
	previewSize: PreviewSize['size'];
	compositionWidth: number;
	compositionHeight: number;
	canvasSize: Size;
}) => {
	const heightRatio = canvasSize.height / compositionHeight;
	const widthRatio = canvasSize.width / compositionWidth;

	const ratio = Math.min(heightRatio, widthRatio);

	return previewSize === 'auto' ? ratio : Number(previewSize);
};

export const calculateCanvasTransformation = ({
	previewSize,
	compositionWidth,
	compositionHeight,
	canvasSize,
}: {
	previewSize: PreviewSize['size'];
	compositionWidth: number;
	compositionHeight: number;
	canvasSize: Size;
}) => {
	const scale = calculateScale({
		canvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	});

	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * compositionWidth;
	const yCorrection = correction * compositionHeight;
	const width = compositionWidth * scale;
	const height = compositionHeight * scale;
	const centerX = canvasSize.width / 2 - width / 2;
	const centerY = canvasSize.height / 2 - height / 2;
	return {
		centerX,
		centerY,
		xCorrection,
		yCorrection,
		scale,
	};
};
