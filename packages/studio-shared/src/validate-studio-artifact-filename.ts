const windowsDeviceName =
	/^(?:con|prn|aux|nul|clock\$|conin\$|conout\$|com[0-9¹²³]|lpt[0-9¹²³]) *(?:\.|$)/i;
const windowsShortName = /^[^.]{1,6}~\d+(?:\.[^.]{1,3})?$/;

export const getPortableDownloadFilename = (filename: string): string => {
	const name = filename
		.replace(/[\p{Cc}\p{Cs}<>:"\\/|?*]/gu, '_')
		.replace(/^ +|[. ]+$/g, '');
	if (!name || windowsDeviceName.test(name)) {
		return '_' + name;
	}

	return windowsShortName.test(name) ? name.replace('~', '_') : name;
};

export const validateStudioArtifactFilename = (filename: string): void => {
	for (const segment of filename.split('/')) {
		if (getPortableDownloadFilename(segment) !== segment) {
			throw new Error(`Invalid render artifact filename: ${filename}`);
		}
	}
};
