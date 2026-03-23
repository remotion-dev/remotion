import {canEncodeAudio} from 'mediabunny';

let registrationPromise: Promise<void> | null = null;

const doRegister = async (): Promise<void> => {
	const nativeSupport = await canEncodeAudio('flac');
	if (!nativeSupport) {
		const {registerFlacEncoder} = await import('@mediabunny/flac-encoder');
		registerFlacEncoder();
	}
};

export const ensureFlacEncoderRegistered = (): Promise<void> => {
	if (!registrationPromise) {
		registrationPromise = doRegister();
	}

	return registrationPromise;
};
