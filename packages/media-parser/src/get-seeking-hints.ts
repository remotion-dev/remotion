import {getSeekingHintsFromMp4} from './containers/iso-base-media/seeking-hints';
import {getSeekingHintsFromTransportStream} from './containers/transport-stream/seeking-hints';
import {getSeekingHintsFromWav} from './containers/wav/seeking-hints';
import {getSeekingHintsFromMatroska} from './containers/webm/seek/seeking-hints';
import type {IsoBaseMediaStructure} from './parse-result';
import type {SeekingHints} from './seeking-hints';
import type {TracksState} from './state/has-tracks-section';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {KeyframesState} from './state/keyframes';
import type {WebmState} from './state/matroska/webm';
import type {StructureState} from './state/structure';
import type {TransportStreamState} from './state/transport-stream/transport-stream';
import type {MediaSectionState} from './state/video-section';

export const getSeekingHints = ({
	structureState,
	mp4HeaderSegment,
	mediaSectionState,
	isoState,
	transportStream,
	tracksState,
	keyframesState,
	webmState,
}: {
	structureState: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mediaSectionState: MediaSectionState;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	tracksState: TracksState;
	keyframesState: KeyframesState;
	webmState: WebmState;
}): SeekingHints | null => {
	const structure = structureState.getStructureOrNull();

	if (!structure) {
		return null;
	}

	if (structure.type === 'iso-base-media') {
		return getSeekingHintsFromMp4({
			structureState,
			isoState,
			mp4HeaderSegment,
			mediaSectionState,
		});
	}

	if (structure.type === 'wav') {
		return getSeekingHintsFromWav({
			structure,
			mediaSectionState,
		});
	}

	if (structure.type === 'matroska') {
		return getSeekingHintsFromMatroska(tracksState, keyframesState, webmState);
	}

	if (structure.type === 'transport-stream') {
		return getSeekingHintsFromTransportStream(transportStream, tracksState);
	}

	throw new Error(
		`Seeking is not supported for this format: ${structure.type}`,
	);
};
