import {openBrowser} from '@remotion/renderer';
import {Await} from '../../../shared/await';
import {getBrowserInstance as original} from '../../helpers/get-browser-instance';

let _browserInstance: Await<ReturnType<typeof openBrowser>> | null;

export const getBrowserInstance: typeof original = async () => {
	_browserInstance = await openBrowser('chrome');
	return _browserInstance;
};

export const killBrowserInstancesForIntegrationTest = (): Promise<void> => {
	if (_browserInstance) {
		return _browserInstance.close();
	}

	return Promise.resolve();
};
