import {
	registerAudioTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {makeAviAudioTrack, makeAviVideoTrack} from './get-tracks-from-avi';
import {isMoviAtom} from './is-movi';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

export type RiffResult = {
	box: RiffBox | null;
};

export const expectRiffBox = async (
	state: ParserState,
): Promise<RiffBox | null> => {
	const {iterator} = state;
	// Need at least 16 bytes to read LIST,size,movi,size
	if (state.iterator.bytesRemaining() < 16) {
		return null;
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

		return null;
	}

	if (iterator.bytesRemaining() < ckSize) {
		checkpoint.returnToCheckpoint();
		return null;
	}

	const box = await parseRiffBox({
		id: ckId,
		size: ckSize,
		state,
	});

	if (box.type === 'strh-box') {
		if (box.strf.type === 'strf-box-audio' && state.onAudioTrack) {
			const audioTrack = makeAviAudioTrack({
				index: state.riff.getNextTrackIndex(),
				strf: box.strf,
			});
			await registerAudioTrack({
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

	return box;
};
