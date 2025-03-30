import type {SampleCallbacks} from './state/sample-callbacks';
import type {AudioOrVideoSample} from './webcodec-sample-types';

export const emitAudioSample = async ({
	trackId,
	audioSample,
	callbacks,
}: {
	trackId: number;
	audioSample: AudioOrVideoSample;
	callbacks: SampleCallbacks;
}) => {
	await callbacks.onAudioSample(trackId, audioSample);
};

export const emitVideoSample = async ({
	trackId,
	videoSample,
	callbacks,
}: {
	trackId: number;
	videoSample: AudioOrVideoSample;
	callbacks: SampleCallbacks;
}) => {
	await callbacks.onVideoSample(trackId, videoSample);
};
