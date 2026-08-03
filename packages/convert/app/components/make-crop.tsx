import type {CropRectangle, VideoCodec} from 'mediabunny';
import {
	getCropRectangleBeforeMirror,
	getVisibleCropRectangle,
} from '~/lib/apply-crop';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';

export const makeCrop = ({
	cropRect,
	dimensions,
	videoCodec,
	mirrorHorizontal,
	mirrorVertical,
}: {
	cropRect: CropRectangle;
	dimensions: Dimensions;
	videoCodec: VideoCodec;
	mirrorHorizontal: boolean;
	mirrorVertical: boolean;
}) => {
	const visibleCropRectangle = getVisibleCropRectangle({
		cropRect,
		dimensions,
	});
	let {height, width} = visibleCropRectangle;

	// Round down to nearest even number if codec is avc or hevc
	if (videoCodec === 'avc' || videoCodec === 'hevc') {
		width = Math.floor(width / 2) * 2;
		height = Math.floor(height / 2) * 2;
	}

	let {left, top} = getCropRectangleBeforeMirror({
		cropRect: {...visibleCropRectangle, height, width},
		dimensions,
		mirrorHorizontal,
		mirrorVertical,
	});
	if (videoCodec === 'avc' || videoCodec === 'hevc') {
		left = Math.floor(left / 2) * 2;
		top = Math.floor(top / 2) * 2;
	}

	return {
		width,
		height,
		left,
		top,
	};
};
