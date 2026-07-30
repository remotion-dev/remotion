import {useMemo} from 'react';
import type React from 'react';
import {
	getSequenceCropClipPath,
	resolveSequenceCrop,
	type SequenceCropInput,
	validateSequenceCrop,
} from './sequence-crop.js';

export const useCropStyle = ({
	cropLeft,
	cropRight,
	cropTop,
	cropBottom,
	style,
	componentName,
}: SequenceCropInput & {
	readonly style: React.CSSProperties | null;
	readonly componentName: string;
}): React.CSSProperties | null => {
	validateSequenceCrop(
		{cropLeft, cropRight, cropTop, cropBottom},
		componentName,
	);

	return useMemo(() => {
		const cropClipPath = getSequenceCropClipPath({
			...resolveSequenceCrop({cropLeft, cropRight, cropTop, cropBottom}),
			style,
		});

		if (cropClipPath === null) {
			return style;
		}

		return {...style, clipPath: cropClipPath};
	}, [cropBottom, cropLeft, cropRight, cropTop, style]);
};
