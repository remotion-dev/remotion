import {Log, type LogLevel} from './log';

export const logDeprecatedStillRenderLicenseKey = ({
	licenseKey,
	api,
	option,
	logLevel,
}: {
	licenseKey: string | null;
	api: string;
	option: 'licenseKey' | 'apiKey' | '--license-key';
	logLevel: LogLevel;
}) => {
	if (licenseKey === null || licenseKey === 'free-license') {
		return;
	}

	Log.info(
		{logLevel, tag: null},
		`Still renders don't need to be tracked anymore, an unlimited amount is now included in any Remotion License. You can now remove \`${option}\` from ${api}.`,
	);
};
