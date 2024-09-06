/* eslint-disable max-depth */
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {
	getMoovBox,
	getStsdBox,
	getTraks,
} from './boxes/iso-base-media/traversal';
import {parseAv1PrivateData} from './boxes/webm/av1-codec-private';
import {trakBoxContainsVideo} from './get-fps';
import {
	getAv1CBox,
	getAvccBox,
	getColrBox,
	getHvccBox,
	getVideoSample,
} from './get-sample-aspect-ratio';
import type {KnownVideoCodecs} from './options';
import type {AnySegment} from './parse-result';

export const hasVideoCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getVideoCodec(boxes) !== null;
	} catch (e) {
		return false;
	}
};

export const getVideoCodecString = (trakBox: TrakBox): string | null => {
	const videoSample = getVideoSample(trakBox);
	const avccBox = getAvccBox(trakBox);
	const hvccBox = getHvccBox(trakBox);
	const av1cBox = getAv1CBox(trakBox);

	if (!videoSample) {
		return null;
	}

	if (avccBox) {
		return `${videoSample.format}.${avccBox.configurationString}`;
	}

	if (hvccBox) {
		return `${videoSample.format}.${hvccBox.configurationString}`;
	}

	if (av1cBox) {
		const colrAtom = getColrBox(videoSample);
		return parseAv1PrivateData(av1cBox.privateData, colrAtom);
	}

	return videoSample.format;
};

export const getVideoCodec = (boxes: AnySegment[]): KnownVideoCodecs | null => {
	const moovBox = getMoovBox(boxes);
	if (moovBox) {
		const trakBox = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];
		if (trakBox) {
			const stsdBox = getStsdBox(trakBox);
			if (stsdBox && stsdBox.type === 'stsd-box') {
				const videoSample = stsdBox.samples.find((s) => s.type === 'video');
				if (videoSample && videoSample.type === 'video') {
					if (videoSample.format === 'hvc1') {
						return 'h265';
					}

					if (videoSample.format === 'avc1') {
						return 'h264';
					}

					if (videoSample.format === 'av01') {
						return 'av1';
					}

					if (videoSample.format === 'ap4h') {
						return 'prores';
					}
				}
			}
		}
	}

	const mainSegment = boxes.find((b) => b.type === 'Segment');
	if (!mainSegment || mainSegment.type !== 'Segment') {
		return null;
	}

	const tracksSegment = mainSegment.value.find((b) => b.type === 'Tracks');
	if (!tracksSegment || tracksSegment.type !== 'Tracks') {
		return null;
	}

	for (const track of tracksSegment.value) {
		if (track.type === 'TrackEntry') {
			const trackType = track.value.find((b) => b.type === 'CodecID');
			if (trackType && trackType.type === 'CodecID') {
				if (trackType.value === 'V_VP8') {
					return 'vp8';
				}

				if (trackType.value === 'V_VP9') {
					return 'vp9';
				}

				if (trackType.value === 'V_AV1') {
					return 'av1';
				}

				if (trackType.value === 'V_MPEG4/ISO/AVC') {
					return 'h264';
				}

				if (trackType.value === 'V_MPEGH/ISO/HEVC') {
					return 'h265';
				}
			}
		}
	}

	return null;
};
