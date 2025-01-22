import type {BufferIterator} from '../../buffer-iterator';
import {getArrayBufferIterator} from '../../buffer-iterator';
import {Log} from '../../log';
import {nodeReader} from '../../readers/from-node';
import {registerTrack} from '../../register-track';
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
	const {contentLength, reader} = await state.readerInterface.read({
		src: state.src,
		range: endOfMdat,
		signal: state.signal,
	});

	if (contentLength === null) {
		throw new Error(
			'Media was passed with no content length. This is currently not supported. Ensure the media has a "Content-Length" HTTP header.',
		);
	}

	const iterator: BufferIterator = getArrayBufferIterator(
		new Uint8Array([]),
		contentLength - endOfMdat,
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

	const childState = makeParserState({
		hasAudioTrackHandlers: false,
		hasVideoTrackHandlers: false,
		signal: state.signal,
		iterator,
		fields: {
			structure: true,
		},
		onAudioTrack: state.onAudioTrack
			? async ({track, container}) => {
					await registerTrack({state, track, container});
					return null;
				}
			: null,
		onVideoTrack: state.onVideoTrack
			? async ({track, container}) => {
					await registerTrack({state, track, container});
					return null;
				}
			: null,
		supportsContentRange: true,
		contentLength,
		logLevel: state.logLevel,
		mode: 'query',
		readerInterface: nodeReader,
		src: state.src,
	});

	const boxes: IsoBaseMediaBox[] = [];

	while (true) {
		const box = await processBox(childState);
		if (box) {
			boxes.push(box);
		}

		if (iterator.counter.getOffset() + endOfMdat > contentLength) {
			throw new Error('Read past end of file');
		}

		if (iterator.counter.getOffset() + endOfMdat === contentLength) {
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
