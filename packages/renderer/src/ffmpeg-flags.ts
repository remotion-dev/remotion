import execa from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {_downloadFile} from './browser/BrowserFetcher';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {binaryExists, customExecutableExists} from './validate-ffmpeg';

let buildConfig: string | null = null;
const listeners: Record<string, ((path: string) => void)[]> = {};
const isDownloading: Record<string, boolean> = {};

export type FfmpegVersion = [number, number, number] | null;

export const getFfmpegBuildInfo = async (options: {
	ffmpegExecutable: string | null;
	remotionRoot: string;
}) => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa(
		await getExecutableBinary(
			options.ffmpegExecutable,
			options.remotionRoot,
			'ffmpeg'
		),
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

const binaryPrefix = {ffmpeg: 'ffmpeg-', ffprobe: 'ffprobe-'} as const;
const randomFfmpegRuntimeId = String(Math.random()).replace('0.', '');

export const ffmpegInNodeModules = (
	remotionRoot: string,
	binary: 'ffmpeg' | 'ffprobe'
): string | null => {
	const folderName = getFfmpegFolderName(remotionRoot);
	if (!fs.existsSync(folderName)) {
		fs.mkdirSync(folderName);
	}

	// Check if a version of FFMPEG is already installed.
	// To qualify, it must have the expected file size
	// to avoid finding binaries that are still being downloaded
	// A random ID is being assigned to the download to avoid conflicts when multiple Remotion processes are running
	const ffmpegInstalled = fs.readdirSync(folderName).find((filename) => {
		if (!filename.startsWith(binaryPrefix[binary])) {
			return false;
		}

		const dlUrl = getBinaryDownloadUrl(binary);

		if (!dlUrl) {
			return false;
		}

		const expectedLength = dlUrl.contentLength;

		if (fs.statSync(path.join(folderName, filename)).size === expectedLength) {
			return true;
		}

		return false;
	});

	if (ffmpegInstalled) {
		return path.join(folderName, ffmpegInstalled);
	}

	return null;
};

const getFfmpegAbsolutePath = (
	remotionRoot: string,
	binary: 'ffmpeg' | 'ffprobe'
): string => {
	const folderName = getFfmpegFolderName(remotionRoot);
	if (!fs.existsSync(folderName)) {
		fs.mkdirSync(folderName);
	}

	if (os.platform() === 'win32') {
		return path.resolve(
			folderName,
			`${binaryPrefix[binary]}${randomFfmpegRuntimeId}.exe`
		);
	}

	return path.resolve(
		folderName,
		`${binaryPrefix[binary]}${randomFfmpegRuntimeId}`
	);
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
	if (ffmpegExecutable && !customExecutableExists(ffmpegExecutable)) {
		return false;
	}

	if (!binaryExists('ffmpeg')) {
		return false;
	}

	const config = await getFfmpegBuildInfo({ffmpegExecutable, remotionRoot});
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
	remotionRoot: string;
}): Promise<FfmpegVersion> => {
	const buildInfo = await getFfmpegBuildInfo({
		ffmpegExecutable: options.ffmpegExecutable,
		remotionRoot: options.remotionRoot,
	});
	return parseFfmpegVersion(buildInfo);
};

const waitForFfmpegToBeDownloaded = (url: string) => {
	return new Promise<string>((resolve) => {
		if (!listeners[url]) {
			listeners[url] = [];
		}

		listeners[url].push((src) => resolve(src));
	});
};

const onProgress = (
	downloadedBytes: number,
	totalBytesToDownload: number,
	binary: 'ffmpeg' | 'ffprobe'
) => {
	console.log(
		'Downloading ',
		binary,
		`${toMegabytes(downloadedBytes)}/${toMegabytes(totalBytesToDownload)}`
	);
};

export const downloadBinary = async (
	remotionRoot: string,
	url: string,
	binary: 'ffmpeg' | 'ffprobe'
): Promise<string> => {
	const destinationPath = getFfmpegAbsolutePath(remotionRoot, binary);

	const onProgressCallback = (downloadedBytes: number, _totalBytes: number) => {
		onProgress(downloadedBytes, _totalBytes, binary);
	};

	isDownloading[url] = true;
	const totalBytes = await _downloadFile(
		url,
		destinationPath,
		onProgressCallback
	);
	onProgress(totalBytes, totalBytes, binary);
	if (os.platform() !== 'win32') {
		fs.chmodSync(destinationPath, '777');
	}

	isDownloading[url] = false;
	if (!listeners[url]) {
		listeners[url] = [];
	}

	listeners[url].forEach((listener) => listener(destinationPath));
	listeners[url] = [];

	return destinationPath;
};

export const lambdaFfmpegPaths = {
	ffmpeg: '/opt/bin/ffmpeg',
	ffprobe: '/opt/bin/ffprobe',
} as const;

export const getExecutableBinary = (
	ffmpegExecutable: FfmpegExecutable,
	remotionRoot: string,
	binary: 'ffmpeg' | 'ffprobe'
) => {
	if (fs.existsSync(lambdaFfmpegPaths[binary])) {
		return lambdaFfmpegPaths[binary];
	}

	if (ffmpegExecutable && customExecutableExists(ffmpegExecutable)) {
		return ffmpegExecutable;
	}

	if (binaryExists(binary)) {
		return binary;
	}

	const dlUrl = getBinaryDownloadUrl(binary);

	if (dlUrl && isDownloading[dlUrl.url]) {
		return waitForFfmpegToBeDownloaded(dlUrl.url);
	}

	const inNodeMod = ffmpegInNodeModules(remotionRoot, binary);

	if (inNodeMod) {
		return inNodeMod;
	}

	if (!dlUrl) {
		throw new Error(
			`${binary} could not be installed automatically. Your architecture and OS combination (os = ${os.platform()}, arch = ${
				process.arch
			}) is not supported. Please install ${binary} manually and add "${binary}" to your PATH.`
		);
	}

	return downloadBinary(remotionRoot, dlUrl.url, binary);
};

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}

export const getBinaryDownloadUrl = (
	binary: 'ffmpeg' | 'ffprobe'
): {
	url: string;
	contentLength: number;
} | null => {
	if (os.platform() === 'win32' && process.arch === 'x64') {
		return binary === 'ffmpeg'
			? {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-win-x86.exe',
					contentLength: 127531008,
			  }
			: {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffprobe-win-x86.exe',
					contentLength: 127425536,
			  };
	}

	if (os.platform() === 'darwin' && process.arch === 'arm64') {
		return binary === 'ffmpeg'
			? {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-macos-arm64',
					contentLength: 42093320,
			  }
			: {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffprobe-macos-arm64',
					contentLength: 46192536,
			  };
	}

	if (os.platform() === 'darwin' && process.arch === 'x64') {
		return binary === 'ffmpeg'
			? {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-macos-x86',
					contentLength: 78380700,
			  }
			: {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffprobe-macos-x86',
					contentLength: 77364284,
			  };
	}

	if (os.platform() === 'linux' && process.arch === 'x64') {
		return binary === 'ffmpeg'
			? {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffmpeg-linux-amd64',
					contentLength: 78502560,
			  }
			: {
					url: 'https://remotion-ffmpeg-binaries.s3.eu-central-1.amazonaws.com/ffprobe-linux-amd64',
					contentLength: 78400704,
			  };
	}

	return null;
};

const printMessage = (ffmpegVersion: NonNullable<FfmpegVersion>) => {
	console.warn('⚠️Old FFMPEG version detected: ' + ffmpegVersion.join('.'));
	console.warn('   You need at least version 4.1.0.');
	console.warn('   Upgrade FFMPEG to get rid of this warning.');
};

const printBuildConfMessage = () => {
	console.error('⚠️  Unsupported FFMPEG version detected.');
	console.error("   Your version doesn't support the -buildconf flag");
	console.error(
		'   Audio will not be supported and you may experience other issues.'
	);
	console.error(
		'   Upgrade FFMPEG to at least v4.1.0 to get rid of this warning.'
	);
};

export const warnAboutFfmpegVersion = ({
	ffmpegVersion,
	buildConf,
}: {
	ffmpegVersion: FfmpegVersion;
	buildConf: string | null;
}) => {
	if (buildConf === null) {
		printBuildConfMessage();
		return;
	}

	if (ffmpegVersion === null) {
		return null;
	}

	const [major, minor] = ffmpegVersion;
	// 3.x and below definitely is too old
	if (major < 4) {
		printMessage(ffmpegVersion);
		return;
	}

	// 5.x will be all good
	if (major > 4) {
		return;
	}

	if (minor < 1) {
		printMessage(ffmpegVersion);
	}
};
