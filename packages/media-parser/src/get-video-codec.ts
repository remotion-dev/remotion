/* eslint-disable max-depth */
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
	const moovBox = boxes.find((b) => b.type === 'moov-box');
	if (moovBox && moovBox.type === 'moov-box') {
		const trakBox = moovBox.children.find((b) => b.type === 'trak-box');
		if (trakBox && trakBox.type === 'trak-box') {
			const mdiaBox = trakBox.children.find(
				(b) => b.type === 'regular-box' && b.boxType === 'mdia',
			);
			if (
				mdiaBox &&
				mdiaBox.type === 'regular-box' &&
				mdiaBox.boxType === 'mdia'
			) {
				const minfBox = mdiaBox?.children.find(
					(b) => b.type === 'regular-box' && b.boxType === 'minf',
				);
				if (
					minfBox &&
					minfBox.type === 'regular-box' &&
					minfBox.boxType === 'minf'
				) {
					const stblBox = minfBox?.children.find(
						(b) => b.type === 'regular-box' && b.boxType === 'stbl',
					);
					if (stblBox && stblBox.type === 'regular-box') {
						const stsdBox = stblBox?.children.find(
							(b) => b.type === 'stsd-box',
						);
						if (stsdBox && stsdBox.type === 'stsd-box') {
							const videoSample = stsdBox.samples.find(
								(s) => s.type === 'video',
							);
							if (videoSample && videoSample.type === 'video') {
								if (videoSample.format === 'hvc1') {
									return 'h265';
								}

								if (videoSample.format === 'avc1') {
									return 'h264';
								}

								if (videoSample.format === 'ap4h') {
									return 'prores';
								}
							}
						}
					}
				}
			}
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

				if (trackType.codec === 'V_AV1') {
					return 'av1';
				}
			}
		}
	}

	return null;
};
