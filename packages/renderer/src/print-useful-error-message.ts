import {truthy} from './truthy';

const alreadyPrinted: Error[] = [];

// Don't use Log.info() here, as BrowserSafeApis need tto be
export const printUsefulErrorMessage = (err: Error) => {
	if (alreadyPrinted.includes(err)) {
		return;
	}

	alreadyPrinted.push(err);

	if (err.message.includes('Could not play video with')) {
		console.log();
		console.log(
			'💡 Get help for this issue at https://remotion.dev/docs/media-playback-error',
		);
	}

	if (
		err.message.includes('A delayRender()') &&
		err.message.includes('was called but not cleared after')
	) {
		console.log();
		console.log(
			'💡 Get help for this issue at https://remotion.dev/docs/timeout',
		);
	}

	if (err.message.includes('Target closed')) {
		console.log();
		console.log(
			'💡 Get help for this issue at https://remotion.dev/docs/target-closed',
		);
	}

	if (err.message.includes('ENAMETOOLONG')) {
		console.log();
		console.log(
			'💡 Get help for this issue at https://remotion.dev/docs/enametoolong',
		);
	}

	if (err.message.includes('Error creating WebGL context')) {
		console.log();
		console.warn(
			'💡 You might need to set the OpenGL renderer to "angle" (or "swangle" if rendering on lambda). Learn why at https://www.remotion.dev/docs/three',
		);
		console.warn(
			"💡 Check how it's done at https://www.remotion.dev/docs/chromium-flags#--gl",
		);
	}

	if (err.message.includes('The bucket does not allow ACLs')) {
		console.log();
		console.log(
			'💡 Fix for this issue: https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl',
		);
	}

	if (err.message.includes('Minified React error #306')) {
		const componentName = err.message.match(/<\w+>/)?.[0];
		console.log(
			[
				'💡 This error indicates that the component',
				componentName ? `(${componentName})` : null,
				'you are trying to render is not imported correctly.',
			]
				.filter(truthy)
				.join(' '),
		);

		console.log();
		console.log(
			'   Check the root file and ensure that the component is not undefined.',
		);
		console.log(
			'   Oftentimes, this happens if the component is missing the `export` keyword',
		);
		console.log(
			'   or if the component was renamed and the import statement not properly adjusted.',
		);
	}

	if (err.message.includes('GLIBC_')) {
		console.log('💡 Remotion requires at least Libc 2.35.');
		console.log(
			'💡 Get help for this issue: https://github.com/remotion-dev/remotion/issues/2439',
		);
	}

	if (err.message.includes('EBADF')) {
		console.log('💡 This error might be fixed by changing your Node version:');
		console.log('   https://github.com/remotion-dev/remotion/issues/2452');
	}
};
