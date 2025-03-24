import {getSeekingByte, getSeekingInfo} from './get-seeking-info';
import {Log} from './log';
import {performSeek} from './perform-seek';
import type {Seek} from './seek-signal';
import type {ParserState} from './state/parser-state';

const turnSeekIntoByte = (seek: Seek, state: ParserState): SeekResolution => {
	if (seek.type === 'keyframe-before-time-in-seconds') {
		const seekingInfo = getSeekingInfo(state);
		if (!seekingInfo) {
			return {
				type: 'valid-but-must-wait',
			};
		}

		const seekingByte = getSeekingByte(seekingInfo, seek.time);

		return {
			type: 'do-seek',
			byte: seekingByte,
		};
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
	const resolution = turnSeekIntoByte(seek, state);
	Log.trace(state.logLevel, `Seek action: ${JSON.stringify(resolution)}`);

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
	}

	if (resolution.type === 'invalid') {
		throw new Error(
			`The seek request ${JSON.stringify(seek)} cannot be processed`,
		);
	}
};

type SeekResolution =
	| {
			type: 'valid-but-must-wait';
	  }
	| {
			type: 'invalid';
	  }
	| {
			type: 'do-seek';
			byte: number;
	  };
