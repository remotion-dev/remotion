import type {AudioSampleSource, VideoSampleSource} from 'mediabunny';
import {AudioSample, VideoSample} from 'mediabunny';

export const addVideoSampleAndCloseFrame = async (
	frameToEncode: VideoFrame,
	videoSampleSource: VideoSampleSource,
	durationInSeconds: number,
) => {
	let sample: VideoSample | undefined;
	try {
		sample = new VideoSample(frameToEncode, {duration: durationInSeconds});
		await videoSampleSource.add(sample);
	} finally {
		sample?.close();
		frameToEncode.close();
	}
};

export const addAudioSample = async (
	audio: AudioData,
	audioSampleSource: AudioSampleSource,
) => {
	const sample = new AudioSample(audio);

	try {
		await audioSampleSource.add(sample);
	} finally {
		sample.close();
	}
};
