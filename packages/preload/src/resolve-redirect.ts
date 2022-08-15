export const resolveRedirect = async (videoOrAudio: string) => {
	const res = await fetch(videoOrAudio);
	return res.url;
};
