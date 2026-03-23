import {canEncodeAudio} from 'mediabunny';

let registrationPromise: Promise<void> | null = null;

const doRegister = async (): Promise<void> => {
	const nativeSupport = await canEncodeAudio('aac');
	if (!nativeSupport) {
		const {registerAacEncoder} = await import('@mediabunny/aac-encoder');
		registerAacEncoder();
	}
};

export const ensureAacEncoderRegistered = (): Promise<void> => {
	if (!registrationPromise) {
		registrationPromise = doRegister();
	}

	return registrationPromise;
};
