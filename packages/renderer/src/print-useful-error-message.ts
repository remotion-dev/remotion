import type {LogLevel} from './log-level';
import {Log} from './logger';
import {truthy} from './truthy';

let alreadyPrintedCache: string[] = [];

export const printUsefulErrorMessage = (
	err: Error,
	logLevel: LogLevel,
	indent: boolean,
) => {
	const errorStack = (err as Error).stack;
	if (errorStack && alreadyPrintedCache.includes(errorStack)) {
		return;
	}

	if (errorStack) {
		alreadyPrintedCache.push(errorStack);
		alreadyPrintedCache = alreadyPrintedCache.slice(-10);
	}

	if (err.message.includes('Could not play video with')) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 Get help for this issue at https://remotion.dev/docs/media-playback-error',
		);
	}

	if (
		err.message.includes('A delayRender()') &&
		err.message.includes('was called but not cleared after')
	) {
		Log.info({indent, logLevel});
		if (err.message.includes('/proxy')) {
			Log.info(
				{indent, logLevel},
				'💡 Get help for this issue at https://remotion.dev/docs/troubleshooting/delay-render-proxy',
			);
		}

		Log.info(
			{indent, logLevel},
			'💡 Get help for this issue at https://remotion.dev/docs/timeout',
		);
	}

	if (err.message.includes('Target closed')) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 Get help for this issue at https://remotion.dev/docs/target-closed',
		);
	}

	if (err.message.includes('Timed out evaluating')) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 Get help for this issue at https://remotion.dev/docs/troubleshooting/timed-out-page-function',
		);
	}

	if (err.message.includes('ENAMETOOLONG')) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 Get help for this issue at https://remotion.dev/docs/enametoolong',
		);
	}

	if (
		err.message.includes('Member must have value less than or equal to 3008')
	) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 This error indicates that you have a AWS account on the free tier or have been limited by your organization. Often times this can be solved by adding a credit card. See also: https://repost.aws/questions/QUKruWYNDYTSmP17jCnIz6IQ/questions/QUKruWYNDYTSmP17jCnIz6IQ/unable-to-set-lambda-memory-over-3008mb',
		);
	}

	if (err.stack?.includes('TooManyRequestsException: Rate Exceeded.')) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 This error indicates that your Lambda concurrency limit is too low. See: https://www.remotion.dev/docs/lambda/troubleshooting/rate-limit',
		);
	}

	if (err.message.includes('Error creating WebGL context')) {
		Log.info({indent, logLevel});
		Log.warn(
			{
				indent,
				logLevel,
			},
			'💡 You might need to set the OpenGL renderer to "angle-egl", "angle" (or "swangle" if rendering on lambda). Learn why at https://www.remotion.dev/docs/three',
		);
		Log.warn(
			{
				indent,
				logLevel,
			},
			"💡 Check how it's done at https://www.remotion.dev/docs/chromium-flags#--gl",
		);
	}

	if (err.message.includes('The bucket does not allow ACLs')) {
		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'💡 Fix for this issue: https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl',
		);
	}

	if (err.message.includes('Minified React error #306')) {
		const componentName = err.message.match(/<\w+>/)?.[0];
		Log.info(
			{indent, logLevel},
			[
				'💡 This error indicates that the component',
				componentName ? `(${componentName})` : null,
				'you are trying to render is not imported correctly.',
			]
				.filter(truthy)
				.join(' '),
		);

		Log.info({indent, logLevel});
		Log.info(
			{indent, logLevel},
			'   Check the root file and ensure that the component is not undefined.',
		);
		Log.info(
			{indent, logLevel},
			'   Oftentimes, this happens if the component is missing the `export` keyword',
		);
		Log.info(
			{indent, logLevel},
			'   or if the component was renamed and the import statement not properly adjusted.',
		);
	}

	if (err.message.includes('GLIBC_')) {
		Log.info({indent, logLevel}, '💡 Remotion requires at least Libc 2.35.');
		Log.info(
			{indent, logLevel},
			'💡 Get help for this issue: https://github.com/remotion-dev/remotion/issues/2439',
		);
	}

	if (err.message.includes('EBADF')) {
		Log.info(
			{indent, logLevel},
			'💡 This error might be fixed by changing your Node version:',
		);
		Log.info(
			{indent, logLevel},
			'   https://github.com/remotion-dev/remotion/issues/2452',
		);
	}

	if (err.message.includes('routines::unsupported')) {
		Log.info(
			{indent, logLevel},
			'💡 This error might happen if using Cloud Run with credentials that have a newline at the end or are otherwise badly encoded.',
		);
		Log.info(
			{indent, logLevel},
			'   https://github.com/remotion-dev/remotion/issues/3864',
		);
	}

	if (err.message.includes('Failed to fetch')) {
		Log.info(
			{indent, logLevel},
			'💡 On Lambda, one reason this could happen is that Chrome is rejecting an asset to be loaded when it is running low on disk space.',
		);
		Log.info(
			{indent, logLevel},
			'Try increasing the disk size of your Lambda function.',
		);
	}
};
