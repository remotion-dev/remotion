/**
 * @description Follows the redirects of a URL (most commonly a remote video or audio) until the final URL is resolved and returns that.
 * @see [Documentation](https://www.remotion.dev/docs/preload/resolve-redirect)
 */

// Matching the no-data timeout that @remotion/renderer uses for downloads:
// a stalled server should not keep the preload promise pending forever.
const REDIRECT_TIMEOUT = 20000;

export const resolveRedirect = async (videoOrAudio: string) => {
	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, REDIRECT_TIMEOUT);
	try {
		const res = await fetch(videoOrAudio, {signal: controller.signal});
		// We only need the final URL – release the connection without downloading
		// the body. cancel() returns a promise that rejects when the stream has
		// already errored, so swallow that to avoid an unhandled rejection.
		res.body?.cancel().catch(() => undefined);
		return res.url;
	} finally {
		clearTimeout(timeout);
	}
};
