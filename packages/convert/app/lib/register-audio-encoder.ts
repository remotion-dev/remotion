import type {AudioCodec} from 'mediabunny';

const registrationPromises = new Map<AudioCodec, Promise<void>>();

const registerAudioEncoder = async (codec: AudioCodec) => {
	if (codec === 'mp3') {
		const {registerMp3Encoder} = await import('@mediabunny/mp3-encoder');
		registerMp3Encoder();
		return;
	}

	if (codec === 'aac') {
		const {registerAacEncoder} = await import('@mediabunny/aac-encoder');
		registerAacEncoder();
		return;
	}

	if (codec === 'flac') {
		const {registerFlacEncoder} = await import('@mediabunny/flac-encoder');
		registerFlacEncoder();
		return;
	}

	if (codec === 'ac3' || codec === 'eac3') {
		const {registerAc3Encoder} = await import('@mediabunny/ac3');
		registerAc3Encoder();
	}
};

export const ensureAudioEncoderRegistered = (codec: AudioCodec) => {
	const existingPromise = registrationPromises.get(codec);
	if (existingPromise) {
		return existingPromise;
	}

	const promise = registerAudioEncoder(codec);
	registrationPromises.set(codec, promise);
	return promise;
};
