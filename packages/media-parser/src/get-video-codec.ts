/* eslint-disable max-depth */
import {constructAv1CodecString} from './av1-codec-string';
import type {Av1CBox} from './boxes/iso-base-media/stsd/av1c';
import type {ColorParameterBox} from './boxes/iso-base-media/stsd/colr';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
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
import {getMoovBox, getStsdBox, getTraks} from './traversal';

export const hasVideoCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getVideoCodec(boxes) !== null;
	} catch (e) {
		return false;
	}
};

const getAv01CodecString = (
	av1cBox: Av1CBox,
	colrAtom: ColorParameterBox | null,
) => {
	return constructAv1CodecString(av1cBox.av1HeaderSegment, colrAtom);
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
		return getAv01CodecString(av1cBox, colrAtom);
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

				if (trackType.codec === 'V_VP9') {
					return 'vp9';
				}

				if (trackType.codec === 'V_AV1') {
					return 'av1';
				}

				if (trackType.codec === 'V_MPEG4/ISO/AVC') {
					return 'h264';
				}
			}
		}
	}

	return null;
};
