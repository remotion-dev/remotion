import {isHtmlInCanvasAvailable} from './recorder';

export const minimumChromeVersion = '157.0.8080.0';
export const canvasSetupUrl = 'chrome://flags/#canvas-draw-element';

export type BrowserRequirementIssue =
	| 'browser-version'
	| 'html-in-canvas-unavailable';

type NavigatorWithClientHints = Navigator & {
	readonly userAgentData:
		| {
				readonly getHighEntropyValues: (hints: string[]) => Promise<{
					readonly fullVersionList:
						| readonly {readonly brand: string; readonly version: string}[]
						| undefined;
				}>;
		  }
		| undefined;
};

export const getBrowserRequirementIssue =
	async (): Promise<BrowserRequirementIssue | null> => {
		let version =
			navigator.userAgent.match(/(?:Chrome|Chromium)\/([\d.]+)/)?.[1] ?? null;
		// Reduced user agents expose only the major version (for example 157.0.0.0).
		let hasFullVersion =
			version !== null &&
			/^\d+\.\d+\.\d+\.\d+$/.test(version) &&
			!/^\d+\.0\.0\.0$/.test(version);
		try {
			const hints = await (
				navigator as NavigatorWithClientHints
			).userAgentData?.getHighEntropyValues(['fullVersionList']);
			const chromium = hints?.fullVersionList?.find(
				(entry) => entry.brand === 'Chromium',
			);
			const chrome = hints?.fullVersionList?.find(
				(entry) => entry.brand === 'Google Chrome',
			);
			const fullVersion = chrome?.version ?? chromium?.version;
			if (fullVersion && /^\d+\.\d+\.\d+\.\d+$/.test(fullVersion)) {
				version = fullVersion;
				hasFullVersion = true;
			}
		} catch {
			// Client hints can be withheld. Check the known major and the APIs below.
		}

		if (version !== null) {
			const actual = version.split('.').map(Number);
			const minimum = minimumChromeVersion.split('.').map(Number);
			for (let index = 0; index < (hasFullVersion ? 4 : 1); index++) {
				const difference = (actual[index] ?? 0) - (minimum[index] ?? 0);
				if (difference < 0) {
					return 'browser-version';
				}

				if (difference > 0) {
					break;
				}
			}
		}

		return isHtmlInCanvasAvailable() ? null : 'html-in-canvas-unavailable';
	};
