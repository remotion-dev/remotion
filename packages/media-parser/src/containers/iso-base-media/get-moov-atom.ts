import {getFieldsFromCallback} from '../../get-fields-from-callbacks';
import type {BufferIterator} from '../../iterator/buffer-iterator';
import {getArrayBufferIterator} from '../../iterator/buffer-iterator';
import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import {emittedState} from '../../state/emitted-fields';
import {keyframesState} from '../../state/keyframes';
import type {ParserState} from '../../state/parser-state';
import {sampleCallback} from '../../state/sample-callbacks';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';
import {getWorkOnSeekRequestOptions} from '../../work-on-seek-request';
import type {IsoBaseMediaBox} from './base-media-box';
import type {MoovBox} from './moov/moov';
import {processBox} from './process-box';
import {getMoovFromFromIsoStructure} from './traversal';

// TODO: await parseMedia({fields: {moovAtom: true}) would be a nicer API
export const getMoovAtom = async ({
	endOfMdat,
	state,
}: {
	state: ParserState;
	endOfMdat: number;
}): Promise<MoovBox> => {
	const headerSegment = state.mp4HeaderSegment;
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
	});

	const onAudioTrack: OnAudioTrack | null = state.onAudioTrack
		? async ({track, container}) => {
				await registerAudioTrack({
					workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
					track,
					container,
					callbacks: state.callbacks,
					logLevel: state.logLevel,
					onAudioTrack: state.onAudioTrack,
				});
				return null;
			}
		: null;

	const onVideoTrack: OnVideoTrack | null = state.onVideoTrack
		? async ({track, container}) => {
				await registerVideoTrack({
					workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
					track,
					container,
					callbacks: state.callbacks,
					logLevel: state.logLevel,
					onVideoTrack: state.onVideoTrack,
				});
				return null;
			}
		: null;

	const iterator: BufferIterator = getArrayBufferIterator(
		new Uint8Array([]),
		state.contentLength,
	);

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

	const keyframes = keyframesState();
	const callbacks = sampleCallback({
		hasAudioTrackHandlers: false,
		hasVideoTrackHandlers: false,
		controller: state.controller,
		emittedFields: emittedState(),
		fields: getFieldsFromCallback({
			callbacks: {},
			fields: {structure: true},
		}),
		keyframes,
		logLevel: state.logLevel,
		seekSignal: state.controller._internals.seekSignal,
		slowDurationAndFpsState: state.slowDurationAndFps,
		src: state.src,
		structure: state.structure,
	});

	while (true) {
		const box = await processBox({
			iterator,
			logLevel: state.logLevel,
			onlyIfMoovAtomExpected: {
				callbacks,
				isoState: state.iso,
				workOnSeekRequestOptions: null,
				onAudioTrack,
				onVideoTrack,
			},
			onlyIfMdatAtomExpected: null,
		});
		if (box) {
			boxes.push(box);
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
