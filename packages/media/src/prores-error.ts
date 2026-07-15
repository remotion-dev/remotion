const PRORES_DOCS_URL = 'https://www.remotion.dev/docs/videos/prores';

// Message shown when @remotion/media encounters a ProRes source but the
// ProRes decoder has not been registered. Kept specific so users don't
// confuse decoding a ProRes *source* (this case) with exporting to ProRes.
export const proresDecoderNotEnabledMessage = (src: string) => {
	return (
		`Cannot decode "${src}": it is encoded with Apple ProRes, which WebCodecs does not support natively. ` +
		`ProRes decoding is not enabled by default. Register the ProRes decoder by calling ` +
		`registerProresDecoder() from "@mediabunny/prores" in your entry point, before registerRoot(). ` +
		`See ${PRORES_DOCS_URL}. ` +
		`(This is required to decode a ProRes source for both preview and rendering — it is unrelated to exporting a video as ProRes.)`
	);
};
