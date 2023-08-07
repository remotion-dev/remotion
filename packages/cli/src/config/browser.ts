import type {Browser} from '@remotion/renderer';

const currentBrowser: Browser | null = null;

export const getBrowser = () => {
	return currentBrowser;
};
