import type {InsideFunctionSpecifics} from '@remotion/serverless';
import {
	forgetBrowserEventLoopImplementation,
	getBrowserInstanceImplementation,
} from '@remotion/serverless';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {generateRandomHashWithLifeCycleRule} from './helpers/lifecycle';
import {timer} from './helpers/timer';

export const serverAwsImplementation: InsideFunctionSpecifics = {
	forgetBrowserEventLoop: forgetBrowserEventLoopImplementation,
	getBrowserInstance: getBrowserInstanceImplementation,
	timer,
	generateRandomId: ({deleteAfter, randomHashFn}) => {
		return generateRandomHashWithLifeCycleRule({deleteAfter, randomHashFn});
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
};
