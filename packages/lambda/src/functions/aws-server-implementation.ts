import type {ServerProviderSpecifics} from '@remotion/serverless';
import {
	forgetBrowserEventLoopImplementation,
	getBrowserInstanceImplementation,
} from '@remotion/serverless';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {generateRandomHashWithLifeCycleRule} from './helpers/lifecycle';
import {timer} from './helpers/timer';

export const serverAwsImplementation: ServerProviderSpecifics = {
	forgetBrowserEventLoop: forgetBrowserEventLoopImplementation,
	getBrowserInstance: getBrowserInstanceImplementation,
	timer,
	generateRandomId: ({deleteAfter, randomHashFn}) => {
		return generateRandomHashWithLifeCycleRule({deleteAfter, randomHashFn});
	},
	deleteTmpDir: () => Promise.resolve(deleteTmpDir()),
};
