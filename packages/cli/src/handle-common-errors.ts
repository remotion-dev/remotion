import {chalk} from './chalk';
import {Log} from './log';
import {printError} from './print-error';
import {truthy} from './truthy';

export const handleCommonError = async (err: Error) => {
	await printError(err);
	if (err.message.includes('Could not play video with')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/media-playback-error'
		);
	}

	if (
		err.message.includes('A delayRender()') &&
		err.message.includes('was called but not cleared after')
	) {
		Log.info();
		Log.info('💡 Get help for this issue at https://remotion.dev/docs/timeout');
	}

	if (err.message.includes('Target closed')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/target-closed'
		);
	}

	if (err.message.includes('ENAMETOOLONG')) {
		Log.info();
		Log.info(
			'💡 Get help for this issue at https://remotion.dev/docs/enametoolong'
		);
	}

	if (err.message.includes('Error creating WebGL context')) {
		Log.info();
		Log.info('💡 You might need to set the OpenGL renderer to "angle"');
		Log.info(
			'💡 Get help for this issue at https://www.remotion.dev/docs/three'
		);
	}

	if (err.message.includes('The bucket does not allow ACLs')) {
		Log.info();
		Log.info(
			chalk.green(
				'💡 Fix this issue https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl'
			)
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
				.join(' ')
		);

		Log.info();
		Log.info(
			'   Check the root file and ensure that the component is not undefined.'
		);
		Log.info(
			'   Oftentimes, this happens if the component is missing the `export` keyword'
		);
		Log.info(
			'   or if the component was renamed and the import statement not properly adjusted.'
		);
	}
};
