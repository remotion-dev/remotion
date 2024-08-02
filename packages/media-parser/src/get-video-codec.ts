import type {KnownVideoCodecs} from './options';
import type {AnySegment} from './parse-result';

export const hasVideoCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getVideoCodec(boxes) !== null;
	} catch (e) {
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

	const mainSegment = boxes.find((b) => b.type === 'main-segment');
	if (!mainSegment || mainSegment.type !== 'main-segment') {
		return null;
	}

	const tracksSegment = mainSegment.children.find(
		(b) => b.type === 'tracks-segment',
	);
	if (!tracksSegment || tracksSegment.type !== 'tracks-segment') {
		return null;
	}

	for (const track of tracksSegment.children) {
		if (track.type === 'track-entry-segment') {
			const trackType = track.children.find((b) => b.type === 'codec-segment');
			if (trackType && trackType.type === 'codec-segment') {
				if (trackType.codec === 'V_VP8') {
					return 'vp8';
				}
			}
		}
	}

	return null;
};
