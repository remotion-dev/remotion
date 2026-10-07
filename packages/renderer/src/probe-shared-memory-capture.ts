import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {getLocalBrowserExecutable} from './get-local-browser-executable';
import type {LogLevel} from './log-level';
import type {ChromiumOptions} from './open-browser';
import {openBrowser} from './open-browser';
import type {ChromeMode} from './options/chrome-mode';
import {probeRemotionSharedMemoryFfmpegSupport} from './prespawn-ffmpeg';
import {
	getPreferredRemotionSharedMemoryBackend,
	RemotionSharedMemoryCapture,
} from './remotion-shared-memory';

const probes = new Map<string, Promise<boolean>>();

export const probeSharedMemoryCapture = async ({
	browserExecutable,
	chromeMode,
	chromiumOptions,
	binariesDirectory,
	logLevel,
}: {
	browserExecutable: string | null;
	chromeMode: ChromeMode;
	chromiumOptions: ChromiumOptions;
	binariesDirectory: string | null;
	logLevel: LogLevel;
}): Promise<boolean> => {
	// Opening the render modal should not download a browser.
	let executablePath: string;
	let executableStat: fs.Stats;
	try {
		executablePath = getLocalBrowserExecutable({
			preferredBrowserExecutable: browserExecutable,
			chromeMode,
			indent: false,
			logLevel,
		});
		executableStat = fs.statSync(executablePath);
	} catch {
		return false;
	}

	const key = JSON.stringify({
		executablePath,
		mtime: executableStat.mtimeMs,
		ctime: executableStat.ctimeMs,
		size: executableStat.size,
		chromeMode,
		chromiumOptions,
		binariesDirectory,
		backend: getPreferredRemotionSharedMemoryBackend(),
	});
	const cached = probes.get(key);
	if (cached) {
		return cached;
	}

	const probe = (async () => {
		const support = await probeRemotionSharedMemoryFfmpegSupport({
			binariesDirectory,
			indent: false,
			logLevel,
		});
		if (!support.sharedMemory) {
			return false;
		}

		const browser = await openBrowser('chrome', {
			browserExecutable: executablePath,
			chromeMode,
			chromiumOptions: {...chromiumOptions, headless: true},
			forceDeviceScaleFactor: 1,
			logLevel,
		});
		let backingDirectory: string | null = null;
		let capture: RemotionSharedMemoryCapture | null = null;
		try {
			backingDirectory = support.filePools
				? fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-shm-probe-'))
				: null;
			capture = new RemotionSharedMemoryCapture({
				width: 16,
				height: 16,
				indent: false,
				logLevel,
				backingDirectory,
			});
			const page = await browser.newPage({
				context: () => null,
				logLevel,
				indent: false,
				pageIndex: 0,
				onBrowserLog: null,
				onLog: () => undefined,
			});
			await capture.initializePages([page]);
			return capture.isSupported();
		} finally {
			try {
				await capture?.dispose();
			} finally {
				try {
					await browser.close({silent: true});
				} finally {
					if (backingDirectory !== null) {
						fs.rmSync(backingDirectory, {recursive: true, force: true});
					}
				}
			}
		}
	})();
	probes.set(key, probe);
	try {
		return await probe;
	} catch {
		// Keep the screenshot controls if probing fails, and retry next time.
		probes.delete(key);
		return false;
	}
};
