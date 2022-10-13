import execa from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {_downloadFile} from './browser/BrowserFetcher';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {binaryExists, ffmpegInNodeModules} from './validate-ffmpeg';

let buildConfig: string | null = null;
const listeners: Record<string, (() => void)[]> = {};
const isDownloading: Record<string, boolean> = {};

export type FfmpegVersion = [number, number, number] | null;

export const getFfmpegBuildInfo = async (
	options: {
		ffmpegExecutable: string | null;
	},
	remotionRoot: string
) => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa(
		await getExecutableFfmpeg(options.ffmpegExecutable, remotionRoot),
		['-buildconf'],
		{
			reject: false,
		}
	);
	buildConfig = data.stderr;
	return buildConfig;
};

const getFfmpegFolderName = (remotionRoot: string): string => {
	return path.resolve(remotionRoot, 'node_modules/.ffmpeg');
};

const createDotFfmpegFolder = (remotionRoot: string) => {
	fs.mkdirSync(getFfmpegFolderName(remotionRoot));
};

export const getFfmpegAbsolutePath = (remotionRoot: string): string => {
	if (!fs.existsSync(getFfmpegFolderName(remotionRoot))) {
		createDotFfmpegFolder(remotionRoot);
	}

	const destinationPath =
		os.platform() === 'win32'
			? path.resolve(getFfmpegFolderName(remotionRoot), 'ffmpeg.exe')
			: path.resolve(getFfmpegFolderName(remotionRoot), 'ffmpeg');

	return destinationPath;
};

export const ffmpegHasFeature = async ({
	ffmpegExecutable,
	feature,
	remotionRoot,
}: {
	ffmpegExecutable: string | null;
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx';
	remotionRoot: string;
}) => {
	if (!(await binaryExists('ffmpeg', ffmpegExecutable))) {
		return false;
	}

	const config = await getFfmpegBuildInfo({ffmpegExecutable}, remotionRoot);
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

export const getFfmpegVersion = async (
	options: {
		ffmpegExecutable: string | null;
	},
	remotionRoot: string
): Promise<FfmpegVersion> => {
	const buildInfo = await getFfmpegBuildInfo(
		{
			ffmpegExecutable: options.ffmpegExecutable,
		},
		remotionRoot
	);
	return parseFfmpegVersion(buildInfo);
};

const waitForFfmpegToBeDownloaded = (url: string) => {
	return new Promise<void>((resolve) => {
		if (!listeners[url]) {
			listeners[url] = [];
		}

		listeners[url].push(resolve);
	});
};

export const downloadFfmpeg = async (remotionRoot: string): Promise<void> => {
	// implement callback instead
	const onProgress = (
		downloadedBytes: number,
		totalBytesToDownload: number
	) => {
		console.log(
			'Downloading ffmpeg: ',
			toMegabytes(downloadedBytes) + '/' + toMegabytes(totalBytesToDownload)
		);
	};

	const destinationPath = getFfmpegAbsolutePath(remotionRoot);

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

	if (isDownloading[url]) {
		return waitForFfmpegToBeDownloaded(url);
	}

	isDownloading[url] = true;
	const totalBytes = await _downloadFile(url, destinationPath, onProgress);
	onProgress(totalBytes, totalBytes);
	if (os.platform() !== 'win32') {
		fs.chmodSync(destinationPath, '755');
	}

	isDownloading[url] = false;
	if (!listeners[url]) {
		listeners[url] = [];
	}

	listeners[url].forEach((listener) => listener());
	listeners[url] = [];
};

export const getExecutableFfmpeg = async (
	ffmpegExecutable: FfmpegExecutable | null,
	remotionRoot: string
) => {
	if (
		(await binaryExists('ffmpeg', ffmpegExecutable)) &&
		ffmpegExecutable !== null
	) {
		return ffmpegExecutable;
	}

	if (await binaryExists('ffmpeg', ffmpegExecutable)) {
		return 'ffmpeg';
	}

	if (ffmpegInNodeModules(remotionRoot)) {
		return getFfmpegAbsolutePath(remotionRoot);
	}

	await downloadFfmpeg(remotionRoot);
	return getFfmpegAbsolutePath(remotionRoot);
};

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}
