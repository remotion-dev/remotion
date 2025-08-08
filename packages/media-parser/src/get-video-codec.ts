import type {MediaParserCodecData} from './codec-data';
import {
	getMatrixCoefficientsFromIndex,
	getPrimariesFromIndex,
	getTransferCharacteristicsFromIndex,
} from './containers/avc/color';
import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {parseAv1PrivateData} from './containers/webm/av1-codec-private';
import {
	getAv1CBox,
	getAvccBox,
	getColrBox,
	getHvccBox,
	getStsdVideoConfig,
	getVpccBox,
} from './get-sample-aspect-ratio';
import {
	getHasTracks,
	getTracks,
	type MediaParserAdvancedColor,
	type MediaParserVideoCodec,
} from './get-tracks';
import type {ParserState} from './state/parser-state';

export const getVideoCodec = (
	state: ParserState,
): MediaParserVideoCodec | null => {
	const track = getTracks(state, true);
	return track.find((t) => t.type === 'video')?.codecEnum ?? null;
};

export const hasVideoCodec = (state: ParserState): boolean => {
	return getHasTracks(state, true);
};

export const getVideoPrivateData = (
	trakBox: TrakBox,
): MediaParserCodecData | null => {
	const videoSample = getStsdVideoConfig(trakBox);
	const avccBox = getAvccBox(trakBox);
	const hvccBox = getHvccBox(trakBox);
	const av1cBox = getAv1CBox(trakBox);

	if (!videoSample) {
		return null;
	}

	if (avccBox) {
		return {type: 'avc-sps-pps', data: avccBox.privateData};
	}

	if (hvccBox) {
		return {type: 'hvcc-data', data: hvccBox.privateData};
	}

	if (av1cBox) {
		return {type: 'av1c-data', data: av1cBox.privateData};
	}

	return null;
};

export const getIsoBmColrConfig = (
	trakBox: TrakBox,
): MediaParserAdvancedColor | null => {
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
		matrix: getMatrixCoefficientsFromIndex(colrAtom.matrixIndex),
		primaries: getPrimariesFromIndex(colrAtom.primaries),
		transfer: getTransferCharacteristicsFromIndex(colrAtom.transfer),
	};
};

export const getVideoCodecString = (trakBox: TrakBox): string | null => {
	const videoSample = getStsdVideoConfig(trakBox);
	const avccBox = getAvccBox(trakBox);

	if (!videoSample) {
		return null;
	}

	if (avccBox) {
		return `${videoSample.format}.${avccBox.configurationString}`;
	}

	const hvccBox = getHvccBox(trakBox);

	if (hvccBox) {
		return `${videoSample.format}.${hvccBox.configurationString}`;
	}

	const av1cBox = getAv1CBox(trakBox);

	if (av1cBox) {
		const colrAtom = getColrBox(videoSample);
		return parseAv1PrivateData(av1cBox.privateData, colrAtom);
	}

	const vpccBox = getVpccBox(trakBox);

	if (vpccBox) {
		return `${videoSample.format}.${vpccBox.codecString}`;
	}

	return videoSample.format;
};
