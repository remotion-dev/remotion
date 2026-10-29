import {browser} from 'wxt/browser';
import {canvasSetupUrl} from './browser-requirements';
import {startCaptureHandoff} from './handoff-server';
import {
	captureControllerMessageType,
	openCaptureSetupMessageType,
	type CaptureControllerRequest,
} from './messages';

export const startBackground = () => {
	startCaptureHandoff();
	browser.action.onClicked.addListener(async (tab) => {
		if (tab.id === undefined) {
			return;
		}

		const request: CaptureControllerRequest = {
			type: captureControllerMessageType,
			command: 'toggle-controls',
		};
		try {
			await browser.scripting.executeScript({
				target: {tabId: tab.id},
				files: ['/drag-image.js'],
				world: 'MAIN',
			});
			try {
				await browser.tabs.sendMessage(tab.id, request);
			} catch {
				await browser.scripting.executeScript({
					target: {tabId: tab.id},
					files: ['/capture.js'],
				});
				await browser.tabs.sendMessage(tab.id, request);
			}

			await browser.scripting.executeScript({
				target: {tabId: tab.id},
				files: ['/shot-tools.js'],
				world: 'MAIN',
			});

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
			!('type' in message)
		) {
			return;
		}

		if (message.type === openCaptureSetupMessageType) {
			return browser.tabs
				.create({url: canvasSetupUrl, active: true})
				.then(() => ({opened: true}));
		}
	});
};
