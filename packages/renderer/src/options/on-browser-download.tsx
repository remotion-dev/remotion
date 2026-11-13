import type {ChromeMode} from './chrome-mode';
import type {AnyRemotionOption} from './option';

export type DownloadBrowserProgressFn = (progress: {
	alreadyAvailable: boolean;
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
	addedIn: '4.0.137',
	cliFlag,
	description: () => (
		<>
			Gets called to determine which Chrome version to use. Return a{' '}
			<code>version</code> to pin one, and an <code>onProgress</code> callback
			that gets called if that version needs to be downloaded.{' '}
			<a href="/docs/renderer/ensure-browser#onbrowserdownload">
				See here for how to use this option.
			</a>
		</>
	),
	ssrName: 'onBrowserDownload' as const,
	docLink: 'https://www.remotion.dev/docs/options/on-browser-download',
	type: undefined as unknown as OnBrowserDownload,
	getValue: () => {
		throw new Error('does not support config file');
	},
	setConfig: () => {
		throw new Error('does not support config file');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<OnBrowserDownload>;
