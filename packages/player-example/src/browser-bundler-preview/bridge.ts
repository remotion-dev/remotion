import type {BrowserBundle} from '@remotion/browser-bundler';
import type {SequenceNodePath} from 'remotion';

export type BrowserBundlerPreviewNode = {
	readonly filePath: string;
	readonly nodePath: SequenceNodePath;
};

export type BrowserBundlerPreview = {
	applyBundle: (
		bundle: BrowserBundle,
		sourceNodes: BrowserBundlerPreviewNode[],
	) => Promise<void>;
	dispose: () => void;
};

export type CreateBrowserBundlerPreview = (options: {
	onDeleteJsxNodes: (nodes: BrowserBundlerPreviewNode[]) => Promise<void>;
	onError: (message: string) => void;
}) => BrowserBundlerPreview;

declare global {
	interface Window {
		remotionBrowserBundlerPreview: Promise<CreateBrowserBundlerPreview> | null;
	}
}
