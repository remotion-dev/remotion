import type {SampleCallbacks} from './state/sample-callbacks';
import type {AudioOrVideoSample} from './webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from './work-on-seek-request';
import {workOnSeekRequest} from './work-on-seek-request';

export const emitAudioSample = async ({
	trackId,
	audioSample,
	workOnSeekRequestOptions,
	callbacks,
}: {
	trackId: number;
	audioSample: AudioOrVideoSample;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	callbacks: SampleCallbacks;
}) => {
	await callbacks.onAudioSample(trackId, audioSample);
	await workOnSeekRequest(workOnSeekRequestOptions);
};

export const emitVideoSample = async ({
	trackId,
	videoSample,
	workOnSeekRequestOptions,
	callbacks,
}: {
	trackId: number;
	videoSample: AudioOrVideoSample;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	callbacks: SampleCallbacks;
}) => {
	await callbacks.onVideoSample(trackId, videoSample);
	await workOnSeekRequest(workOnSeekRequestOptions);
};
