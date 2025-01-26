import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';

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
	Internals.Log.warn(
		logLevel,
		'Note: Some companies are required to obtain a license to use Remotion. See: https://remotion.dev/license',
	);
	Internals.Log.warn(
		logLevel,
		'Pass the `acknowledgeRemotionLicense` prop to `<Player />` function to make this message disappear.',
	);
};
