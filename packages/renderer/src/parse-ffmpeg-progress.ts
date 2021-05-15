export const parseFfmpegProgress = (input: string): number | undefined => {
	const match = input.match(/frame=(\s+)?([0-9]+)\s/);
	if (!match) {
		return undefined;
	}

	return Number(match[2]);
};
