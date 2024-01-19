const beeped: Record<string, boolean> = {};

const playBeepSound = async (renderId: string) => {
	if (beeped[renderId]) {
		return;
	}

	beeped[renderId] = true;

	const beepAudio = new Audio('/beep.wav');
	try {
		await beepAudio.play();
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error playing beep sound:', error);
		throw error;
	}
};

export default playBeepSound;
