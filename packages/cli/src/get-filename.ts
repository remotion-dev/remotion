import minimist from 'minimist';
import {Config, OutputFormat} from 'remotion';

export const getOutputFilename = (renderMode: OutputFormat): string => {
	const args = minimist(process.argv.slice(2));
	if (!args._[3]) {
		console.log('Pass an extra argument <output-filename>.');
		process.exit(1);
	}
	let filename = args._[3];
	const filenameArr = filename.split('.');
	const filenameArrLength = filenameArr.length;
	if (filenameArrLength === 1 && renderMode !== 'png') {
		console.info(
			'User has given a file without extension , adding the extension automatically.'
		);
		if (renderMode === 'mp4') {
			filename += '.mp4';
		}
		if (renderMode === 'webm-v8' || renderMode === 'webm-v9') {
			filename += '.webm';
		}
	}
	if (filenameArrLength >= 2 && filenameArr[filenameArrLength - 1] === 'webm') {
		if (renderMode === 'mp4') {
			console.info(
				'User has given WebM extension, encoding it using the default VP8 codec. To use VP9 codec use --format=webm-v9 flag.'
			);
			Config.Output.setOutputFormat('webm-v8');
			renderMode = 'webm-v8';
		}
	}
	if (renderMode === 'mp4') {
		if (
			filenameArrLength >= 2 &&
			filenameArr[filenameArrLength - 1] !== 'mp4'
		) {
			console.error(
				'User has selected MP4 format , the output extension must be .mp4'
			);
			process.exit(1);
		}
	}
	if (renderMode === 'webm-v8' || renderMode === 'webm-v9') {
		if (
			filenameArrLength >= 2 &&
			filenameArr[filenameArrLength - 1] !== 'webm'
		) {
			console.error(
				'User has selected WebM format , the output extension must be .webm'
			);
			process.exit(1);
		}
	}
	if (renderMode === 'png') {
		if (filenameArrLength >= 2) {
			console.error(
				'User has selected PNG format , there can not be an extension'
			);
			process.exit(1);
		}
	}
	return filename;
};
