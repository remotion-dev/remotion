declare global {
	interface Window {
		remotionEarlyFileDrop: {
			file: File | null;
			stop: () => void;
		} | null;
	}
}

// Runs before the application bundle loads, so dropping a file cannot navigate
// away while React and the media codecs are still loading.
export const earlyFileDropScript = `(() => {
	const state = {file: null, stop: () => {
		document.removeEventListener('dragover', onDragOver, true);
		document.removeEventListener('drop', onDrop, true);
	}};
	const onDragOver = (event) => {
		if (Array.from(event.dataTransfer?.types ?? []).includes('Files')) {
			event.preventDefault();
		}
	};
	const onDrop = (event) => {
		const file = event.dataTransfer?.files[0];
		if (file) {
			event.preventDefault();
			state.file = file;
		}
	};
	window.remotionEarlyFileDrop = state;
	document.addEventListener('dragover', onDragOver, true);
	document.addEventListener('drop', onDrop, true);
})();`;
