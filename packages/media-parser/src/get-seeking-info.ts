import {getSeekingByteFromIsoBaseMedia} from './containers/iso-base-media/get-seeking-from-mp4';
import {getSeekingInfoFromMp4} from './containers/iso-base-media/get-seeking-info-from-mp4';
import type {SeekingInfo} from './seeking-info';
import type {ParserState} from './state/parser-state';

export const getSeekingInfo = (state: ParserState): SeekingInfo | null => {
	const structure = state.getStructureOrNull();

	if (!structure) {
		return null;
	}

	if (structure.type === 'iso-base-media') {
		return getSeekingInfoFromMp4(state);
	}

	return null;
};

export const getSeekingByte = (
	info: SeekingInfo,
	time: number,
): number | null => {
	if (info.type === 'iso-base-media-seeking-info') {
		return getSeekingByteFromIsoBaseMedia(info, time);
	}

	throw new Error(`Unknown seeking info type: ${info.type as never}`);
};
