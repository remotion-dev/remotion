import {Log} from '../../log';
import {registerAudioTrack, registerVideoTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {makeParserState} from '../../state/parser-state';
import type {IsoBaseMediaBox} from './base-media-box';
import type {MoovBox} from './moov/moov';
import {processBox} from './process-box';

export const getMoovAtom = async ({
	endOfMdat,
	state,
}: {
	state: ParserState;
	endOfMdat: number;
}): Promise<MoovBox> => {
	const start = Date.now();
	Log.verbose(state.logLevel, 'Starting second fetch to get moov atom');
	const {reader} = await state.readerInterface.read({
		src: state.src,
		range: endOfMdat,
		controller: state.controller,
	});

	const childState = makeParserState({
		hasAudioTrackHandlers: false,
		hasVideoTrackHandlers: false,
		controller: state.controller,
		fields: {
			structure: true,
		},
		onAudioTrack: state.onAudioTrack
			? async ({track, container}) => {
					await registerAudioTrack({state, track, container});
					return null;
				}
			: null,
		onVideoTrack: state.onVideoTrack
			? async ({track, container}) => {
					await registerVideoTrack({state, track, container});
					return null;
				}
			: null,
		contentLength: state.contentLength,
		logLevel: state.logLevel,
		mode: 'query',
		readerInterface: state.readerInterface,
		src: state.src,
		onDiscardedData: null,
		selectM3uStreamFn: state.selectM3uStreamFn,
		selectM3uAssociatedPlaylistsFn: state.selectM3uAssociatedPlaylistsFn,
	});

	while (true) {
		const result = await reader.reader.read();
		if (result.value) {
			childState.iterator.addData(result.value);
		}

		if (result.done) {
			break;
		}
	}

	const boxes: IsoBaseMediaBox[] = [];

	while (true) {
		const box = await processBox(childState);
		if (box) {
			boxes.push(box);
		}

		if (
			childState.iterator.counter.getOffset() + endOfMdat >
			state.contentLength
		) {
			throw new Error('Read past end of file');
		}

		if (
			childState.iterator.counter.getOffset() + endOfMdat ===
			state.contentLength
		) {
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
