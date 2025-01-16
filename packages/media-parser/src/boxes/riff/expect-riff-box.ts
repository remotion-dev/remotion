import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import {
	registerTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {makeAviAudioTrack, makeAviVideoTrack} from './get-tracks-from-avi';
import {isMoviAtom} from './is-movi';
import {parseMovi} from './parse-movi';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

export type RiffResult =
	| {
			type: 'incomplete';
			continueParsing: () => Promise<RiffResult>;
	  }
	| {
			type: 'complete';
			box: RiffBox | null;
			skipTo: number | null;
	  };

export const expectRiffBox = async ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<RiffResult> => {
	const continueParsing = () => {
		return expectRiffBox({iterator, state, fields});
	};

	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return {
			type: 'incomplete',
			continueParsing,
		};
	}

	const ckId = iterator.getByteString(4, false);
	const ckSize = iterator.getUint32Le();

	if (isMoviAtom(iterator, ckId)) {
		iterator.discard(4);

		return parseMovi({
			iterator,
			maxOffset: ckSize + iterator.counter.getOffset() - 4,
			state,
		});
	}

	if (iterator.bytesRemaining() < ckSize) {
		iterator.counter.decrement(8);
		return {
			type: 'incomplete',
			continueParsing,
		};
	}

	const box = await parseRiffBox({
		id: ckId,
		iterator,
		size: ckSize,
		state,
		fields,
	});

	if (box.type === 'strh-box') {
		if (box.strf.type === 'strf-box-audio' && state.onAudioTrack) {
			const audioTrack = makeAviAudioTrack({
				index: state.riff.getNextTrackIndex(),
				strf: box.strf,
			});
			await registerTrack({
				state,
				track: audioTrack,
				container: 'avi',
			});
		}

		if (state.onVideoTrack && box.strf.type === 'strf-box-video') {
			const videoTrack = makeAviVideoTrack({
				strh: box,
				index: state.riff.getNextTrackIndex(),
				strf: box.strf,
			});
			registerVideoTrackWhenProfileIsAvailable({
				state,
				track: videoTrack,
				container: 'avi',
			});
		}

		state.riff.incrementNextTrackIndex();
	}

	return {
		type: 'complete',
		box,
		skipTo: null,
	};
};
