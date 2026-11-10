export const playbackDiagnostics = {
	audioIteratorsCreated: 0,
	mediabunnySinksOpen: 0,
	bufferingHandlesCreated: 0,
	bufferingStatesTriggered: 0,
};

export const registerMediabunnySink = (input: {disposed: boolean}) => {
	let released = input.disposed;
	if (!released) {
		playbackDiagnostics.mediabunnySinksOpen++;
	}

	return () => {
		if (released) {
			return;
		}

		released = true;
		playbackDiagnostics.mediabunnySinksOpen--;
	};
};
