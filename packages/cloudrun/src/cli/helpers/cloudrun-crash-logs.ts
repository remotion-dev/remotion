import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {extractMemoryFromURL} from '../../api/helpers/extract-mem-from-url';
import {extractTimeoutFromURL} from '../../api/helpers/extract-time-from-url';
import {getCloudLoggingClient} from '../../api/helpers/get-cloud-logging-client';
import {getProjectId} from '../../functions/helpers/is-in-cloud-task';
import type {CloudRunCrashResponse} from '../../functions/helpers/payloads';
import {Log} from '../log';

export const displayCrashLogs = async (
	res: CloudRunCrashResponse,
	logLevel: LogLevel,
) => {
	let timeoutPreMsg = '';

	const timeout = extractTimeoutFromURL(res.cloudRunEndpoint);
	const memoryLimit = extractMemoryFromURL(res.cloudRunEndpoint);

	if (timeout && res.requestElapsedTimeInSeconds + 10 > timeout) {
		timeoutPreMsg = `Render call likely timed out. Service timeout is ${timeout} seconds, and render took at least ${res.requestElapsedTimeInSeconds.toFixed(
			1,
		)} seconds.\n`;
	} else {
		timeoutPreMsg = `Crash unlikely due to timeout. Render took ${res.requestElapsedTimeInSeconds.toFixed(
			1,
		)} seconds, below the timeout of ${timeout} seconds.\n`;
	}

	Log.error(
		{indent: false, logLevel},
		`Error rendering on Cloud Run. The Cloud Run service did not return a response.\n
${timeoutPreMsg}The crash may be due to the service exceeding its memory limit of ${memoryLimit}.
Full logs are available at https://console.cloud.google.com/run?project=${getProjectId()}\n`,
	);

	const cloudLoggingClient = getCloudLoggingClient();

	const listLogEntriesRequest = {
		resourceNames: [`projects/${getProjectId()}`],
		filter: `logName=projects/${getProjectId()}/logs/run.googleapis.com%2Fvarlog%2Fsystem AND (severity=WARNING OR severity=ERROR) AND timestamp >= "${
			res.requestStartTime
		}"`,
	};

	const logCheckCountdown = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		updatesDontOverwrite: false,
		indent: false,
	});

	await (() => {
		return new Promise<void>((resolve) => {
			let timeLeft = 30;
			const intervalId = setInterval(() => {
				logCheckCountdown.update(
					`GCP Cloud Logging takes time to ingest and index logs.\nFetching recent error/warning logs in ${timeLeft} seconds`,
					false,
				);
				timeLeft--;
				if (timeLeft < 0) {
					logCheckCountdown.update('Fetching logs...\n\n', false);
					clearInterval(intervalId);
					resolve();
				}
			}, 1000);
		});
	})();

	const iterableLogListEntries = await cloudLoggingClient.listLogEntriesAsync(
		listLogEntriesRequest,
	);
	for await (const logResponse of iterableLogListEntries) {
		const responseDate = new Date(
			Number(logResponse.timestamp.seconds) * 1000 +
				Number(logResponse.timestamp.nanos) / 1000000,
		);

		const convertedDate = responseDate.toLocaleString();

		Log.info({indent: false, logLevel}, convertedDate);
		Log.info({indent: false, logLevel}, logResponse.textPayload);
		Log.info({indent: false, logLevel});
	}
};
