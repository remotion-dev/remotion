import type {BrowserBundle} from '@remotion/browser-bundler';

export type BrowserBundlerPreview = {
	applyBundle: (bundle: BrowserBundle) => Promise<void>;
	dispose: () => void;
};

export type CreateBrowserBundlerPreview = (options: {
	onError: (message: string) => void;
}) => BrowserBundlerPreview;

declare global {
	interface Window {
		remotionBrowserBundlerPreview: Promise<CreateBrowserBundlerPreview> | null;
	}
}
