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
		const msg = `The media ${ref.src} cannot be seeked. This could be one of two reasons: 1) The media resource was replaced while the video is playing but it was not loaded yet. 2) The media does not support seeking. Please see https://remotion.dev/docs/non-seekable-media for assistance.`;

		if (type === 'console-error') {
			console.error(msg);
		} else if (type === 'console-warning') {
			console.warn(
				`The media ${ref.src} does not support seeking. The video will render fine, but may not play correctly in the Remotion Studio and in the <Player>. See https://remotion.dev/docs/non-seekable-media for an explanation.`
			);
		} else {
			throw new Error(msg);
		}

		alreadyWarned[ref.src] = true;
	}
};
