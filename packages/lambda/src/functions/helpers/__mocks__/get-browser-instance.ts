import {openBrowser} from '@remotion/renderer';
import type {
	forgetBrowserEventLoop as originalForget,
	getBrowserInstance as originalGetBrowserInstance,
} from '@remotion/serverless';
import type {Await} from '@remotion/serverless/client';

let _browserInstance: Await<ReturnType<typeof openBrowser>> | null;

export const getBrowserInstance: typeof originalGetBrowserInstance =
	async () => {
		_browserInstance = await openBrowser('chrome');
		return {instance: _browserInstance, configurationString: 'chrome'};
	};

export const forgetBrowserEventLoop: typeof originalForget = () => {};
