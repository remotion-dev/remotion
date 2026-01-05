import type {
	AudioEncodingConfig,
	OutputFormat,
	OutputOptions,
	Target,
	VideoEncodingConfig,
} from 'mediabunny';
import {AudioSampleSource, Output, VideoSampleSource} from 'mediabunny';

export const makeOutputWithCleanup = <T extends OutputFormat, U extends Target>(
	options: OutputOptions<T, U>,
): {output: Output<T, U>; [Symbol.dispose]: () => void} => {
	const output = new Output(options);
	return {
		output,
		[Symbol.dispose]: () => {
			if (output.state === 'finalized' || output.state === 'canceled') {
				return;
			}

			output.cancel();
		},
	};
};

export const makeVideoSampleSourceCleanup = (
	encodingConfig: VideoEncodingConfig,
): {
	videoSampleSource: VideoSampleSource;
	[Symbol.dispose]: () => void;
} => {
	const videoSampleSource = new VideoSampleSource(encodingConfig);
	return {
		videoSampleSource,
		[Symbol.dispose]: () => {
			videoSampleSource.close();
		},
	};
};

export const makeAudioSampleSourceCleanup = (
	encodingConfig: AudioEncodingConfig,
): {
	audioSampleSource: AudioSampleSource;
	[Symbol.dispose]: () => void;
} => {
	const audioSampleSource = new AudioSampleSource(encodingConfig);
	return {
		audioSampleSource,
		[Symbol.dispose]: () => {
			audioSampleSource.close();
		},
	};
};
