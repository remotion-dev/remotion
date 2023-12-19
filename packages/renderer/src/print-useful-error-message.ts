import {Log} from './logger';
import {truthy} from './truthy';

const alreadyPrinted: Error[] = [];

// Don't use Log.info() here, as BrowserSafeApis need tto be
export const printUsefulErrorMessage = (err: Error) => {
	if (alreadyPrinted.includes(err)) {
		return;
	}

	alreadyPrinted.push(err);

	if (err.message.includes('Could not play video with')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/media-playback-error',
		);
	}

	if (
		err.message.includes('A delayRender()') &&
		err.message.includes('was called but not cleared after')
	) {
		Log.info();
		if (err.message.includes('/proxy')) {
			Log.info(
				'💡 Get help for this issue at https://remotion.dev/docs/troubleshooting/delay-render-proxy',
			);
		}

		Log.info('💡 Get help for this issue at https://remotion.dev/docs/timeout');
	}

	if (err.message.includes('Target closed')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/target-closed',
		);
	}

	if (err.message.includes('Timed out evaluating')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/troubleshooting/timed-out-page-function',
		);
	}

	if (err.message.includes('ENAMETOOLONG')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/enametoolong',
		);
	}

	if (
		err.message.includes('Member must have value less than or equal to 3008')
	) {
		Log.info();
		Log.info(
			'💡 This error indicates that you have a AWS account on the free tier or have been limited by your organization. Often times this can be solved by adding a credit card. See also: https://repost.aws/questions/QUKruWYNDYTSmP17jCnIz6IQ/questions/QUKruWYNDYTSmP17jCnIz6IQ/unable-to-set-lambda-memory-over-3008mb',
		);
	}

	if (err.stack?.includes('TooManyRequestsException: Rate Exceeded.')) {
		Log.info();
		Log.info(
			'💡 This error indicates that your Lambda concurrency limit is too low. See: https://www.remotion.dev/docs/lambda/troubleshooting/rate-limit',
		);
	}

	if (err.message.includes('Error creating WebGL context')) {
		Log.info();
		console.warn(
			'💡 You might need to set the OpenGL renderer to "angle-egl", "angle" (or "swangle" if rendering on lambda). Learn why at https://www.remotion.dev/docs/three',
		);
		console.warn(
			"💡 Check how it's done at https://www.remotion.dev/docs/chromium-flags#--gl",
		);
	}

	if (err.message.includes('The bucket does not allow ACLs')) {
		Log.info();
		Log.info(
			'💡 Fix for this issue: https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl',
		);
	}

	if (err.message.includes('Minified React error #306')) {
		const componentName = err.message.match(/<\w+>/)?.[0];
		Log.info(
			[
				'💡 This error indicates that the component',
				componentName ? `(${componentName})` : null,
				'you are trying to render is not imported correctly.',
			]
				.filter(truthy)
				.join(' '),
		);

		Log.info();
		Log.info(
			'   Check the root file and ensure that the component is not undefined.',
		);
		Log.info(
			'   Oftentimes, this happens if the component is missing the `export` keyword',
		);
		Log.info(
			'   or if the component was renamed and the import statement not properly adjusted.',
		);
	}

	if (err.message.includes('GLIBC_')) {
		Log.info('💡 Remotion requires at least Libc 2.35.');
		Log.info(
			'💡 Get help for this issue: https://github.com/remotion-dev/remotion/issues/2439',
		);
	}

	if (err.message.includes('EBADF')) {
		Log.info('💡 This error might be fixed by changing your Node version:');
		Log.info('   https://github.com/remotion-dev/remotion/issues/2452');
	}
};
