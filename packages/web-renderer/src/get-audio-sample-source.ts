import {
	AudioSampleSource,
	type BufferTarget,
	type Output,
	type OutputFormat,
	type StreamTarget,
} from 'mediabunny';
import {getDefaultAudioEncodingConfig} from './get-audio-encoding-config';

export const addAudioSampleSource = async ({
	muted,
	output,
}: {
	muted: boolean;
	output: Output<OutputFormat, StreamTarget | BufferTarget>;
}) => {
	if (muted) {
		return null;
	}

	// TODO: Should be able to customize
	const defaultAudioEncodingConfig = await getDefaultAudioEncodingConfig();

	if (!defaultAudioEncodingConfig) {
		throw new Error('No default audio encoding config found');
	}

	const audioSampleSource = new AudioSampleSource(defaultAudioEncodingConfig);

	output.addAudioTrack(audioSampleSource);

	return {audioSampleSource, [Symbol.dispose]: () => audioSampleSource.close()};
};
