import type {LegacyBundleOptions} from '@remotion/bundler';
import {bundle, BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
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

export const bundleOnCliOrTakeServeUrl = async ({
	fullPath,
	remotionRoot,
	publicDir,
	onProgress,
	indentOutput,
	logLevel,
	bundlingStep,
	steps,
}: {
	fullPath: string;
	remotionRoot: string;
	publicDir: string | null;
	onProgress: (params: {
		bundling: BundlingState;
		copying: CopyingState;
	}) => void;
	indentOutput: boolean;
	logLevel: LogLevel;
	bundlingStep: number;
	steps: number;
}): Promise<{
	urlOrBundle: string;
	cleanup: () => void;
}> => {
	if (RenderInternals.isServeUrl(fullPath)) {
		return {
			urlOrBundle: fullPath,
			cleanup: () => Promise.resolve(undefined),
		};
	}

	const bundled = await bundleOnCli({
		fullPath,
		remotionRoot,
		publicDir,
		onProgressCallback: onProgress,
		indent: indentOutput,
		logLevel,
		bundlingStep,
		steps,
	});

	return {
		urlOrBundle: bundled,
		cleanup: () => RenderInternals.deleteDirectory(bundled),
	};
};

export const bundleOnCli = async ({
	fullPath,
	remotionRoot,
	publicDir,
	onProgressCallback,
	indent,
	logLevel,
	bundlingStep,
	steps,
}: {
	fullPath: string;
	remotionRoot: string;
	publicDir: string | null;
	onProgressCallback: (params: {
		bundling: BundlingState;
		copying: CopyingState;
	}) => void;
	indent: boolean;
	logLevel: LogLevel;
	bundlingStep: number;
	steps: number;
}) => {
	const shouldCache = ConfigInternals.getWebpackCaching();

	const symlinkState: SymbolicLinksState = {
		symlinks: [],
	};

	const onProgress = (progress: number) => {
		bundlingState = {
			progress: progress / 100,
			doneIn: null,
		};
		updateProgress(false);
	};

	let copyingState: CopyingState = {
		bytes: 0,
		doneIn: null,
	};

	let copyStart: number | null = null;

	const updateProgress = (newline: boolean) => {
		bundlingProgress.update(
			makeBundlingAndCopyProgress(
				{
					bundling: bundlingState,
					copying: copyingState,
					symLinks: symlinkState,
				},
				indent,
				bundlingStep,
				steps
			) + (newline ? '\n' : '')
		);
		onProgressCallback({
			bundling: bundlingState,
			copying: copyingState,
		});
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
		Log.infoAdvanced(
			{indent, logLevel},
			'🧹 Cache disabled but found. Deleting... '
		);
		await BundlerInternals.clearCache(remotionRoot);
	}

	if (cacheExistedBefore === 'other-exists' && shouldCache) {
		Log.infoAdvanced(
			{indent, logLevel},
			'🧹 Webpack config change detected. Clearing cache... '
		);
		await BundlerInternals.clearCache(remotionRoot);
	}

	const bundleStartTime = Date.now();
	const bundlingProgress = createOverwriteableCliOutput({
		quiet: quietFlagProvided(),
		cancelSignal: null,
	});

	let bundlingState: BundlingState = {
		progress: 0,
		doneIn: null,
	};

	const bundled = await bundle({
		entryPoint: fullPath,
		onProgress: (progress) => {
			bundlingState = {
				progress: progress / 100,
				doneIn: null,
			};
			updateProgress(false);
		},
		...options,
	});

	bundlingState = {
		progress: 1,
		doneIn: Date.now() - bundleStartTime,
	};
	copyingState = {
		...copyingState,
		doneIn: copyStart ? Date.now() - copyStart : null,
	};
	updateProgress(true);

	Log.verboseAdvanced({indent, logLevel}, 'Bundled under', bundled);
	const cacheExistedAfter =
		BundlerInternals.cacheExists(remotionRoot, 'production', hash) === 'exists';

	if (cacheExistedAfter) {
		if (
			cacheExistedBefore === 'does-not-exist' ||
			cacheExistedBefore === 'other-exists'
		) {
			Log.infoAdvanced(
				{indent, logLevel},
				'⚡️ Cached bundle. Subsequent renders will be faster.'
			);
		}
	}

	return bundled;
};
