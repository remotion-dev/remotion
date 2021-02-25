import minimist from 'minimist';

export const getUserPassedOutputLocation = () => {
	const args = minimist(process.argv.slice(2));
	if (!args._[3]) {
		console.log('Pass an extra argument <output-filename>.');
		process.exit(1);
	}
	const filename = args._[3];
	return filename;
};

export const getUserPassedFileExtension = () => {
	const filename = getUserPassedOutputLocation();
	const filenameArr = filename.split('.');

	const hasExtension = filenameArr.length >= 2;
	const filenameArrLength = filenameArr.length;
	const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
	return extension;
};
