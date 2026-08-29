import {RenderInternals, type LogLevel} from '@remotion/renderer';
import type {
	CloudProvider,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import {cancellationKey} from '@remotion/serverless-client';

const isMissingCancellationSignalError = (err: unknown) => {
	const error = err as {name?: string; Code?: string; code?: string};
	return (
		error.name === 'NoSuchKey' ||
		error.name === 'NotFound' ||
		error.Code === 'NoSuchKey' ||
		error.code === 'NoSuchKey'
	);
};

export const startCancellationPolling = <Provider extends CloudProvider>({
	bucketName,
	renderId,
	region,
	providerSpecifics,
	forcePathStyle,
	intervalInMilliseconds,
	logLevel,
	onCancelled,
}: {
	bucketName: string;
	renderId: string;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
	intervalInMilliseconds: number;
	logLevel: LogLevel;
	onCancelled: () => void;
}) => {
	let stopped = false;
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const poll = async () => {
		try {
			await providerSpecifics.headFile({
				bucketName,
				key: cancellationKey(renderId),
				region,
				customCredentials: null,
				forcePathStyle,
				requestHandler: null,
			});

			if (!stopped) {
				stopped = true;
				RenderInternals.Log.info(
					{indent: false, logLevel},
					'Render cancellation signal received.',
				);
				onCancelled();
			}
		} catch (err) {
			if (!isMissingCancellationSignalError(err)) {
				RenderInternals.Log.warn(
					{indent: false, logLevel},
					'Could not check for a render cancellation signal. Retrying.',
					err,
				);
			}
		}

		if (!stopped) {
			timeout = setTimeout(poll, intervalInMilliseconds);
		}
	};

	poll().catch((err) => {
		RenderInternals.Log.warn(
			{indent: false, logLevel},
			'Cancellation polling stopped unexpectedly.',
			err,
		);
	});

	return () => {
		stopped = true;
		if (timeout !== null) {
			clearTimeout(timeout);
		}
	};
};
