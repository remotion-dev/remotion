import type {BufferIterator} from '../../buffer-iterator';
import {getTracks} from '../../get-tracks';
import type {Options, ParseMediaFields} from '../../options';
import {
	registerTrack,
	registerVideoTrackWhenProfileIsAvailable,
} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {
	makeAviAudioTrack,
	makeAviVideoTrack,
	TO_BE_OVERRIDDEN_LATER,
} from './get-tracks-from-avi';
import {isMoviAtom} from './is-movi';
import {parseMovi} from './parse-movi';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

export type RiffResult =
	| {
			type: 'incomplete';
	  }
	| {
			type: 'complete';
			box: RiffBox | null;
			skipTo: number | null;
	  };

const parseVideoSection = ({
	state,
	iterator,
}: {
	state: ParserState;
	iterator: BufferIterator;
}) => {
	const videoSection = state.videoSection.getVideoSection();

	const movi = parseMovi({
		iterator,
		maxOffset: videoSection.start + videoSection.size,
		state,
	});
	const tracks = getTracks(state.structure.getStructure(), state);
	if (!tracks.videoTracks.some((t) => t.codec === TO_BE_OVERRIDDEN_LATER)) {
		state.callbacks.tracks.setIsDone();
	}

	return movi;
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
	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return {
			type: 'incomplete',
		};
	}

	const isInsideVideoSection =
		state.videoSection.isInVideoSectionState(iterator);
	if (isInsideVideoSection === 'in-section') {
		return parseVideoSection({state, iterator});
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
			type: 'incomplete',
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
