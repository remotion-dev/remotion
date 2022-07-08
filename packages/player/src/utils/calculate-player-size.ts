import type {StandardLonghandProperties} from 'csstype';
import type {Size} from './use-element-size';

export const calculatePlayerSize = ({
	currentSize,
	width,
	height,
	compositionWidth,
	compositionHeight,
}: {
	currentSize: Size | null;
	width: StandardLonghandProperties['width'] | undefined;
	height: StandardLonghandProperties['height'] | undefined;
	compositionWidth: number;
	compositionHeight: number;
}): React.CSSProperties => {
	const aspectRatio = compositionWidth / compositionHeight;

	if (!currentSize) {
		return {
			width: compositionWidth,
			height: compositionHeight,
		};
	}

	// If has width specified, but no height, specify a default height that satisfies the aspect ratio.
	if (width !== undefined && height === undefined) {
		return {
			height: currentSize.width / aspectRatio,
		};
	}

	// Opposite: If has height specified, evaluate the height and specify a default width.
	if (height !== undefined && width === undefined) {
		return {
			width: currentSize.height * aspectRatio,
		};
	}

	return {
		width: compositionWidth,
		height: compositionHeight,
	};
};
