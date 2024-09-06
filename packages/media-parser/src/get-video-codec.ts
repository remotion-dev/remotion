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
	getStsdVideoConfig,
} from './get-sample-aspect-ratio';
import type {MediaParserVideoCodec, VideoTrackColorParams} from './get-tracks';
import type {AnySegment} from './parse-result';

export const hasVideoCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getVideoCodec(boxes) !== null;
	} catch (e) {
		return false;
	}
};

export const getVideoPrivateData = (trakBox: TrakBox): Uint8Array | null => {
	const videoSample = getStsdVideoConfig(trakBox);
	const avccBox = getAvccBox(trakBox);
	const hvccBox = getHvccBox(trakBox);
	const av1cBox = getAv1CBox(trakBox);

	if (!videoSample) {
		return null;
	}

	if (avccBox) {
		return avccBox.privateData;
	}

	if (hvccBox) {
		return hvccBox.privateData;
	}

	if (av1cBox) {
		return av1cBox.privateData;
	}

	return null;
};

export const getIsoBmColrConfig = (
	trakBox: TrakBox,
): VideoTrackColorParams | null => {
	const videoSample = getStsdVideoConfig(trakBox);
	if (!videoSample) {
		return null;
	}

	const colrAtom = getColrBox(videoSample);
	if (!colrAtom) {
		return null;
	}

	// https://github.com/bbc/qtff-parameter-editor
	return {
		fullRange: colrAtom.fullRangeFlag,
		matrixCoefficients:
			colrAtom.matrixIndex === 1
				? 'bt709'
				: colrAtom.matrixIndex === 5
					? 'bt470bg'
					: colrAtom.matrixIndex === 6
						? 'smpte170m'
						: null,
		primaries:
			colrAtom.primaries === 1
				? 'bt709'
				: colrAtom.primaries === 5
					? 'bt470bg'
					: colrAtom.primaries === 6
						? 'smpte170m'
						: null,
		transferCharacteristics:
			colrAtom.transfer === 1
				? 'bt709'
				: colrAtom.transfer === 6
					? 'smpte170m'
					: colrAtom.transfer === 13
						? 'iec61966-2-1'
						: null,
	};
};

export const getVideoCodecString = (trakBox: TrakBox): string | null => {
	const videoSample = getStsdVideoConfig(trakBox);
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

export const getVideoCodecFromIsoTrak = (trakBox: TrakBox) => {
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

			// ap4h: ProRes 4444
			if (videoSample.format === 'ap4h') {
				return 'prores';
			}

			// ap4x: ap4x: ProRes 4444 XQ
			if (videoSample.format === 'ap4x') {
				return 'prores';
			}

			// apch: ProRes 422 High Quality
			if (videoSample.format === 'apch') {
				return 'prores';
			}

			// apcn: ProRes 422 Standard Definition
			if (videoSample.format === 'apcn') {
				return 'prores';
			}

			// apcs: ProRes 422 LT
			if (videoSample.format === 'apcs') {
				return 'prores';
			}

			// apco: ProRes 422 Proxy
			if (videoSample.format === 'apco') {
				return 'prores';
			}

			// aprh: ProRes RAW High Quality
			if (videoSample.format === 'aprh') {
				return 'prores';
			}

			// aprn: ProRes RAW Standard Definition
			if (videoSample.format === 'aprn') {
				return 'prores';
			}
		}
	}

	throw new Error('Could not find video codec');
};

export const getVideoCodec = (
	boxes: AnySegment[],
): MediaParserVideoCodec | null => {
	const moovBox = getMoovBox(boxes);
	if (moovBox) {
		const trakBox = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];
		if (trakBox) {
			return getVideoCodecFromIsoTrak(trakBox);
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
