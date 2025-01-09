import {
	getMatrixCoefficientsFromIndex,
	getPrimariesFromIndex,
	getTransferCharacteristicsFromIndex,
} from './boxes/avc/color';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {parseAv1PrivateData} from './boxes/webm/av1-codec-private';
import {
	getAv1CBox,
	getAvccBox,
	getColrBox,
	getHvccBox,
	getStsdVideoConfig,
} from './get-sample-aspect-ratio';
import {
	getTracks,
	hasTracks,
	type MediaParserVideoCodec,
	type VideoTrackColorParams,
} from './get-tracks';
import type {Structure} from './parse-result';
import type {ParserState} from './state/parser-state';

export const getVideoCodec = (
	boxes: Structure,
	state: ParserState,
): MediaParserVideoCodec | null => {
	const track = getTracks(boxes, state);
	return track.videoTracks[0]?.codecWithoutConfig ?? null;
};

export const hasVideoCodec = (
	boxes: Structure,
	state: ParserState,
): boolean => {
	return hasTracks(boxes, state);
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

	// TODO: Not doing anything with a in ICC color profile yet
	if (colrAtom.colorType !== 'transfer-characteristics') {
		return null;
	}

	// https://github.com/bbc/qtff-parameter-editor
	return {
		fullRange: colrAtom.fullRangeFlag,
		matrixCoefficients: getMatrixCoefficientsFromIndex(colrAtom.matrixIndex),
		primaries: getPrimariesFromIndex(colrAtom.primaries),
		transferCharacteristics: getTransferCharacteristicsFromIndex(
			colrAtom.transfer,
		),
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
