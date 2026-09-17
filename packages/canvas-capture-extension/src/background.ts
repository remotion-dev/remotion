import {browser} from 'wxt/browser';
import {
	captureControllerMessageType,
	type CaptureControllerRequest,
} from './messages';

export const startBackground = () => {
	browser.action.onClicked.addListener(async (tab) => {
		if (tab.id === undefined) {
			return;
		}

		const request: CaptureControllerRequest = {
			type: captureControllerMessageType,
			command: 'toggle-controls',
		};
		try {
			try {
				await browser.tabs.sendMessage(tab.id, request);
			} catch {
				await browser.scripting.executeScript({
					target: {tabId: tab.id},
					files: ['/capture.js'],
				});
				await browser.tabs.sendMessage(tab.id, request);
			}

			await browser.action.setBadgeText({tabId: tab.id, text: ''});
			await browser.action.setTitle({
				tabId: tab.id,
				title: 'Open Remotion Canvas Capture',
			});
		} catch (error) {
			await browser.action.setBadgeBackgroundColor({
				tabId: tab.id,
				color: '#ff3232',
			});
			await browser.action.setBadgeText({tabId: tab.id, text: '!'});
			await browser.action.setTitle({
				tabId: tab.id,
				title: `Could not open Remotion Canvas Capture: ${
					error instanceof Error ? error.message : String(error)
				}`,
			});
		}
	});

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
