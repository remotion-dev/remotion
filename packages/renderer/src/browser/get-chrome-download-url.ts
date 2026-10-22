import * as fs from 'node:fs';
import * as os from 'node:os';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import type {ChromeMode} from '../options/chrome-mode';

export const TESTED_VERSION = '157.0.8080.0';

export type Platform =
	| 'linux64'
	| 'linux-arm64'
	| 'mac-x64'
	| 'mac-arm64'
	| 'win64';

export const isAmazonLinux2023 = (): boolean => {
	if (os.platform() !== 'linux') {
		return false;
	}

	try {
		const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
		return (
			osRelease.includes('Amazon Linux') && osRelease.includes('VERSION="2023"')
		);
	} catch {
		return false;
	}
};

// remotion.media binaries are built on Ubuntu 24.04 which requires glibc 2.35+
const MINIMUM_GLIBC_FOR_REMOTION_MEDIA = [2, 35] as const;

const getGlibcVersion = (): [number, number] | null => {
	if (process.platform !== 'linux') {
		return null;
	}

	const {report} = process;
	if (!report) {
		return null;
	}

	const rep = report.getReport();
	if (typeof rep === 'string') {
		return null;
	}

	// @ts-expect-error no types
	const {glibcVersionRuntime} = rep.header;
	if (!glibcVersionRuntime) {
		return null;
	}

	const split = (glibcVersionRuntime as string).split('.');
	if (split.length !== 2) {
		return null;
	}

	return [Number(split[0]), Number(split[1])];
};

const isGlibcVersionAtLeast = (
	required: readonly [number, number],
): boolean => {
	const version = getGlibcVersion();
	if (version === null) {
		// If we can't detect, assume it's not compatible to be safe
		return false;
	}

	const [major, minor] = version;
	const [reqMajor, reqMinor] = required;

	if (major > reqMajor) {
		return true;
	}

	if (major === reqMajor && minor >= reqMinor) {
		return true;
	}

	return false;
};

export const canUseRemotionMediaBinaries = (): boolean => {
	if (process.platform !== 'linux') {
		// remotion.media binaries are only for Linux
		return false;
	}

	return isGlibcVersionAtLeast(MINIMUM_GLIBC_FOR_REMOTION_MEDIA);
};

export function getChromeDownloadUrl({
	platform,
	version,
	chromeMode,
}: {
	platform: Platform;
	version: string | null;
	chromeMode: ChromeMode;
}): string {
	// Preserve explicit Playwright revision overrides on Linux ARM64. Default
	// downloads and Chrome version overrides use Google's CDN on every platform.
	if (platform === 'linux-arm64' && version && /^\d+$/.test(version)) {
		const archive =
			chromeMode === 'chrome-for-testing'
				? 'chromium-linux-arm64'
				: 'chromium-headless-shell-linux-arm64';
		return `https://playwright.azureedge.net/builds/chromium/${version}/${archive}.zip`;
	}

	if (chromeMode === 'headless-shell' && version === null) {
		if (platform === 'mac-arm64') {
			return `https://remotion.media/chromium-headless-shell-mac-arm64-${TESTED_VERSION}.zip?clear`;
		}

		if (platform === 'linux64' || platform === 'linux-arm64') {
			const architecture = platform === 'linux64' ? 'x64' : 'arm64';
			if (isAmazonLinux2023()) {
				return `https://remotion.media/chromium-headless-shell-amazon-linux-${architecture}-${TESTED_VERSION}.zip?clear`;
			}

			if (canUseRemotionMediaBinaries()) {
				return `https://remotion.media/chromium-headless-shell-linux-${architecture}-${TESTED_VERSION}.zip?clear`;
			}
		}
	}

	const archive =
		chromeMode === 'headless-shell' ? 'chrome-headless-shell' : 'chrome';
	return `https://storage.googleapis.com/chrome-for-testing-public/${
		version ?? TESTED_VERSION
	}/${platform}/${archive}-${platform}.zip`;
}

export const logDownloadUrl = ({
	url,
	logLevel,
	indent,
}: {
	url: string;
	logLevel: LogLevel;
	indent: boolean;
}): void => {
	Log.info({indent, logLevel}, `Downloading from: ${url}`);
};
