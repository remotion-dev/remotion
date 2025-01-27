import type {LogLevel} from './log';
import {Log} from './log';

let warningShown = false;

export const warnIfRemotionLicenseNotAcknowledged = ({
	acknowledgeRemotionLicense,
	logLevel,
	apiName,
}: {
	acknowledgeRemotionLicense: boolean;
	logLevel: LogLevel;
	apiName: string;
}) => {
	if (acknowledgeRemotionLicense) {
		return;
	}

	if (warningShown) {
		return;
	}

	warningShown = true;
	Log.warn(
		logLevel,
		'Note: Some companies are required to obtain a license to use @remotion/media-parser. See: https://remotion.dev/license',
	);
	Log.warn(
		logLevel,
		`Pass \`acknowledgeRemotionLicense: true\` to \`${apiName}\` function to make this message disappear.`,
	);
};
