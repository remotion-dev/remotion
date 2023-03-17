import {chalk} from './chalk';
import {Log} from './log';
import {printError} from './print-error';

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

	if (err.message.includes("Minified React error #306")) {
		const componentName = err.message.match(/<\w+>/)?.[0] || ""
		const errorMsg = `Error: Failed to render ${componentName}. Please check that it is imported correctly.`
		Log.error(errorMsg)
		Log.info(
			'💡 You can try taking a look at the path of the component that you are referencing. It could be the cause of this error.'
		)
	}
};
