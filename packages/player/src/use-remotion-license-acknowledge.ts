import {Log, type LogLevel} from 'remotion';

let warningShown = false;

export const acknowledgeRemotionLicenseMessage = (
	acknowledge: boolean,
	logLevel: LogLevel,
) => {
	if (acknowledge) {
		return;
	}

	if (warningShown) {
		return;
	}

	warningShown = true;
	Log.warn(
		logLevel,
		'Note: Some companies are required to obtain a license to use Remotion. See: https://remotion.dev/license\nPass the `acknowledgeRemotionLicense` prop to `<Player />` function to make this message disappear.',
	);
};
