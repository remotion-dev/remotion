import {Log} from './log';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = () => {
	if (!parsedCli._[3]) {
		Log.error('Pass an extra argument <output-filename>.');
		process.exit(1);
	}

	const filename = parsedCli._[3];
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
