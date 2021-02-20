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
	const hasExtension = filenameArr.length >= 2;
	const filenameArrLength = filenameArr.length;
	const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
	if (filenameArrLength === 1 && renderMode !== 'png') {
		console.info(
			'User has given a file without extension , adding the extension automatically.'
		);
		if (
			renderMode === 'mp4' ||
			renderMode === 'h264' ||
			renderMode === 'h265'
		) {
			filename += '.mp4';
		}
		if (renderMode === 'vp8' || renderMode === 'vp9') {
			filename += '.webm';
		}
	}
	if (extension === 'mp4') {
		if (renderMode === 'mp4') {
			console.info(
				'You have specified a .mp4 extension, encoding it using the default H264 codec. To use H265 codec use --format=h265 flag.'
			);
		}
	}
	if (extension === 'webm') {
		if (renderMode === 'mp4') {
			console.info(
				'You have specified a .webm extension, encoding it using the default VP8 codec. To use VP9 codec use --format=vp9 flag.'
			);
			Config.Output.setOutputFormat('vp8');
			renderMode = 'vp8';
		}
	}
	if (renderMode === 'mp4' || renderMode === 'h264' || renderMode === 'h265') {
		if (hasExtension && extension !== 'mp4') {
			console.error('The output filename must end in .mp4.');
			process.exit(1);
		}
	}
	if (renderMode === 'vp8' || renderMode === 'vp9') {
		if (hasExtension && extension !== 'webm') {
			console.error('The output filename must end in .webm.');
			process.exit(1);
		}
	}
	if (renderMode === 'png') {
		if (hasExtension) {
			console.error('The output directory cannot have an extension.');
			process.exit(1);
		}
	}
	return filename;
};
