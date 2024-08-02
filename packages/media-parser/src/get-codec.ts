import type {KnownVideoCodecs} from './options';
import type {AnySegment} from './parse-result';

export const hasVideoCodec = (boxes: AnySegment[]): boolean => {
	try {
		return boxes.some((b) => b.type === 'ftyp-box');
	} catch (err) {
		return false;
	}
};

export const getVideoCodec = (boxes: AnySegment[]): KnownVideoCodecs | null => {
	const ftypBox = boxes.find((b) => b.type === 'ftyp-box');
	if (ftypBox && ftypBox.type === 'ftyp-box') {
		if (ftypBox.compatibleBrands.find((b) => b === 'avc1')) {
			return 'h264';
		}
	}

	return null;
};
