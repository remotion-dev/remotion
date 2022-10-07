import execa from 'execa';
import fs from 'fs';
import {_downloadFile} from './browser/BrowserFetcher';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {binaryExists, ffmpegInNodeModules} from './validate-ffmpeg';

let buildConfig: string | null = null;

export type FfmpegVersion = [number, number, number] | null;

// executes ffmpeg with execa in order to get buildInfos which then can be used elsewhere?
export const getFfmpegBuildInfo = async (options: {
	ffmpegExecutable: string | null;
}) => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa(
		await getExecutableFfmpeg(options.ffmpegExecutable),
		// options.ffmpegExecutable ?? 'ffmpeg',
		['-buildconf'],
		{
			reject: false,
		}
	);
	buildConfig = data.stderr;
	return buildConfig;
};

export const ffmpegHasFeature = async ({
	ffmpegExecutable,
	feature,
}: {
	ffmpegExecutable: string | null;
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx';
}) => {
	if (!(await binaryExists('ffmpeg', ffmpegExecutable))) {
		return false;
	}

	const config = await getFfmpegBuildInfo({ffmpegExecutable});
	return config.includes(feature);
};

export const parseFfmpegVersion = (buildconf: string): FfmpegVersion => {
	const match = buildconf.match(
		/ffmpeg version ([0-9]+).([0-9]+)(?:.([0-9]+))?/
	);
	if (!match) {
		return null;
	}

	return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
};

export const getFfmpegVersion = async (options: {
	ffmpegExecutable: string | null;
}): Promise<FfmpegVersion> => {
	const buildInfo = await getFfmpegBuildInfo({
		ffmpegExecutable: options.ffmpegExecutable,
	});
	return parseFfmpegVersion(buildInfo);
};

export const downloadFfmpeg = async (): Promise<void> => {
	// implement callback instead
	function onProgress(downloadedBytes: number, totalBytes: number) {
		console.log(
			'Downloading ffmpeg: ',
			toMegabytes(downloadedBytes) + '/' + toMegabytes(totalBytes)
		);
	}

	const os = require('os');
	const path = require('path');
	const destinationPath =
		os.platform() === 'win32'
			? path.resolve(process.cwd(), 'node_modules/.ffmpeg/ffmpeg.exe')
			: path.resolve(process.cwd(), 'node_modules/.ffmpeg/ffmpeg');
	if (!fs.existsSync(path.resolve(process.cwd(), 'node_modules/.ffmpeg'))) {
		fs.mkdirSync(path.resolve(process.cwd(), 'node_modules/.ffmpeg'));
	}

	console.log(destinationPath);
	let url: string;

	if (os.platform() === 'win32') {
		url =
			'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-win-x86.exe';
	} else if (os.platform() === 'darwin') {
		url =
			process.arch === 'arm64'
				? 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-macos-arm64'
				: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-macos-x86';
	} else {
		url =
			'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-linux-amd64';
	}

	try {
		const totalBytes = await _downloadFile(url, destinationPath, onProgress);
		onProgress(totalBytes, totalBytes);
		if (os.platform() !== 'win32') {
			fs.chmodSync(destinationPath, '755');
		}
	} catch (error) {
		console.log(error);
	}
};

const getFfmpegBinaryFromNodeModules = () => {
	const os = require('os');
	const isWin = os.platform() === 'win32';
	const path = require('path');
	if (isWin) {
		return path.resolve(process.cwd(), 'node_modules/.ffmpeg/ffmpeg.exe');
	}

	return path.resolve(process.cwd(), 'node_modules/.ffmpeg/ffmpeg');
};

// should check if ffmpeg is installed. If installed, return "ffmpeg" else return path to ffmpeg.exe in node modules
export const getExecutableFfmpeg = async (
	ffmpegExecutable: FfmpegExecutable | null
) => {
	const os = require('os');
	const isWin = os.platform() === 'win32';
	const path = require('path');
	if (await binaryExists('ffmpeg', ffmpegExecutable)) {
		return 'ffmpeg';
	}

	// this part might change a bit after the automatic download is implemented
	if (await ffmpegInNodeModules()) {
		if (!isWin) {
			return path.resolve(process.cwd(), 'node_modules/.ffmpeg/ffmpeg');
		}

		return path.resolve(process.cwd(), 'node_modules/.ffmpeg/ffmpeg.exe');
	}

	await downloadFfmpeg();
	return getFfmpegBinaryFromNodeModules();
};

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}
