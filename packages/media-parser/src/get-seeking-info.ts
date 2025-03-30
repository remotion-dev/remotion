import {getSeekingByteFromIsoBaseMedia} from './containers/iso-base-media/get-seeking-from-mp4';
import {getSeekingInfoFromMp4} from './containers/iso-base-media/get-seeking-info-from-mp4';
import {getSeekingByteFromWav} from './containers/wav/get-seeking-byte';
import {getSeekingInfoFromWav} from './containers/wav/get-seeking-info';
import type {LogLevel} from './log';
import type {IsoBaseMediaStructure} from './parse-result';
import type {SeekingInfo} from './seeking-info';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {StructureState} from './state/structure';
import type {TransportStreamState} from './state/transport-stream/transport-stream';
import type {MediaSectionState} from './state/video-section';
import type {SeekResolution} from './work-on-seek-request';

export const getSeekingInfo = ({
	structureState,
	mp4HeaderSegment,
	mediaSectionState,
	isoState,
}: {
	structureState: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mediaSectionState: MediaSectionState;
	isoState: IsoBaseMediaState;
}): SeekingInfo | null => {
	const structure = structureState.getStructureOrNull();

	if (!structure) {
		return null;
	}

	if (structure.type === 'iso-base-media') {
		return getSeekingInfoFromMp4({
			structureState,
			isoState,
			mp4HeaderSegment,
			mediaSectionState,
		});
	}

	if (structure.type === 'wav') {
		return getSeekingInfoFromWav({
			structure,
			mediaSectionState,
		});
	}

	if (structure.type === 'transport-stream') {
		return {
			type: 'transport-stream-seeking-info',
		};
	}

	throw new Error(
		`Seeking is not supported for this format: ${structure.type}`,
	);
};

export const getSeekingByte = ({
	info,
	time,
	logLevel,
	currentPosition,
	isoState,
	transportStream,
}: {
	info: SeekingInfo;
	time: number;
	logLevel: LogLevel;
	currentPosition: number;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
}): Promise<SeekResolution> => {
	if (info.type === 'iso-base-media-seeking-info') {
		return getSeekingByteFromIsoBaseMedia({
			info,
			time,
			logLevel,
			currentPosition,
			isoState,
		});
	}

	if (info.type === 'wav-seeking-info') {
		return getSeekingByteFromWav({
			info,
			time,
		});
	}

	if (info.type === 'transport-stream-seeking-info') {
		transportStream.resetBeforeSeek();
		return Promise.resolve({
			type: 'do-seek',
			byte: 0,
		});
	}

	throw new Error(`Unknown seeking info type: ${info as never}`);
};
