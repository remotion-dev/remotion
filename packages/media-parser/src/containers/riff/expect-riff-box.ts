import type {BufferIterator} from '../../iterator/buffer-iterator';
import {
	registerAudioTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {makeAviAudioTrack, makeAviVideoTrack} from './get-tracks-from-avi';
import {riffHasIndex} from './has-index';
import {isMoviAtom} from './is-movi';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

export type RiffResult = {
	box: RiffBox | null;
};

export const postProcessRiffBox = async (state: ParserState, box: RiffBox) => {
	if (box.type === 'strh-box') {
		if (box.strf.type === 'strf-box-audio' && state.onAudioTrack) {
			const audioTrack = makeAviAudioTrack({
				index: state.riff.getNextTrackIndex(),
				strf: box.strf,
			});
			await registerAudioTrack({
				track: audioTrack,
				container: 'avi',
				registerAudioSampleCallback:
					state.callbacks.registerAudioSampleCallback,
				tracks: state.callbacks.tracks,
				logLevel: state.logLevel,
				onAudioTrack: state.onAudioTrack,
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
};

export const expectRiffBox = async ({
	iterator,
	stateIfExpectingSideEffects,
}: {
	iterator: BufferIterator;
	stateIfExpectingSideEffects: ParserState | null;
}): Promise<RiffBox | null> => {
	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return null;
	}

	const checkpoint = iterator.startCheckpoint();

	const ckId = iterator.getByteString(4, false);
	const ckSize = iterator.getUint32Le();

	if (isMoviAtom(iterator, ckId)) {
		iterator.discard(4);
		if (!stateIfExpectingSideEffects) {
			throw new Error('No state if expecting side effects');
		}

		stateIfExpectingSideEffects.mediaSection.addMediaSection({
			start: iterator.counter.getOffset(),
			size: ckSize - 4,
		});

		if (
			riffHasIndex(stateIfExpectingSideEffects.structure.getRiffStructure())
		) {
			stateIfExpectingSideEffects.riff.lazyIdx1.triggerLoad(
				iterator.counter.getOffset() + ckSize - 4,
			);
		}

		return null;
	}

	if (iterator.bytesRemaining() < ckSize) {
		checkpoint.returnToCheckpoint();
		return null;
	}

	const box = await parseRiffBox({
		id: ckId,
		size: ckSize,
		iterator,
		stateIfExpectingSideEffects,
	});

	return box;
};
