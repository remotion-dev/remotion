import {getSeekingHintsForFlac} from './containers/flac/seeking-hints';
import {getSeekingHintsFromMp4} from './containers/iso-base-media/seeking-hints';
import {getSeekingHintsForMp3} from './containers/mp3/seeking-hints';
import {getSeekingHintsForRiff} from './containers/riff/seeking-hints';
import {getSeekingHintsFromTransportStream} from './containers/transport-stream/seeking-hints';
import {getSeekingHintsFromWav} from './containers/wav/seeking-hints';
import {getSeekingHintsFromMatroska} from './containers/webm/seek/seeking-hints';
import type {IsoBaseMediaStructure} from './parse-result';
import type {SeekingHints} from './seeking-hints';
import type {FlacState} from './state/flac-state';
import type {TracksState} from './state/has-tracks-section';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {KeyframesState} from './state/keyframes';
import type {WebmState} from './state/matroska/webm';
import type {Mp3State} from './state/mp3';
import type {RiffState} from './state/riff';
import type {SamplesObservedState} from './state/samples-observed/slow-duration-fps';
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
	flacState,
	samplesObserved,
	riffState,
	mp3State,
}: {
	structureState: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mediaSectionState: MediaSectionState;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	tracksState: TracksState;
	keyframesState: KeyframesState;
	webmState: WebmState;
	flacState: FlacState;
	samplesObserved: SamplesObservedState;
	riffState: RiffState;
	mp3State: Mp3State;
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

	if (structure.type === 'flac') {
		return getSeekingHintsForFlac({
			flacState,
			samplesObserved,
		});
	}

	if (structure.type === 'riff') {
		return getSeekingHintsForRiff({
			structureState,
			riffState,
			mediaSectionState,
		});
	}

	if (structure.type === 'mp3') {
		return getSeekingHintsForMp3({
			mp3State,
			samplesObserved,
		});
	}

	throw new Error(
		`Seeking is not supported for this format: ${structure.type}`,
	);
};
