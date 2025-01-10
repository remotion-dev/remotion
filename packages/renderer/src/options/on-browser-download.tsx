import type {ChromeMode} from './chrome-mode';
import type {AnyRemotionOption} from './option';

export type DownloadBrowserProgressFn = (progress: {
	percent: number;
	downloadedBytes: number;
	totalSizeInBytes: number;
}) => void;

export type OnBrowserDownload = (options: {chromeMode: ChromeMode}) => {
	onProgress: DownloadBrowserProgressFn;
	version: string | null;
};

const cliFlag = 'on-browser-download' as const;

export const onBrowserDownloadOption = {
	name: 'Browser download callback function',
	cliFlag,
	description: () => (
		<>
			Gets called when no compatible local browser is detected on the system and
			this API needs to download a browser. Return a callback to observe
			progress.{' '}
			<a href="/docs/renderer/ensure-browser#onbrowserdownload">
				See here for how to use this option.
			</a>
		</>
	),
	ssrName: 'onBrowserDownload' as const,
	docLink: 'https://www.remotion.dev/docs/renderer/ensure-browser',
	type: undefined as unknown as OnBrowserDownload,
	getValue: () => {
		throw new Error('does not support config file');
	},
	setConfig: () => {
		throw new Error('does not support config file');
	},
} satisfies AnyRemotionOption<OnBrowserDownload>;
