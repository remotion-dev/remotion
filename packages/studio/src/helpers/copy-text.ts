export const copyText = (text: string | Promise<string>): Promise<void> => {
	if (typeof text === 'string') {
		return navigator.clipboard.writeText(text);
	}

	// Safari rejects clipboard writes that happen after an async boundary, so
	// pending text is handed to the clipboard synchronously within the gesture.
	return navigator.clipboard.write([
		new ClipboardItem({
			'text/plain': text.then(
				(resolved) => new Blob([resolved], {type: 'text/plain'}),
			),
		}),
	]);
};
