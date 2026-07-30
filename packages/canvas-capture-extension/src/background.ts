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
