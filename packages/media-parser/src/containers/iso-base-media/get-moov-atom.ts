import type {BufferIterator} from '../../iterator/buffer-iterator';
import {getArrayBufferIterator} from '../../iterator/buffer-iterator';
import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import {makeCanSkipTracksState} from '../../state/can-skip-tracks';
import {makeTracksSectionState} from '../../state/has-tracks-section';
import type {ParserState} from '../../state/parser-state';
import {structureState} from '../../state/structure';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../../webcodec-sample-types';
import type {IsoBaseMediaBox} from './base-media-box';
import type {MoovBox} from './moov/moov';
import {processBox} from './process-box';
import {getMoovFromFromIsoStructure} from './traversal';

export const getMoovAtom = async ({
	endOfMdat,
	state,
}: {
	state: ParserState;
	endOfMdat: number;
}): Promise<MoovBox> => {
	const headerSegment = state.m3uPlaylistContext?.mp4HeaderSegment;
	if (headerSegment) {
		const segment = getMoovFromFromIsoStructure(headerSegment);
		if (!segment) {
			throw new Error('No moov box found in header segment');
		}

		return segment;
	}

	const start = Date.now();
	Log.verbose(state.logLevel, 'Starting second fetch to get moov atom');
	const {reader} = await state.readerInterface.read({
		src: state.src,
		range: endOfMdat,
		controller: state.controller,
		logLevel: state.logLevel,
		prefetchCache: state.prefetchCache,
	});

	const onAudioTrack: MediaParserOnAudioTrack | null = state.onAudioTrack
		? async ({track, container}) => {
				await registerAudioTrack({
					track,
					container,
					logLevel: state.logLevel,
					onAudioTrack: state.onAudioTrack,
					registerAudioSampleCallback:
						state.callbacks.registerAudioSampleCallback,
					tracks: state.callbacks.tracks,
				});
				return null;
			}
		: null;

	const onVideoTrack: MediaParserOnVideoTrack | null = state.onVideoTrack
		? async ({track, container}) => {
				await registerVideoTrack({
					track,
					container,
					logLevel: state.logLevel,
					onVideoTrack: state.onVideoTrack,
					registerVideoSampleCallback:
						state.callbacks.registerVideoSampleCallback,
					tracks: state.callbacks.tracks,
				});
				return null;
			}
		: null;

	const iterator: BufferIterator = getArrayBufferIterator({
		initialData: new Uint8Array([]),
		maxBytes: state.contentLength - endOfMdat,
		logLevel: 'error',
	});

	while (true) {
		const result = await reader.reader.read();
		if (result.value) {
			iterator.addData(result.value);
		}

		if (result.done) {
			break;
		}
	}

	const boxes: IsoBaseMediaBox[] = [];

	const canSkipTracksState = makeCanSkipTracksState({
		hasAudioTrackHandlers: false,
		fields: {slowStructure: true},
		hasVideoTrackHandlers: false,
		structure: structureState(),
	});

	const tracksState = makeTracksSectionState(canSkipTracksState, state.src);

	while (true) {
		const box = await processBox({
			iterator,
			logLevel: state.logLevel,
			onlyIfMoovAtomExpected: {
				tracks: tracksState,
				isoState: null,
				movieTimeScaleState: state.iso.movieTimeScale,
				onAudioTrack,
				onVideoTrack,
				registerVideoSampleCallback: () => Promise.resolve(),
				registerAudioSampleCallback: () => Promise.resolve(),
			},
			onlyIfMdatAtomExpected: null,
			contentLength: state.contentLength - endOfMdat,
		});
		if (box.type === 'box') {
			boxes.push(box.box);
		}

		if (iterator.counter.getOffset() + endOfMdat > state.contentLength) {
			throw new Error('Read past end of file');
		}

		if (iterator.counter.getOffset() + endOfMdat === state.contentLength) {
			break;
		}
	}

	const moov = boxes.find((b) => b.type === 'moov-box');
	if (!moov) {
		throw new Error('No moov box found');
	}

	Log.verbose(
		state.logLevel,
		`Finished fetching moov atom in ${Date.now() - start}ms`,
	);

	return moov;
};
