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

import * as https from 'https';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import util from 'node:util';

import extractZip from 'extract-zip';

import * as URL from 'node:url';
import {promisify} from 'node:util';
import {assert} from './assert';
import type {Product} from './Product';

import {deleteDirectory} from '../delete-directory';
import {getDownloadsCacheDir} from './get-download-destination';

const {PUPPETEER_EXPERIMENTAL_CHROMIUM_MAC_ARM} = process.env;

const downloadURLs: Record<Product, Partial<Record<Platform, string>>> = {
	chrome: {
		linux: '%s/chromium-browser-snapshots/Linux_x64/%d/%s.zip',
		mac: '%s/chromium-browser-snapshots/Mac/%d/%s.zip',
		mac_arm: '%s/chromium-browser-snapshots/Mac_Arm/%d/%s.zip',
		win32: '%s/chromium-browser-snapshots/Win/%d/%s.zip',
		win64: '%s/chromium-browser-snapshots/Win_x64/%d/%s.zip',
	},
	firefox: {
		linux: '%s/firefox-%s.en-US.%s-x86_64.tar.bz2',
		mac: '%s/firefox-%s.en-US.%s.dmg',
		win32: '%s/firefox-%s.en-US.%s.zip',
		win64: '%s/firefox-%s.en-US.%s.zip',
	},
};

const browserConfig = {
	chrome: {
		host: 'https://storage.googleapis.com',
		destination: '.chromium',
	},
	firefox: {
		host: 'https://archive.mozilla.org/pub/firefox/nightly/latest-mozilla-central',
		destination: '.firefox',
	},
} as const;

type Platform = 'linux' | 'mac' | 'mac_arm' | 'win32' | 'win64';

function archiveName(
	product: Product,
	platform: Platform,
	revision: string
): string {
	switch (product) {
		case 'chrome':
			switch (platform) {
				case 'linux':
					return 'chrome-linux';
				case 'mac_arm':
				case 'mac':
					return 'chrome-mac';
				case 'win32':
				case 'win64':
					// Windows archive name changed at r591479.
					return parseInt(revision, 10) > 591479
						? 'Thorium_107.0.5271.0\\BIN'
						: 'chrome-win32';
				default:
					throw new Error('unknown browser');
			}

		case 'firefox':
			return platform;
		default:
			throw new Error('unknown browser');
	}
}

function _downloadURL(
	product: Product,
	platform: Platform,
	host: string,
	revision: string
): string {
	if (platform === 'win64' || platform === 'win32') {
		return 'https://remotionchromium-binaries.s3.eu-central-1.amazonaws.com/thorium-107.zip';
	}

	return util.format(
		downloadURLs[product][platform],
		host,
		revision,
		archiveName(product, platform, revision)
	);
}

function handleArm64(): void {
	let exists = fs.existsSync('/usr/bin/chromium-browser');
	if (exists) {
		return;
	}

	exists = fs.existsSync('/usr/bin/chromium');
	if (exists) {
		return;
	}

	console.error(
		'The chromium binary is not available for arm64.' +
			'\nIf you are on Ubuntu, you can install with: ' +
			'\n\n sudo apt install chromium\n' +
			'\n\n sudo apt install chromium-browser\n'
	);
	throw new Error();
}

const readdirAsync = promisify(fs.readdir.bind(fs));
const mkdirAsync = promisify(fs.mkdir.bind(fs));
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
	revision: string;
	product: string;
}

export const getPlatform = (product: Product): Platform => {
	const platform = os.platform();
	switch (platform) {
		case 'darwin':
			switch (product) {
				case 'chrome':
					return os.arch() === 'arm64' &&
						PUPPETEER_EXPERIMENTAL_CHROMIUM_MAC_ARM
						? 'mac_arm'
						: 'mac';
				case 'firefox':
					return 'mac';
				default:
					throw new Error('unknown browser');
			}

		case 'linux':
			return 'linux';
		case 'win32':
			return os.arch() === 'x64' ? 'win64' : 'win32';
		default:
			assert(false, 'Unsupported platform: ' + platform);
	}
};

export const getDownloadsFolder = (product: Product) => {
	return path.join(getDownloadsCacheDir(), browserConfig[product].destination);
};

export const getDownloadHost = (product: Product) => {
	return browserConfig[product].host;
};

export const download = async ({
	revision,
	progressCallback,
	product,
	platform,
	downloadHost,
	downloadsFolder,
}: {
	revision: string;
	progressCallback: (x: number, y: number) => void;
	product: Product;
	platform: Platform;
	downloadHost: string;
	downloadsFolder: string;
}): Promise<BrowserFetcherRevisionInfo | undefined> => {
	const url = _downloadURL(product, platform, downloadHost, revision);
	const fileName = url.split('/').pop();
	assert(fileName, `A malformed download URL was found: ${url}.`);
	const archivePath = path.join(downloadsFolder, fileName);
	const outputPath = getFolderPath(revision, downloadsFolder, platform);
	if (await existsAsync(outputPath)) {
		return getRevisionInfo(revision, product);
	}

	if (!(await existsAsync(downloadsFolder))) {
		await mkdirAsync(downloadsFolder, {
			recursive: true,
		});
	}

	// Use system Chromium builds on Linux ARM devices
	if (os.platform() !== 'darwin' && os.arch() === 'arm64') {
		handleArm64();
		return;
	}

	try {
		await _downloadFile(url, archivePath, progressCallback);
		await install(archivePath, outputPath);
	} finally {
		if (await existsAsync(archivePath)) {
			await unlinkAsync(archivePath);
		}
	}

	const revisionInfo = getRevisionInfo(revision, product);
	if (revisionInfo) {
		await chmodAsync(revisionInfo.executablePath, 0o755);
	}

	return revisionInfo;
};

export const localRevisions = async (
	downloadsFolder: string,
	product: Product,
	platform: Platform
): Promise<string[]> => {
	if (!(await existsAsync(downloadsFolder))) {
		return [];
	}

	const fileNames = await readdirAsync(downloadsFolder);
	return fileNames
		.map((fileName) => {
			return parseFolderPath(product, fileName);
		})
		.filter(
			(
				entry
			): entry is {product: string; platform: string; revision: string} => {
				return (entry && entry.platform === platform) ?? false;
			}
		)
		.map((entry) => {
			return entry.revision;
		});
};

export const removeBrowser = async (
	revision: string,
	folderPath: string
): Promise<void> => {
	assert(
		await existsAsync(folderPath),
		`Failed to remove: revision ${revision} is not downloaded`
	);
	deleteDirectory(folderPath);
};

export const getFolderPath = (
	revision: string,
	downloadsFolder: string,
	platform: Platform
): string => {
	return path.resolve(downloadsFolder, `${platform}-${revision}`);
};

const getExecutablePath = (product: Product, revision: string) => {
	const downloadsFolder = getDownloadsFolder(product);
	const platform = getPlatform(product);
	const folderPath = getFolderPath(revision, downloadsFolder, platform);

	if (product === 'chrome') {
		if (platform === 'mac' || platform === 'mac_arm') {
			return path.join(
				folderPath,
				archiveName(product, platform, revision),
				'Chromium.app',
				'Contents',
				'MacOS',
				'Chromium'
			);
		}

		if (platform === 'linux') {
			return path.join(
				folderPath,
				archiveName(product, platform, revision),
				'chrome'
			);
		}

		if (platform === 'win32' || platform === 'win64') {
			return path.join(
				folderPath,
				archiveName(product, platform, revision),
				'thorium.exe'
			);
		}

		throw new Error('Unsupported platform: ' + platform);
	}

	if (product === 'firefox') {
		if (platform === 'mac' || platform === 'mac_arm') {
			return path.join(
				folderPath,
				'Firefox Nightly.app',
				'Contents',
				'MacOS',
				'firefox'
			);
		}

		if (platform === 'linux') {
			return path.join(folderPath, 'firefox', 'firefox');
		}

		if (platform === 'win32' || platform === 'win64') {
			return path.join(folderPath, 'firefox', 'firefox.exe');
		}

		throw new Error('Unsupported platform: ' + platform);
	}

	throw new Error('Unsupported product: ' + product);
};

export const getRevisionInfo = (
	revision: string,
	product: Product
): BrowserFetcherRevisionInfo => {
	const executablePath = getExecutablePath(product, revision);
	const downloadsFolder = getDownloadsFolder(product);
	const platform = getPlatform(product);
	const folderPath = getFolderPath(revision, downloadsFolder, platform);

	const url = _downloadURL(
		product,
		platform,
		getDownloadHost(product),
		revision
	);
	const local = fs.existsSync(folderPath);
	return {
		revision,
		executablePath,
		folderPath,
		local,
		url,
		product,
	};
};

function parseFolderPath(
	product: Product,
	folderPath: string
): {product: string; platform: string; revision: string} | undefined {
	const name = path.basename(folderPath);
	const splits = name.split('-');
	if (splits.length !== 2) {
		return;
	}

	const [platform, revision] = splits;
	if (!revision || !platform || !(platform in downloadURLs[product])) {
		return;
	}

	return {product, platform, revision};
}

function _downloadFile(
	url: string,
	destinationPath: string,
	progressCallback: (x: number, y: number) => void
): Promise<number> {
	let fulfill: (value: number | PromiseLike<number>) => void;
	let reject: (err: Error) => void;
	const promise = new Promise<number>((x, y) => {
		fulfill = x;
		reject = y;
	});

	let downloadedBytes = 0;
	let totalBytes = 0;

	let lastProgress = Date.now();

	function onData(chunk: string): void {
		downloadedBytes += chunk.length;
		if (Date.now() - lastProgress > 1000) {
			progressCallback(downloadedBytes, totalBytes);
			lastProgress = Date.now();
		}
	}

	const request = httpRequest(url, 'GET', (response) => {
		if (response.statusCode !== 200) {
			const error = new Error(
				`Download failed: server returned code ${response.statusCode}. URL: ${url}`
			);
			// consume response data to free up memory
			response.resume();
			reject(error);
			return;
		}

		const file = fs.createWriteStream(destinationPath);
		file.on('close', () => {
			return fulfill(totalBytes);
		});
		file.on('error', (error) => {
			return reject(error);
		});
		response.pipe(file);
		totalBytes = parseInt(response.headers['content-length'] as string, 10);
		response.on('data', onData);
	});
	request.on('error', (error) => {
		return reject(error);
	});
	return promise;
}

function install(archivePath: string, folderPath: string): Promise<unknown> {
	if (archivePath.endsWith('.zip')) {
		return extractZip(archivePath, {dir: folderPath});
	}

	if (archivePath.endsWith('.tar.bz2')) {
		throw new Error('bz2 currently not implemented');
	}

	if (archivePath.endsWith('.dmg')) {
		return mkdirAsync(folderPath).then(() => {
			return _installDMG(archivePath, folderPath);
		});
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

function httpRequest(
	url: string,
	method: string,
	response: (x: http.IncomingMessage) => void,
	keepAlive = true
): http.ClientRequest {
	const urlParsed = URL.parse(url);

	type Options = Partial<URL.UrlWithStringQuery> & {
		method?: string;
		rejectUnauthorized?: boolean;
		headers?: http.OutgoingHttpHeaders | undefined;
	};

	const options: Options = {
		...urlParsed,
		method,
		headers: keepAlive
			? {
					Connection: 'keep-alive',
			  }
			: undefined,
	};

	const requestCallback = (res: http.IncomingMessage): void => {
		if (
			res.statusCode &&
			res.statusCode >= 300 &&
			res.statusCode < 400 &&
			res.headers.location
		) {
			httpRequest(res.headers.location, method, response);
		} else {
			response(res);
		}
	};

	const request =
		options.protocol === 'https:'
			? https.request(options, requestCallback)
			: http.request(options, requestCallback);
	request.end();
	return request;
}
