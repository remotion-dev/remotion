import execa from 'execa';
import {existsSync, statSync} from 'fs';
import os from 'os';
import {
	downloadBinary,
	ffmpegInNodeModules,
	getBinaryDownloadUrl,
	getFfmpegBuildInfo,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {warnAboutFfmpegVersion} from './warn-about-ffmpeg-version';

const existsMap: {[key: string]: boolean} = {};

export const customExecutableExists = (localExecutable: string): boolean => {
	try {
		statSync(localExecutable);
		existsMap[localExecutable] = true;
	} catch (err) {
		existsMap[localExecutable] = false;
	}

	return existsMap[localExecutable];
};

export const binaryExists = (name: 'ffmpeg' | 'ffprobe' | 'brew') => {
	if (typeof existsMap[name] !== 'undefined') {
		return existsMap[name];
	}

	const isWin = os.platform() === 'win32';
	const where = isWin ? 'where' : 'which';
	try {
		execa.sync(where, [name]);
		existsMap[name] = true;
		return true;
	} catch (err) {
		existsMap[name] = false;
		return false;
	}
};

const isHomebrewInstalled = (): boolean => {
	return binaryExists('brew');
};

export const checkAndValidateFfmpegVersion = async (options: {
	ffmpegExecutable: string | null;
	remotionRoot: string;
}) => {
	const ffmpegVersion = await getFfmpegVersion({
		ffmpegExecutable: options.ffmpegExecutable,
		remotionRoot: options.remotionRoot,
	});
	const buildConf = await getFfmpegBuildInfo({
		ffmpegExecutable: options.ffmpegExecutable,
		remotionRoot: options.remotionRoot,
	});
	warnAboutFfmpegVersion({ffmpegVersion, buildConf});
};

export const validateFfmpeg = async (
	customFfmpegBinary: string | null,
	remotionRoot: string
): Promise<void> => {
	if (process.platform === 'linux' && existsSync('/opt/bin/ffmpeg')) {
		return;
	}

	const ffmpegExists = binaryExists('ffmpeg');
	if (ffmpegExists) {
		return;
	}

	if (customFfmpegBinary) {
		const exists = customExecutableExists(customFfmpegBinary);
		if (exists) {
			return;
		}

		throw new Error(
			'Custom FFmpeg executable not found: ' + customFfmpegBinary
		);
	}

	if (ffmpegInNodeModules(remotionRoot, 'ffmpeg')) {
		return;
	}

	if (
		os.platform() === 'darwin' ||
		(os.platform() === 'win32' && process.arch === 'x64') ||
		(os.platform() === 'linux' && process.arch === 'x64')
	) {
		await downloadBinary(
			remotionRoot,
			getBinaryDownloadUrl('ffmpeg').url,
			'ffmpeg'
		);
		return validateFfmpeg(customFfmpegBinary, remotionRoot);
	}

	if (customFfmpegBinary) {
		console.error('FFmpeg executable not found:');
		console.error(customFfmpegBinary);
		throw new Error('FFmpeg not found');
	}

	console.error('It looks like FFMPEG is not installed');
	if (os.platform() === 'darwin' && isHomebrewInstalled()) {
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

	throw new Error('FFmpeg not found');
};
