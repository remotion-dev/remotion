import {registerUsageEvent} from '@remotion/licensing';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const sendTelemetryEvent = async (
	apiKey: string | null,
	logLevel: LogLevel,
) => {
	if (apiKey === null) {
		return Promise.resolve();
	}

	try {
		// https://www.remotion.dev/docs/licensing
		await registerUsageEvent({
			apiKey,
			event: 'cloud-render',
			host: null,
			succeeded: true,
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
