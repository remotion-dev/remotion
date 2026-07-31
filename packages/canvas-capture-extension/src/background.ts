const togglePanel = {type: 'remotion-canvas-capture-toggle'};

chrome.action.onClicked.addListener((tab) => {
	if (tab.id === undefined) {
		return;
	}

	const open = async () => {
		try {
			await chrome.tabs.sendMessage(tab.id!, togglePanel);
		} catch {
			await chrome.scripting.executeScript({
				target: {tabId: tab.id!},
				files: ['content.js'],
			});
			await chrome.tabs.sendMessage(tab.id!, togglePanel);
		}
	};

	open().catch(() => undefined);
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

	const url = new URL('https://remotion.dev/convert');
	url.searchParams.set('canvas-capture', message.captureId);
	return chrome.tabs.create({url: url.toString()});
});
