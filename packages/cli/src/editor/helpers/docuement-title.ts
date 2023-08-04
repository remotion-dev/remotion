let currentVideoId: string | null = null;
let unsavedProps = false;
let tabInactive = false;

export const setCurrentVideoId = (id: string | null) => {
	currentVideoId = id;
	updateTitle();
};

export const setUnsavedProps = (unsaved: boolean) => {
	unsavedProps = unsaved;
};

document.addEventListener('visibilitychange', () => {
	tabInactive = document.visibilityState === 'hidden';
	updateTitle();
});

const updateTitle = () => {
	if (!currentVideoId) {
		document.title = 'Remotion Studio';
		return;
	}

	if (unsavedProps && tabInactive) {
		document.title = `✏️ ${currentVideoId} / ${window.remotion_projectName} - Remotion Studio`;
		return;
	}

	document.title = `${currentVideoId} / ${window.remotion_projectName} - Remotion Studio`;
};
