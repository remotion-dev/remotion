const alreadyWarned: {[key: string]: boolean} = {};

export const warnAboutNonSeekableMedia = (
	ref: HTMLMediaElement,
	type: 'console' | 'exception'
) => {
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
		const msg = `The media does not seem to support seeking. Remotion cannot properly handle it. Please see https://remotion.dev/docs/non-seekable-media for assistance. Source: ${ref.src}`;

		if (type === 'console') {
			console.error(msg);
		} else {
			throw new Error(msg);
		}

		alreadyWarned[ref.src] = true;
	}
};
