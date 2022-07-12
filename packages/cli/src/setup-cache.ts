import {bundle, BundlerInternals} from '@remotion/bundler';
import {Internals} from 'remotion';
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
	const shouldCache = Internals.getWebpackCaching();
	const cacheExistedBefore = BundlerInternals.cacheExists('production');
	if (cacheExistedBefore && !shouldCache) {
		Log.info('🧹 Cache disabled but found. Deleting... ');
		await BundlerInternals.clearCache('production');
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
		{
			enableCaching: shouldCache,
			webpackOverride:
				Internals.getWebpackOverrideFn() ?? Internals.defaultOverrideFunction,
		}
	);
	bundlingProgress.update(
		makeBundlingProgress({
			progress: 1,
			steps,
			doneIn: Date.now() - bundleStartTime,
		}) + '\n'
	);
	Log.verbose('Bundled under', bundled);
	const cacheExistedAfter = BundlerInternals.cacheExists('production');
	if (cacheExistedAfter && !cacheExistedBefore) {
		Log.info('⚡️ Cached bundle. Subsequent renders will be faster.');
	}

	return bundled;
};
