import {getSeekingInfoFromMp4} from './containers/iso-base-media/get-seeking-info-from-mp4';
import {getSeekingInfoFromTransportStream} from './containers/transport-stream/get-seeking-info';
import {getSeekingInfoFromWav} from './containers/wav/get-seeking-info';
import {getSeekingInfoFromMatroska} from './containers/webm/seek/get-seeking-info';
import type {IsoBaseMediaStructure} from './parse-result';
import type {SeekingInfo} from './seeking-info';
import type {TracksState} from './state/has-tracks-section';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {StructureState} from './state/structure';
import type {TransportStreamState} from './state/transport-stream/transport-stream';
import type {MediaSectionState} from './state/video-section';

export const getSeekingInfo = ({
	structureState,
	mp4HeaderSegment,
	mediaSectionState,
	isoState,
	transportStream,
	tracksState,
}: {
	structureState: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mediaSectionState: MediaSectionState;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	tracksState: TracksState;
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

	if (structure.type === 'matroska') {
		return getSeekingInfoFromMatroska(tracksState);
	}

	if (structure.type === 'transport-stream') {
		return getSeekingInfoFromTransportStream(transportStream, tracksState);
	}

	throw new Error(
		`Seeking is not supported for this format: ${structure.type}`,
	);
};
