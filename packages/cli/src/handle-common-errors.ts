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

	if (err.message.includes('A delayRender was called')) {
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

	if (err.message.includes('The bucket does not allow ACLs')) {
		Log.info();
		Log.info(
			chalk.green(
				'💡 Fix this issue https://remotion.dev/docs/lambda/troubleshooting/bucket-disallows-acl'
			)
		);
	}
};
