export type THelpLink = {
	url: string;
	title: string;
};

export const getHelpLink = (message: string): THelpLink | null => {
	if (
		message.includes(
			'See https://www.remotion.dev/docs/the-fundamentals#defining-compositions',
		)
	) {
		return {
			title: 'Defining compositions',
			url: 'See https://www.remotion.dev/docs/the-fundamentals#defining-compositions',
		};
	}

	if (message.includes('https://remotion.dev/docs/wrong-composition-mount')) {
		return {
			title: 'Wrongly mounted <Composition>',
			url: 'https://remotion.dev/docs/wrong-composition-mount',
		};
	}

	if (message.includes('https://remotion.dev/docs/staticfile-relative-paths')) {
		return {
			title: 'staticFile() relative paths',
			url: 'https://remotion.dev/docs/staticfile-relative-paths',
		};
	}

	if (message.includes('https://remotion.dev/docs/staticfile-remote-urls')) {
		return {
			title: 'staticFile() remote URLs',
			url: 'https://remotion.dev/docs/staticfile-remote-urls',
		};
	}

	if (message.includes('https://remotion.dev/docs/non-seekable-media')) {
		return {
			title: 'Non-seekable media',
			url: 'https://remotion.dev/docs/non-seekable-media',
		};
	}

	if (message.includes('https://remotion.dev/docs/media-playback-error')) {
		return {
			title: 'Media playback error',
			url: 'https://remotion.dev/docs/media-playback-error',
		};
	}

	if (message.includes('Div is not part of the THREE')) {
		return {
			title: '<Sequence> inside <ThreeCanvas>',
			url: 'https://remotion.dev/docs/sequence#note-for-remotionthree',
		};
	}

	return null;
};
