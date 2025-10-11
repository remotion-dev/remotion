import type {MediaParserLogLevel} from './log';
import {Log} from './log';

let warningShown = false;

export const warnIfRemotionLicenseNotAcknowledged = ({
	acknowledgeRemotionLicense,
	logLevel,
	apiName,
}: {
	acknowledgeRemotionLicense: boolean;
	logLevel: MediaParserLogLevel;
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
		`Note: Some companies are required to obtain a license to use @remotion/media-parser. See: https://remotion.dev/license\nPass \`acknowledgeRemotionLicense: true\` to \`${apiName}\` function to make this message disappear.`,
	);
};
