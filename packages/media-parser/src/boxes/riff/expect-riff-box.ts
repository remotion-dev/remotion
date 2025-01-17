import type {BufferIterator} from '../../buffer-iterator';
import {
	registerTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {makeAviAudioTrack, makeAviVideoTrack} from './get-tracks-from-avi';
import {isMoviAtom} from './is-movi';
import {parseRiffBox} from './parse-riff-box';
import {parseVideoSection} from './parse-video-section';
import type {RiffBox} from './riff-box';

export type RiffResult = {
	box: RiffBox | null;
	skipTo: number | null;
};

export const expectRiffBox = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<RiffResult> => {
	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return {
			box: null,
			skipTo: null,
		};
	}

	const checkpoint = iterator.startCheckpoint();

	const ckId = iterator.getByteString(4, false);
	const ckSize = iterator.getUint32Le();

	if (isMoviAtom(iterator, ckId)) {
		iterator.discard(4);
		state.videoSection.setVideoSection({
			start: iterator.counter.getOffset(),
			size: ckSize - 4,
		});

		return parseVideoSection({state, iterator});
	}

	if (iterator.bytesRemaining() < ckSize) {
		checkpoint.returnToCheckpoint();
		return {
			box: null,
			skipTo: null,
		};
	}

	const box = await parseRiffBox({
		id: ckId,
		iterator,
		size: ckSize,
		state,
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
		box,
		skipTo: null,
	};
};
