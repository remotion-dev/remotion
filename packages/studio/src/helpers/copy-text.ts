const copyTextWithExecCommand = (text: string): void => {
	const previouslyFocused = document.activeElement;
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.top = '0';
	textarea.style.left = '0';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.focus({preventScroll: true});
	textarea.select();
	// iOS Safari does not select the content of a readonly textarea on select()
	textarea.setSelectionRange(0, text.length);

	let copied = false;
	try {
		copied = document.execCommand('copy');
	} finally {
		textarea.remove();
		if (previouslyFocused instanceof HTMLElement) {
			previouslyFocused.focus({preventScroll: true});
		}
	}

	if (!copied) {
		throw new Error('The browser did not allow copying to the clipboard');
	}
};

// Async so that any failure, including a synchronous one, reaches the
// callers' .catch(). Everything before the first await still runs
// synchronously within the user gesture.
export const copyText = async (
	text: string | Promise<string>,
): Promise<void> => {
	const {clipboard} = navigator;

	if (clipboard) {
		if (typeof text === 'string') {
			return clipboard.writeText(text);
		}

		// Safari rejects clipboard writes that happen after an async boundary, so
		// pending text is handed to the clipboard synchronously within the gesture.
		return clipboard.write([
			new ClipboardItem({
				'text/plain': text.then(
					(resolved) => new Blob([resolved], {type: 'text/plain'}),
				),
			}),
		]);
	}

	// `navigator.clipboard` only exists in secure contexts, so it is missing when
	// the Studio is opened over plain HTTP on a LAN address. `execCommand('copy')`
	// still works there, as long as it runs within the user gesture.
	if (typeof text === 'string') {
		copyTextWithExecCommand(text);
		return;
	}

	copyTextWithExecCommand(await text);
};
