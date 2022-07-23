import {bundle, BundlerInternals} from '@remotion/bundler';
import {ConfigInternals} from '@remotion/config';
import {Log} from './log';
import {quietFlagProvided} from './parse-command-line';
import {
	createOverwriteableCliOutput,
	makeBundlingProgress,
} from './progress-bar';
import type {RenderStep} from './step';

export const bundleOnCli = async ({
	fullPath,
	steps,
}: {
	fullPath: string;
	steps: RenderStep[];
}) => {
	const shouldCache = ConfigInternals.getWebpackCaching();

	const onProgress = (progress: number) => {
		bundlingProgress.update(
			makeBundlingProgress({
				progress: progress / 100,
				steps,
				doneIn: null,
			})
		);
	};

	const options = {
		enableCaching: shouldCache,
		webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
	};

	const [hash] = BundlerInternals.getConfig('', fullPath, onProgress, options);

	const cacheExistedBefore = BundlerInternals.cacheExists('production', hash);
	if (cacheExistedBefore !== 'does-not-exist' && !shouldCache) {
		Log.info('🧹 Cache disabled but found. Deleting... ');
		await BundlerInternals.clearCache();
	}

	if (cacheExistedBefore === 'other-exists' && shouldCache) {
		Log.info('🧹 Webpack config change detected. Clearing cache... ');
		await BundlerInternals.clearCache();
	}

	const bundleStartTime = Date.now();
	const bundlingProgress = createOverwriteableCliOutput(quietFlagProvided());

	const bundled = await bundle(
		fullPath,
		(progress) => {
			bundlingProgress.update(
				makeBundlingProgress({
					progress: progress / 100,
					steps,
					doneIn: null,
				})
			);
		},
		options
	);
	bundlingProgress.update(
		makeBundlingProgress({
			progress: 1,
			steps,
			doneIn: Date.now() - bundleStartTime,
		}) + '\n'
	);
	Log.verbose('Bundled under', bundled);
	const cacheExistedAfter =
		BundlerInternals.cacheExists('production', hash) === 'exists';

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
