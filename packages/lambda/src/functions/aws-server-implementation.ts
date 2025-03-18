import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import type {InsideFunctionSpecifics} from '@remotion/serverless';
import {
	forgetBrowserEventLoopImplementation,
	getBrowserInstanceImplementation,
	invokeWebhook,
} from '@remotion/serverless';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {getCurrentRegionInFunctionImplementation} from './helpers/get-current-region';
import {getFolderFiles} from './helpers/get-folder-files';
import {makeAwsArtifact} from './helpers/make-aws-artifact';
import {timer} from './helpers/timer';

export const serverAwsImplementation: InsideFunctionSpecifics<AwsProvider> = {
	forgetBrowserEventLoop: forgetBrowserEventLoopImplementation,
	getBrowserInstance: getBrowserInstanceImplementation,
	timer,
	getCurrentRegionInFunction: getCurrentRegionInFunctionImplementation,

	generateRandomId: ({deleteAfter, randomHashFn}) => {
		return LambdaClientInternals.generateRandomHashWithLifeCycleRule({
			deleteAfter,
			randomHashFn,
		});
	},
	deleteTmpDir: () => Promise.resolve(deleteTmpDir()),
	getCurrentFunctionName: () => {
		if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
			throw new Error('Expected AWS_LAMBDA_FUNCTION_NAME to be set');
		}

		return process.env.AWS_LAMBDA_FUNCTION_NAME;
	},
	getCurrentMemorySizeInMb: () => {
		return Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE);
	},
	invokeWebhook,
	makeArtifactWithDetails: makeAwsArtifact,
	getFolderFiles,
};
