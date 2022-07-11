const alreadyWarned: {[key: string]: boolean} = {};

export const warnAboutNonSeekableMedia = (
	ref: HTMLMediaElement | null,
	type: 'console-warning' | 'console-error' | 'exception'
) => {
	// Media is not loaded yet, but this does not yet mean something is wrong with the media

	if (ref === null) {
		return;
	}

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
		const msg = `The media does not support seeking. Remotion cannot properly render it. Please see https://remotion.dev/docs/non-seekable-media for assistance. Source: ${ref.src}`;

		if (type === 'console-error') {
			console.error(msg);
		} else if (type === 'console-warning') {
			console.warn(
				`The media ${ref.src} does not support seeking. The video will render fine, but may not play correctly in preview and in the <Player>. See https://remotion.dev/docs/non-seekable-media for an explanation.`
			);
		} else {
			throw new Error(msg);
		}

		alreadyWarned[ref.src] = true;
	}
};
