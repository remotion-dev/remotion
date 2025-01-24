async function fetchWithTimeout(
	url: string,
	options: FetchRequestInit,
	timeout = 3000,
) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	options.signal = controller.signal;

	try {
		const response = await fetch(url, options);
		clearTimeout(id);
		return response;
	} catch {
		clearTimeout(id);
		throw new Error(`Fetch timed out after ${timeout}ms`);
	}
}

const checkFor404 = (src: string) => {
	return fetchWithTimeout(src, {
		method: 'HEAD',
		mode: 'no-cors',
	}).then((res) => res.status);
};

const checkFor404OrSkip = async ({
	suspecting404,
	sameOrigin,
	src,
}: {
	suspecting404: boolean;
	sameOrigin: boolean;
	src: string;
}) => {
	if (!suspecting404) {
		return Promise.resolve(null);
	}

	if (!sameOrigin) {
		return Promise.resolve(null);
	}

	try {
		return await checkFor404(src);
	} catch {
		return Promise.resolve(null);
	}
};

export const onMediaError = ({
	error,
	src,
	reject,
	cleanup,
	api,
}: {
	error: MediaError;
	src: string;
	reject: (reason: unknown) => void;
	cleanup: () => void;
	api: string;
}) => {
	const suspecting404 = error.MEDIA_ERR_SRC_NOT_SUPPORTED === error.code;
	const isSrcSameOriginAsCurrent = new URL(src, window.location.origin)
		.toString()
		.startsWith(window.location.origin);
	checkFor404OrSkip({
		suspecting404,
		sameOrigin: isSrcSameOriginAsCurrent,
		src,
	})
		.then((status) => {
			const err =
				status === 404
					? new Error(
							[
								`Failed to execute ${api}: Received a 404 error loading "${src}".`,
								'Correct the URL of the file.',
							].join(' '),
						)
					: new Error(
							[
								`Failed to execute ${api}, Received a MediaError loading "${src}". Consider using parseMedia() instead which supports more codecs: https://www.remotion.dev/docs/miscellaneous/parse-media-vs-get-video-metadata`,
								status === null
									? null
									: `HTTP Status code of the file: ${status}.`,
								error.message
									? `Browser error message: ${error.message}`
									: null,
								'Check the path of the file and if it is a valid video.',
							]
								.filter(Boolean)
								.join(' '),
						);
			reject(err);
			cleanup();
		})
		.catch((e) => {
			reject(e);
			cleanup();
		});
};
