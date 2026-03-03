import {canEncodeAudio} from 'mediabunny';

let registrationPromise: Promise<void> | null = null;

const doRegister = async (): Promise<void> => {
	const nativeSupport = await canEncodeAudio('mp3');
	if (!nativeSupport) {
		const {registerMp3Encoder} = await import('@mediabunny/mp3-encoder');
		registerMp3Encoder();
	}
};

export const ensureMp3EncoderRegistered = (): Promise<void> => {
	if (!registrationPromise) {
		registrationPromise = doRegister();
	}

	return registrationPromise;
};
