import type {CropRectangle, VideoCodec} from 'mediabunny';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';

export const makeCrop = ({
	cropRect,
	dimensions,
	videoCodec,
}: {
	cropRect: CropRectangle;
	dimensions: Dimensions;
	videoCodec: VideoCodec;
}) => {
	let width = Number.isFinite(cropRect.width)
		? cropRect.width
		: dimensions!.width - cropRect.left;
	let height = Number.isFinite(cropRect.height)
		? cropRect.height
		: dimensions!.height - cropRect.top;

	// Round down to nearest even number if codec is avc or hevc
	let left = cropRect.left;
	let top = cropRect.top;
	if (videoCodec === 'avc' || videoCodec === 'hevc') {
		width = Math.floor(width / 2) * 2;
		height = Math.floor(height / 2) * 2;
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
