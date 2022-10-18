import {openBrowser} from '@remotion/renderer';
import type {Await} from '../../../shared/await';
import type {getBrowserInstance as original} from '../../helpers/get-browser-instance';

let _browserInstance: Await<ReturnType<typeof openBrowser>> | null;

export const getBrowserInstance: typeof original = async () => {
	_browserInstance = await openBrowser('chrome');
	return _browserInstance;
};
