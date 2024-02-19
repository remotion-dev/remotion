/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import extractZip from 'extract-zip';

import {promisify} from 'node:util';
import {assert} from './assert';

import {downloadFile} from '../assets/download-file';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import {getDownloadsCacheDir} from './get-download-destination';

const downloadURLs: Record<Platform, string> = {
	linux:
		'https://github.com/Alex313031/thorium/releases/download/M117.0.5938.157/thorium-browser_117.0.5938.157_amd64.zip',
	mac: 'https://github.com/Alex313031/Thorium-MacOS/releases/download/M116.0.5845.169/Thorium_MacOS_X64.dmg',
	mac_arm:
		'https://github.com/Alex313031/Thorium-MacOS/releases/download/M116.0.5845.169/Thorium_MacOS_ARM.dmg',
	win64:
		'https://github.com/Alex313031/Thorium-Win/releases/download/M117.0.5938.157/Thorium_117.0.5938.157.zip',
};

type Platform = 'linux' | 'mac' | 'mac_arm' | 'win64';

function getThoriumDownloadUrl(platform: Platform): string {
	return downloadURLs[platform];
}

const readdirAsync = fs.promises.readdir;
const mkdirAsync = fs.promises.mkdir;
const unlinkAsync = promisify(fs.unlink.bind(fs));
const chmodAsync = promisify(fs.chmod.bind(fs));

function existsAsync(filePath: string): Promise<boolean> {
	return new Promise((resolve) => {
		fs.access(filePath, (err) => {
			return resolve(!err);
		});
	});
}

interface BrowserFetcherRevisionInfo {
	folderPath: string;
	executablePath: string;
	url: string;
	local: boolean;
}

const getPlatform = (): Platform => {
	const platform = os.platform();
	switch (platform) {
		case 'darwin':
			return os.arch() === 'arm64' ? 'mac_arm' : 'mac';
		case 'linux':
			return 'linux';
		case 'win32':
			return 'win64';
		default:
			assert(false, 'Unsupported platform: ' + platform);
	}
};

const destination = '.thorium';

const getDownloadsFolder = () => {
	return path.join(getDownloadsCacheDir(), destination);
};

export const downloadBrowser = async (options: {
	logLevel: LogLevel;
	indent: boolean;
}): Promise<BrowserFetcherRevisionInfo | undefined> => {
	const platform = getPlatform();
	const downloadURL = getThoriumDownloadUrl(platform);
	const fileName = downloadURL.split('/').pop();
	assert(fileName, `A malformed download URL was found: ${downloadURL}.`);
	const downloadsFolder = getDownloadsFolder();
	const archivePath = path.join(downloadsFolder, fileName);
	const outputPath = getFolderPath(downloadsFolder, platform);
	if (await existsAsync(outputPath)) {
		return getRevisionInfo();
	}

	if (!(await existsAsync(downloadsFolder))) {
		await mkdirAsync(downloadsFolder, {
			recursive: true,
		});
	}

	// Use system Chromium builds on Linux ARM devices
	if (os.platform() !== 'darwin' && os.arch() === 'arm64') {
		throw new Error(
			'The chromium binary is not available for arm64.' +
				'\nIf you are on Ubuntu, you can install with: ' +
				'\n\n sudo apt install chromium\n' +
				'\n\n sudo apt install chromium-browser\n',
		);
	}

	try {
		let lastProgress = 0;
		await downloadFile({
			url: downloadURL,
			to: () => archivePath,
			onProgress: (progress) => {
				if (progress.downloaded > lastProgress + 10_000_000) {
					lastProgress = progress.downloaded;

					Log.info(
						{indent: options.indent, logLevel: options.logLevel},
						`Downloading Thorium - ${toMegabytes(
							progress.downloaded,
						)}/${toMegabytes(progress.totalSize as number)}`,
					);
				}
			},
			indent: options.indent,
			logLevel: options.logLevel,
		});
		await install({archivePath, folderPath: outputPath});
	} finally {
		if (await existsAsync(archivePath)) {
			await unlinkAsync(archivePath);
		}
	}

	const revisionInfo = getRevisionInfo();
	await chmodAsync(revisionInfo.executablePath, 0o755);

	return revisionInfo;
};

const getFolderPath = (downloadsFolder: string, platform: Platform): string => {
	return path.resolve(downloadsFolder, platform);
};

const getExecutablePath = () => {
	const downloadsFolder = getDownloadsFolder();
	const platform = getPlatform();
	const folderPath = getFolderPath(downloadsFolder, platform);

	if (platform === 'mac' || platform === 'mac_arm') {
		return path.join(folderPath, 'Thorium.app', 'Contents', 'MacOS', 'Thorium');
	}

	if (platform === 'linux') {
		return path.join(folderPath, 'thorium');
	}

	if (platform === 'win64') {
		return path.join(folderPath, 'BIN', 'thorium.exe');
	}

	throw new Error('Can not download browser for platform: ' + platform);
};

export const getRevisionInfo = (): BrowserFetcherRevisionInfo => {
	const executablePath = getExecutablePath();
	const downloadsFolder = getDownloadsFolder();
	const platform = getPlatform();
	const folderPath = getFolderPath(downloadsFolder, platform);

	const url = getThoriumDownloadUrl(platform);
	const local = fs.existsSync(folderPath);
	return {
		executablePath,
		folderPath,
		local,
		url,
	};
};

async function install({
	archivePath,
	folderPath,
}: {
	archivePath: string;
	folderPath: string;
}): Promise<unknown> {
	if (archivePath.endsWith('.zip')) {
		return extractZip(archivePath, {dir: folderPath});
	}

	if (archivePath.endsWith('.dmg')) {
		await mkdirAsync(folderPath);
		return _installDMG(archivePath, folderPath);
	}

	throw new Error(`Unsupported archive format: ${archivePath}`);
}

function _installDMG(dmgPath: string, folderPath: string): Promise<void> {
	let mountPath: string | undefined;

	return new Promise<void>((fulfill, reject): void => {
		const mountCommand = `hdiutil attach -nobrowse -noautoopen "${dmgPath}"`;
		childProcess.exec(mountCommand, (err, stdout) => {
			if (err) {
				return reject(err);
			}

			const volumes = stdout.match(/\/Volumes\/(.*)/m);
			if (!volumes) {
				return reject(new Error(`Could not find volume path in ${stdout}`));
			}

			mountPath = volumes[0] as string;
			readdirAsync(mountPath)
				.then((fileNames) => {
					const appName = fileNames.find((item) => {
						return typeof item === 'string' && item.endsWith('.app');
					});
					if (!appName) {
						return reject(new Error(`Cannot find app in ${mountPath}`));
					}

					const copyPath = path.join(mountPath as string, appName);
					childProcess.exec(`cp -R "${copyPath}" "${folderPath}"`, (_err) => {
						if (_err) {
							reject(_err);
						} else {
							fulfill();
						}
					});
				})
				.catch(reject);
		});
	})
		.catch((error) => {
			console.error(error);
		})
		.finally((): void => {
			if (!mountPath) {
				return;
			}

			const unmountCommand = `hdiutil detach "${mountPath}" -quiet`;
			childProcess.exec(unmountCommand, (err) => {
				if (err) {
					console.error(`Error unmounting dmg: ${err}`);
				}
			});
		});
}

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}
