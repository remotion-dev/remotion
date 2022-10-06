import execa from 'execa';
import {statSync} from 'fs';
import os from 'os';
import {downloadFfmpeg} from './ffmpeg-flags';

const existsMap: {[key: string]: boolean} = {};

export const binaryExists = async (
	name: 'ffmpeg' | 'brew',
	localFFmpeg: string | null // == customFfmpeg
) => {
	if (typeof existsMap[name] !== 'undefined') {
		return existsMap[name];
	}

	// case where user has specified a custom ffmpeg executable --> we check if its valid
	if (name === 'ffmpeg' && localFFmpeg) {
		try {
			statSync(localFFmpeg); // statSync searches for the file
			existsMap[name] = true;
		} catch (err) {
			existsMap[name] = false;
		}

		return existsMap[name];
	}

	const isWin = os.platform() === 'win32';
	const where = isWin ? 'where' : 'which';
	try {
		await execa(where, [name]);
		existsMap[name] = true;
		return true;
	} catch (err) {
		existsMap[name] = false;
		return false;
	}
};

export const ffmpegInNodeModules = (): Promise<boolean> => {
	const path = require('path');
	const fs = require('fs');

	const expectedFfmpegPath = path.resolve(
		process.cwd(),
		'node_modules/.ffmpeg/ffmpeg'
	);

	return fs.existsSync(expectedFfmpegPath);
};

const isHomebrewInstalled = (): Promise<boolean> => {
	return binaryExists('brew', null);
};

export const validateFfmpeg = async (
	customFfmpegBinary: string | null
): Promise<void> => {
	// binaryExists should also for node_modules
	const ffmpegExists =
		(await binaryExists('ffmpeg', customFfmpegBinary)) ||
		(await ffmpegInNodeModules());
	if (!ffmpegExists) {
		if (
			os.platform() === 'darwin' ||
			os.platform() === 'win32' ||
			(os.platform() === 'linux' && process.arch === 'x64')
		) {
			await downloadFfmpeg();
			return validateFfmpeg(customFfmpegBinary);
		}

		if (customFfmpegBinary) {
			console.error('FFmpeg executable not found:');
			console.error(customFfmpegBinary);
			process.exit(1);
		}

		console.error('It looks like FFMPEG is not installed');
		if (os.platform() === 'darwin' && (await isHomebrewInstalled())) {
			console.error('Run `brew install ffmpeg` to install ffmpeg');
		} else if (os.platform() === 'win32') {
			console.error('1. Install FFMPEG for Windows here:');
			console.error(
				'https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg#installing-ffmpeg-in-windows'
			);
			console.error('2. Add FFMPEG to your PATH');
			console.error('  a. Go to the settings app.');
			console.error('  b. Click System.');
			console.error('  c. Click About.');
			console.error('  d. Click Advanced system settings.');
			console.error('  e. Click Environment variables.');
			console.error(
				'  f. Search for PATH environemnt variable, click edit and the folder where you installed FFMPEG.'
			);
			console.error(
				'  g. Important: Restart your terminal completely to apply the new PATH.'
			);
			console.error('3. Re-run this command.');
		} else {
			console.error(
				'See https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg on how to install FFMPEG.'
			);
		}

		process.exit(1);
	}
};
