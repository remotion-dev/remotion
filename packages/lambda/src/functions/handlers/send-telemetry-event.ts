import {LicensingInternals} from '@remotion/licensing';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const sendTelemetryEvent = async ({
	licenseKey,
	logLevel,
	isProduction,
	idempotencyKey,
}: {
	licenseKey: string | null;
	logLevel: LogLevel;
	isProduction: boolean;
	idempotencyKey: string;
}) => {
	if (licenseKey === null) {
		return Promise.resolve();
	}

	try {
		// https://www.remotion.dev/docs/licensing
		await LicensingInternals.internalRegisterUsageEvent({
			licenseKey,
			event: 'cloud-render',
			host: null,
			succeeded: true,
			isStill: false,
			isProduction,
			idempotencyKey,
		});
		RenderInternals.Log.info({indent: false, logLevel}, 'Telemetry event sent');
	} catch (err) {
		RenderInternals.Log.error(
			{indent: false, logLevel},
			'Failed to send telemetry event',
		);
		RenderInternals.Log.error({indent: true, logLevel}, err);
		return Promise.resolve();
	}
};
