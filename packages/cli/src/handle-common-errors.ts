import {Log} from './log';

export const handleCommonError = (err: Error) => {
	Log.error(err.message);
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
};
