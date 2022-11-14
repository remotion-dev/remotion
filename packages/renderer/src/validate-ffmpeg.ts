import execa from 'execa';
import {existsSync, statSync} from 'fs';
import os from 'os';
import {
	downloadBinary,
	ffmpegInNodeModules,
	getBinaryDownloadUrl,
	getFfmpegBuildInfo,
	getFfmpegVersion,
	lambdaFfmpegPaths,
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

export const binaryExists = (name: 'ffmpeg' | 'ffprobe') => {
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
	remotionRoot: string,
	binary: 'ffmpeg' | 'ffprobe'
): Promise<void> => {
	const ffmpegExists = binaryExists(binary);
	if (ffmpegExists) {
		return;
	}

	if (customFfmpegBinary) {
		if (!customExecutableExists(customFfmpegBinary)) {
			throw new Error(
				'Custom FFmpeg executable not found: ' + customFfmpegBinary
			);
		}

		return;
	}

	if (process.platform === 'linux' && existsSync(lambdaFfmpegPaths[binary])) {
		return;
	}

	if (ffmpegInNodeModules(remotionRoot, binary)) {
		return;
	}

	const binaryUrl = getBinaryDownloadUrl(binary);

	if (binaryUrl) {
		await downloadBinary(remotionRoot, binaryUrl.url, 'ffmpeg');
		return validateFfmpeg(customFfmpegBinary, remotionRoot, binary);
	}

	throw new Error(
		`${binary} could not be installed automatically. Your architecture and OS combination (os = ${os.platform()}, arch = ${
			process.arch
		}) is not supported. Please install ${binary} manually and add "${binary}" to your PATH.`
	);
};
