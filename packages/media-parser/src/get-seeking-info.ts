import {getSeekingByteFromIsoBaseMedia} from './containers/iso-base-media/get-seeking-from-mp4';
import {getSeekingInfoFromMp4} from './containers/iso-base-media/get-seeking-info-from-mp4';
import type {MediaParserController} from './controller/media-parser-controller';
import type {LogLevel} from './log';
import type {ParseMediaSrc} from './options';
import type {IsoBaseMediaStructure} from './parse-result';
import type {ReaderInterface} from './readers/reader';
import type {SeekingInfo} from './seeking-info';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {SampleCallbacks} from './state/sample-callbacks';
import type {StructureState} from './state/structure';
import type {VideoSectionState} from './state/video-section';
import type {SeekResolution} from './work-on-seek-request';

export const getSeekingInfo = ({
	structureState,
	isoState,
	mp4HeaderSegment,
	videoSectionState,
}: {
	structureState: StructureState;
	isoState: IsoBaseMediaState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	videoSectionState: VideoSectionState;
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
			videoSectionState,
		});
	}

	return null;
};

export const getSeekingByte = ({
	info,
	time,
	logLevel,
	currentPosition,
	src,
	contentLength,
	controller,
	readerInterface,
	videoSectionState,
	callbacks,
	isoState,
}: {
	info: SeekingInfo;
	time: number;
	logLevel: LogLevel;
	currentPosition: number;
	src: ParseMediaSrc;
	contentLength: number;
	controller: MediaParserController;
	readerInterface: ReaderInterface;
	videoSectionState: VideoSectionState;
	callbacks: SampleCallbacks;
	isoState: IsoBaseMediaState;
}): Promise<SeekResolution> => {
	if (info.type === 'iso-base-media-seeking-info') {
		return getSeekingByteFromIsoBaseMedia({
			info,
			time,
			logLevel,
			currentPosition,
			src,
			contentLength,
			controller,
			readerInterface,
			videoSectionState,
			callbacks,
			isoState,
		});
	}

	throw new Error(`Unknown seeking info type: ${info.type as never}`);
};
