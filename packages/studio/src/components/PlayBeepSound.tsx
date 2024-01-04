const playBeepSound = async () => {
	const beepAudio = new Audio('https://bigsoundbank.com/UPLOAD/wav/2066.wav');
	try {
		await beepAudio.play();
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error playing beep sound:', error);
		throw error;
	}
};

export default playBeepSound;
