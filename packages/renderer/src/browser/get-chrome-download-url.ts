import * as fs from 'node:fs';
import * as os from 'node:os';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import type {ChromeMode} from '../options/chrome-mode';

export const TESTED_VERSION = '144.0.7559.20';
// https://github.com/microsoft/playwright/blame/e76ca6cba40c26bf22c19cf37398d2b9da9ed465/packages/playwright-core/browsers.json
// packages/playwright-core/browsers.json
const PLAYWRIGHT_VERSION = '1207'; // 144.0.7559.20

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
	if (platform === 'linux-arm64') {
		// Amazon Linux 2023 on arm64 needs a special build.
		// This binary is compatible with older glibc (no 2.35 requirement).
		if (isAmazonLinux2023() && chromeMode === 'headless-shell' && !version) {
			return 'https://remotion.media/chromium-headless-shell-amazon-linux-arm64-144.0.7559.20.zip';
		}

		if (chromeMode === 'chrome-for-testing') {
			return `https://playwright.azureedge.net/builds/chromium/${version ?? PLAYWRIGHT_VERSION}/chromium-linux-arm64.zip`;
		}

		if (version) {
			return `https://playwright.azureedge.net/builds/chromium/${version}/chromium-headless-shell-linux-arm64.zip`;
		}

		// Regular arm64 binary requires glibc 2.35+
		if (canUseRemotionMediaBinaries()) {
			return `https://remotion.media/chromium-headless-shell-linux-arm64-${TESTED_VERSION}.zip?clearcache`;
		}

		// Fall back to Playwright for older glibc (non-Amazon Linux systems)
		return `https://playwright.azureedge.net/builds/chromium/${PLAYWRIGHT_VERSION}/chromium-headless-shell-linux-arm64.zip`;
	}

	if (chromeMode === 'headless-shell') {
		// Amazon Linux 2023 needs a special build.
		// This binary is compatible with older glibc (no 2.35 requirement).
		if (isAmazonLinux2023() && platform === 'linux64' && !version) {
			return `https://remotion.media/chromium-headless-shell-amazon-linux-x64-144.0.7559.20.zip`;
		}

		if (platform === 'linux64' && version === null) {
			if (canUseRemotionMediaBinaries()) {
				return `https://remotion.media/chromium-headless-shell-linux-x64-${TESTED_VERSION}.zip?clearcache`;
			}

			// Fall back to Google's CDN for older glibc
			return `https://storage.googleapis.com/chrome-for-testing-public/${TESTED_VERSION}/${platform}/chrome-headless-shell-${platform}.zip`;
		}

		return `https://storage.googleapis.com/chrome-for-testing-public/${
			version ?? TESTED_VERSION
		}/${platform}/chrome-headless-shell-${platform}.zip`;
	}

	return `https://storage.googleapis.com/chrome-for-testing-public/${
		version ?? TESTED_VERSION
	}/${platform}/chrome-${platform}.zip`;
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
