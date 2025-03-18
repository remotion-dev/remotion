import type {ParserState} from './state/parser-state';
import type {AudioOrVideoSample} from './webcodec-sample-types';
import {workOnSeekRequest} from './work-on-seek-request';

export const emitAudioSample = async ({
	trackId,
	audioSample,
	state,
}: {
	trackId: number;
	audioSample: AudioOrVideoSample;
	state: ParserState;
}) => {
	await state.callbacks.onAudioSample(trackId, audioSample);
	await workOnSeekRequest(state);
};

export const emitVideoSample = async ({
	trackId,
	videoSample,
	state,
}: {
	trackId: number;
	videoSample: AudioOrVideoSample;
	state: ParserState;
}) => {
	await state.callbacks.onVideoSample(trackId, videoSample);
	await workOnSeekRequest(state);
};
