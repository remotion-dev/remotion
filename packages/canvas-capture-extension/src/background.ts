import {browser} from 'wxt/browser';
import {capturePopupTargetMessageType} from './messages';

export const startBackground = () => {
	const captureWindowStorageKey = 'remotion-canvas-capture-window-id';
	let windowAction = Promise.resolve();

	const showCaptureWindow = async (tabId: number) => {
		const stored = await browser.storage.session.get(captureWindowStorageKey);
		const storedWindowId = stored[captureWindowStorageKey];
		if (typeof storedWindowId === 'number') {
			try {
				await browser.windows.update(storedWindowId, {focused: true});
				await browser.runtime.sendMessage({
					type: capturePopupTargetMessageType,
					tabId,
				});
				return;
			} catch {
				await browser.storage.session.remove(captureWindowStorageKey);
			}
		}

		const url = new URL(browser.runtime.getURL('/recorder.html'));
		url.searchParams.set('tabId', String(tabId));
		const captureWindow = await browser.windows.create({
			url: url.toString(),
			type: 'popup',
			width: 380,
			height: 560,
			focused: true,
		});
		if (!captureWindow) {
			throw new Error('Could not open the Canvas Capture window.');
		}

		if (captureWindow.id !== undefined) {
			await browser.storage.session.set({
				[captureWindowStorageKey]: captureWindow.id,
			});
		}
	};

	browser.action.onClicked.addListener((tab) => {
		if (tab.id === undefined) {
			return;
		}

		const tabId = tab.id;
		windowAction = windowAction
			.then(() => showCaptureWindow(tabId))
			.catch(() => undefined);
	});

	browser.windows.onRemoved.addListener((windowId) => {
		const clearStoredWindow = async () => {
			const stored = await browser.storage.session.get(captureWindowStorageKey);
			if (stored[captureWindowStorageKey] === windowId) {
				await browser.storage.session.remove(captureWindowStorageKey);
			}
		};

		clearStoredWindow().catch(() => undefined);
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
