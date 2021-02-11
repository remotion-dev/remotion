import minimist from 'minimist';

export const getQuality = (): number | undefined => {
	const arg = minimist<{
		quality: number | undefined;
	}>(process.argv.slice(2));
	if (arg.quality === 0 || arg.quality === undefined) {
		return undefined;
	}
	if (arg.quality > 100 || arg.quality < 0) {
		console.log('--quality flag must be between 1 and 100.');
		process.exit(1);
	}
	return arg.quality ?? undefined;
};
