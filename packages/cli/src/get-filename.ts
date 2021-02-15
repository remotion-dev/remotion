import minimist from 'minimist';

export const getOutputFilename = () => {
	const args = minimist(process.argv.slice(2));
	if (!args._[3]) {
		console.log('Pass an extra argument <output-filename>.');
		process.exit(1);
	}
	return args._[3].split('.')[0];
};
