const alreadyWarned: {[key: string]: boolean} = {};

export const warnAboutNonSeekableMedia = (ref: HTMLMediaElement) => {
	// Media is not loaded yet, but this does not yet mean something is wrong with the media
	if (ref.seekable.length === 0) {
		return;
	}

	if (ref.seekable.length > 1) {
		return;
	}

	if (alreadyWarned[ref.src]) {
		return;
	}

	const range = {start: ref.seekable.start(0), end: ref.seekable.end(0)};

	if (range.start === 0 && range.end === 0) {
		console.error(
			'The media',
			ref.src,
			'does not seem to support seeking. Remotion cannot properly handle it. Please see https://remotion.dev/docs/non-seekable-media for assistance.'
		);
		alreadyWarned[ref.src] = true;
	}
};
