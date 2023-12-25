import {openBrowser} from '@remotion/renderer';
import type {Await} from '../../../shared/await';
import type {
	forgetBrowserEventLoop as originalForget,
	getBrowserInstance as originalGetBrowserInstance,
} from '../../helpers/get-browser-instance';

let _browserInstance: Await<ReturnType<typeof openBrowser>> | null;

export const getBrowserInstance: typeof originalGetBrowserInstance =
	async () => {
		_browserInstance = await openBrowser('chrome');
		return {instance: _browserInstance, configurationString: 'chrome'};
	};

export const forgetBrowserEventLoop: typeof originalForget = () => {};
