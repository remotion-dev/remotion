import {browser} from 'wxt/browser';

export const startBackground = () => {
	browser.runtime.onMessage.addListener((message) => {
		if (
			typeof message !== 'object' ||
			message === null ||
			!('type' in message) ||
			message.type !== 'remotion-canvas-capture-open-convert' ||
			!('captureId' in message) ||
			typeof message.captureId !== 'string'
		) {
			return;
		}

		const url = new URL('https://www.remotion.dev/convert');
		url.searchParams.set('canvas-capture', message.captureId);
		return browser.tabs.create({url: url.toString()});
	});
};
