import type {AnyRemotionOption} from './option';

export type DownloadBrowserProgressFn = (progress: {
	percent: number;
	downloaded: number;
	totalSize: number;
}) => void;

export type OnBrowserDownload = () => {
	onProgress: DownloadBrowserProgressFn;
	version: string | null;
};

const cliFlag = 'on-browser-download' as const;

export const onBrowserDownloadOption = {
	name: 'Browser download callback function',
	cliFlag,
	description: () => (
		// TODO: Add a documentation function
		<>
			Gets called when no compatible local browser is detected on the system and
			this API needs to download a browser. Return another function to receive
			download progress.
		</>
	),
	ssrName: 'onBrowserDownload' as const,
	// TODO: Make sure the URL is correct
	docLink: 'https://www.remotion.dev/docs/renderer/ensure-local-browser',
	type: undefined as unknown as OnBrowserDownload,
	getValue: () => {
		throw new Error('does not support config file');
	},
	setConfig: () => {
		throw new Error('does not support config file');
	},
} satisfies AnyRemotionOption<OnBrowserDownload>;
