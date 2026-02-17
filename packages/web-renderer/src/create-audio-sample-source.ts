import {AudioSampleSource, type AudioCodec, type Quality} from 'mediabunny';

export const createAudioSampleSource = ({
	muted,
	codec,
	bitrate,
}: {
	muted: boolean;
	codec: AudioCodec | null;
	bitrate: number | Quality;
}) => {
	if (muted || codec === null) {
		return null;
	}

	const audioSampleSource = new AudioSampleSource({
		codec,
		bitrate,
	});

	return {audioSampleSource, [Symbol.dispose]: () => audioSampleSource.close()};
};
