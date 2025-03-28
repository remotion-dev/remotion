import type {Seek} from './controller/seek-signal';
import {getSeekingByte, getSeekingInfo} from './get-seeking-info';
import {Log} from './log';
import {performSeek} from './perform-seek';
import type {ParserState} from './state/parser-state';

const turnSeekIntoByte = async ({
	seek,
	state,
}: {
	seek: Seek;
	state: ParserState;
}): Promise<SeekResolution> => {
	const videoSections = state.videoSection.getVideoSections();
	if (videoSections.length === 0) {
		Log.trace(state.logLevel, 'No video sections defined, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	if (seek.type === 'keyframe-before-time-in-seconds') {
		const seekingInfo = getSeekingInfo(state);
		if (!seekingInfo) {
			Log.trace(state.logLevel, 'No seeking info, cannot seek yet');
			return {
				type: 'valid-but-must-wait',
			};
		}

		const seekingByte = await getSeekingByte({
			info: seekingInfo,
			time: seek.time,
			logLevel: state.logLevel,
			currentPosition: state.iterator.counter.getOffset(),
			src: state.src,
			contentLength: state.contentLength,
			controller: state.controller,
			readerInterface: state.readerInterface,
			videoSectionState: state.videoSection,
			callbacks: state.callbacks,
			isoState: state.iso,
		});

		return seekingByte;
	}

	if (seek.type === 'byte') {
		return {
			type: 'do-seek',
			byte: seek.byte,
		};
	}

	throw new Error(
		`Cannot process seek request for ${seek}: ${JSON.stringify(seek)}`,
	);
};

export const workOnSeekRequest = async (state: ParserState) => {
	const seek = state.controller._internals.seekSignal.getSeek();
	if (!seek) {
		return;
	}

	Log.trace(state.logLevel, `Has seek request: ${JSON.stringify(seek)}`);
	const resolution = await turnSeekIntoByte({seek, state});
	Log.trace(state.logLevel, `Seek action: ${JSON.stringify(resolution)}`);

	if (resolution.type === 'intermediary-seek') {
		await performSeek({
			state,
			seekTo: resolution.byte,
			userInitiated: false,
		});
		return;
	}

	if (resolution.type === 'do-seek') {
		await performSeek({state, seekTo: resolution.byte, userInitiated: true});
		const {hasChanged} =
			state.controller._internals.seekSignal.clearSeekIfStillSame(seek);
		if (hasChanged) {
			Log.trace(
				state.logLevel,
				`Seek request has changed while seeking, seeking again`,
			);
			await workOnSeekRequest(state);
		}

		return;
	}

	if (resolution.type === 'invalid') {
		throw new Error(
			`The seek request ${JSON.stringify(seek)} cannot be processed`,
		);
	}

	if (resolution.type === 'valid-but-must-wait') {
		Log.trace(
			state.logLevel,
			'Seek request is valid but cannot be processed yet',
		);
	}
};

export type SeekResolution =
	| {
			type: 'valid-but-must-wait';
	  }
	| {
			type: 'invalid';
	  }
	| {
			type: 'intermediary-seek';
			byte: number;
	  }
	| {
			type: 'do-seek';
			byte: number;
	  };
