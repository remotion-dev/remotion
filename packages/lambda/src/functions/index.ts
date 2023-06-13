import {RenderInternals} from '@remotion/renderer';
import type {LambdaPayload} from '../shared/constants';
import {COMMAND_NOT_FOUND, LambdaRoutines} from '../shared/constants';
import {compositionsHandler} from './compositions';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {getWarm, setWarm} from './helpers/is-warm';
import {printCloudwatchHelper} from './helpers/print-cloudwatch-helper';
import type {ResponseStream} from './helpers/streamify-response';
import {streamifyResponse} from './helpers/streamify-response';
import {infoHandler} from './info';
import {launchHandler} from './launch';
import {progressHandler} from './progress';
import {rendererHandler} from './renderer';
import {startHandler} from './start';
import {stillHandler} from './still';

export const handler = streamifyResponse(
	async (
		params: LambdaPayload,
		responseStream: ResponseStream,
		context: {
			invokedFunctionArn: string;
			getRemainingTimeInMillis: () => number;
		}
	): Promise<void> => {
		process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = 'true';
		const timeoutInMilliseconds = context.getRemainingTimeInMillis();

		if (!context?.invokedFunctionArn) {
			throw new Error(
				'Lambda function unexpectedly does not have context.invokedFunctionArn'
			);
		}

		deleteTmpDir();
		const isWarm = getWarm();
		setWarm();

		const currentUserId = context.invokedFunctionArn.split(':')[4];
		if (params.type === LambdaRoutines.still) {
			printCloudwatchHelper(LambdaRoutines.still, {
				inputProps: JSON.stringify(params.inputProps),
				isWarm,
			});
			const response = await stillHandler(params, {
				expectedBucketOwner: currentUserId,
			});
			responseStream.write(JSON.stringify(response));
			responseStream.end();
			return;
		}

		if (params.type === LambdaRoutines.start) {
			printCloudwatchHelper(LambdaRoutines.start, {
				inputProps: JSON.stringify(params.inputProps),
				isWarm,
			});
			const response = await startHandler(params, {
				expectedBucketOwner: currentUserId,
			});
			responseStream.write(JSON.stringify(response));
			responseStream.end();
			return;
		}

		if (params.type === LambdaRoutines.launch) {
			printCloudwatchHelper(LambdaRoutines.launch, {
				renderId: params.renderId,
				inputProps: JSON.stringify(params.inputProps),
				isWarm,
			});
			await launchHandler(params, {
				expectedBucketOwner: currentUserId,
				getRemainingTimeInMillis: context.getRemainingTimeInMillis,
			});
			responseStream.end();
			return;
		}

		if (params.type === LambdaRoutines.status) {
			printCloudwatchHelper(LambdaRoutines.status, {
				renderId: params.renderId,
				isWarm,
			});
			const response = await progressHandler(params, {
				expectedBucketOwner: currentUserId,
				timeoutInMilliseconds,
			});
			responseStream.write(JSON.stringify(response));
			responseStream.end();
			return;
		}

		if (params.type === LambdaRoutines.renderer) {
			printCloudwatchHelper(LambdaRoutines.renderer, {
				renderId: params.renderId,
				chunk: String(params.chunk),
				dumpLogs: String(
					RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose')
				),
				inputProps: JSON.stringify(params.inputProps),
				isWarm,
			});
			await rendererHandler(params, {
				expectedBucketOwner: currentUserId,
				isWarm,
			});
			responseStream.end();
			return;
		}

		if (params.type === LambdaRoutines.info) {
			printCloudwatchHelper(LambdaRoutines.info, {
				isWarm,
			});

			const response = await infoHandler(params);
			responseStream.write(JSON.stringify(response));
			responseStream.end();
			return;
		}

		if (params.type === LambdaRoutines.compositions) {
			printCloudwatchHelper(LambdaRoutines.compositions, {
				isWarm,
			});

			const response = await compositionsHandler(params, {
				expectedBucketOwner: currentUserId,
			});
			responseStream.write(JSON.stringify(response));
			responseStream.end();
			return;
		}

		throw new Error(COMMAND_NOT_FOUND);
	}
);
