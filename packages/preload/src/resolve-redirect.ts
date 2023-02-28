/**
 * @description Follows the redirects of a URL (most commonly a remote video or audio) until the final URL is resolved and returns that.
 * @see [Documentation](https://www.remotion.dev/docs/preload/resolve-redirect)
 */

export const resolveRedirect = async (videoOrAudio: string) => {
	const res = await fetch(videoOrAudio);
	return res.url;
};
