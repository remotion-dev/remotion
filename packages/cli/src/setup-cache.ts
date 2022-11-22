import type {LegacyBundleOptions} from '@remotion/bundler';
import {bundle, BundlerInternals} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {Log} from './log';
import {quietFlagProvided} from './parse-command-line';
import type {
	BundlingState,
	CopyingState,
	SymbolicLinksState,
} from './progress-bar';
import {
	createOverwriteableCliOutput,
	makeBundlingAndCopyProgress,
} from './progress-bar';
import type {RenderStep} from './step';

export const bundleOnCliOrTakeServeUrl = async ({
	fullPath,
	remotionRoot,
	steps,
	publicDir,
}: {
	fullPath: string;
	remotionRoot: string;
	steps: RenderStep[];
	publicDir: string | null;
}): Promise<{
	urlOrBundle: string;
	cleanup: () => Promise<void>;
}> => {
	if (RenderInternals.isServeUrl(fullPath)) {
		return {
			urlOrBundle: fullPath,
			cleanup: () => Promise.resolve(undefined),
		};
	}

	const bundled = await bundleOnCli({fullPath, remotionRoot, steps, publicDir});

	return {
		urlOrBundle: bundled,
		cleanup: () => RenderInternals.deleteDirectory(bundled),
	};
};

export const bundleOnCli = async ({
	fullPath,
	steps,
	remotionRoot,
	publicDir,
}: {
	fullPath: string;
	steps: RenderStep[];
	remotionRoot: string;
	publicDir: string | null;
}) => {
	const shouldCache = ConfigInternals.getWebpackCaching();

	const symlinkState: SymbolicLinksState = {
		symlinks: [],
	};

	const onProgress = (progress: number) => {
		bundlingState = {
			progress: progress / 100,
			steps,
			doneIn: null,
		};
		bundlingProgress.update(
			makeBundlingAndCopyProgress({
				bundling: bundlingState,
				copying: copyingState,
				symLinks: symlinkState,
			})
		);
	};

	let copyingState: CopyingState = {
		bytes: 0,
		doneIn: null,
	};

	let copyStart: number | null = null;

	const updateProgress = (newline: boolean) => {
		bundlingProgress.update(
			makeBundlingAndCopyProgress({
				bundling: bundlingState,
				copying: copyingState,
				symLinks: symlinkState,
			}) + (newline ? '\n' : '')
		);
	};

	const onPublicDirCopyProgress = (bytes: number) => {
		if (copyStart === null) {
			copyStart = Date.now();
		}

		copyingState = {
			bytes,
			doneIn: null,
		};
		updateProgress(false);
	};

	const onSymlinkDetected = (absPath: string) => {
		symlinkState.symlinks.push(absPath);
		updateProgress(false);
	};

	const options: LegacyBundleOptions = {
		enableCaching: shouldCache,
		webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
		rootDir: remotionRoot,
		publicDir,
		onPublicDirCopyProgress,
		onSymlinkDetected,
	};

	const [hash] = BundlerInternals.getConfig({
		outDir: '',
		entryPoint: fullPath,
		onProgress,
		options,
		resolvedRemotionRoot: remotionRoot,
	});

	const cacheExistedBefore = BundlerInternals.cacheExists(
		remotionRoot,
		'production',
		hash
	);
	if (cacheExistedBefore !== 'does-not-exist' && !shouldCache) {
		Log.info('🧹 Cache disabled but found. Deleting... ');
		await BundlerInternals.clearCache(remotionRoot);
	}

	if (cacheExistedBefore === 'other-exists' && shouldCache) {
		Log.info('🧹 Webpack config change detected. Clearing cache... ');
		await BundlerInternals.clearCache(remotionRoot);
	}

	const bundleStartTime = Date.now();
	const bundlingProgress = createOverwriteableCliOutput(quietFlagProvided());

	let bundlingState: BundlingState = {
		progress: 0,
		steps,
		doneIn: null,
	};

	const bundled = await bundle({
		entryPoint: fullPath,
		onProgress: (progress) => {
			bundlingState = {
				progress: progress / 100,
				steps,
				doneIn: null,
			};
			updateProgress(false);
		},
		...options,
	});

	bundlingState = {
		progress: 1,
		steps,
		doneIn: Date.now() - bundleStartTime,
	};
	copyingState = {
		...copyingState,
		doneIn: copyStart ? Date.now() - copyStart : null,
	};
	updateProgress(true);

	Log.verbose('Bundled under', bundled);
	const cacheExistedAfter =
		BundlerInternals.cacheExists(remotionRoot, 'production', hash) === 'exists';

	if (cacheExistedAfter) {
		if (
			cacheExistedBefore === 'does-not-exist' ||
			cacheExistedBefore === 'other-exists'
		) {
			Log.info('⚡️ Cached bundle. Subsequent renders will be faster.');
		}
	}

	return bundled;
};
