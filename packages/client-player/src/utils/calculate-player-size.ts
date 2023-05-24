import type {StandardLonghandProperties} from 'csstype';
import type {Size} from './use-element-size.js';

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
	if (width !== undefined && height === undefined) {
		return {
			aspectRatio: [compositionWidth, compositionHeight].join('/'),
		};
	}

	// Opposite: If has height specified, evaluate the height and specify a default width.
	if (height !== undefined && width === undefined) {
		return {
			// Aspect ratio CSS prop will work
			aspectRatio: [compositionWidth, compositionHeight].join('/'),
		};
	}

	if (!currentSize) {
		return {
			width: compositionWidth,
			height: compositionHeight,
		};
	}

	return {
		width: compositionWidth,
		height: compositionHeight,
	};
};
