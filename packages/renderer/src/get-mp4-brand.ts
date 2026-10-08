// Audio-only AAC renders may be saved as .m4a, .m4b or .3gp. These are
// ISO BMFF files, but the compressed audio is ADTS, so it must be remuxed
// rather than copied. Remotion's FFmpeg build has no `ipod` or `3gp` muxer,
// so the `mp4` muxer is used with the major brand that players use to
// identify these files.
const mp4Brands: Record<string, string> = {
	m4a: 'M4A ',
	m4b: 'M4B ',
	'3gp': '3gp4',
};

export const getMp4BrandForExtension = (
	extension: string | null,
): string | null => {
	if (extension === null) {
		return null;
	}

	return mp4Brands[extension.toLowerCase()] ?? null;
};
