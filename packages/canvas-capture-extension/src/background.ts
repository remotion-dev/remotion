import {capturePopupTargetMessageType} from './messages';

const captureWindowStorageKey = 'remotion-canvas-capture-window-id';
let windowAction = Promise.resolve();

const showCaptureWindow = async (tabId: number) => {
	const stored = await chrome.storage.session.get(captureWindowStorageKey);
	const storedWindowId = stored[captureWindowStorageKey];
	if (typeof storedWindowId === 'number') {
		try {
			await chrome.windows.update(storedWindowId, {focused: true});
			await chrome.runtime.sendMessage({
				type: capturePopupTargetMessageType,
				tabId,
			});
			return;
		} catch {
			await chrome.storage.session.remove(captureWindowStorageKey);
		}
	}

	const url = new URL(chrome.runtime.getURL('popup.html'));
	url.searchParams.set('tabId', String(tabId));
	const captureWindow = await chrome.windows.create({
		url: url.toString(),
		type: 'popup',
		width: 340,
		height: 435,
		focused: true,
	});
	if (captureWindow.id !== undefined) {
		await chrome.storage.session.set({
			[captureWindowStorageKey]: captureWindow.id,
		});
	}
};

chrome.action.onClicked.addListener((tab) => {
	if (tab.id === undefined) {
		return;
	}

	const tabId = tab.id;
	windowAction = windowAction
		.then(() => showCaptureWindow(tabId))
		.catch(() => undefined);
});

chrome.windows.onRemoved.addListener((windowId) => {
	const clearStoredWindow = async () => {
		const stored = await chrome.storage.session.get(captureWindowStorageKey);
		if (stored[captureWindowStorageKey] === windowId) {
			await chrome.storage.session.remove(captureWindowStorageKey);
		}
	};

	clearStoredWindow().catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message) => {
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
	return chrome.tabs.create({url: url.toString()});
});
