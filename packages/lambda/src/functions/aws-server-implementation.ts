import type {ServerProviderSpecifics} from '@remotion/serverless';
import {
	forgetBrowserEventLoopImplementation,
	getBrowserInstanceImplementation,
} from '@remotion/serverless';
import {timer} from './helpers/timer';

export const serverAwsImplementation: ServerProviderSpecifics = {
	forgetBrowserEventLoop: forgetBrowserEventLoopImplementation,
	getBrowserInstance: getBrowserInstanceImplementation,
	timer,
};
