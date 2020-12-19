import minimist from 'minimist';

export const getOverwrite = () => {
	const args = minimist<{
		overwrite: boolean;
	}>(process.argv.slice(2));
	return Boolean(args.overwrite);
};
