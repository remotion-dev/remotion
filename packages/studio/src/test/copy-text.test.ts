import {afterEach, beforeEach, expect, test} from 'bun:test';
import {copyText} from '../helpers/copy-text';

const originalClipboard = navigator.clipboard;
const originalExecCommand = document.execCommand;

const setClipboard = (value: Clipboard | undefined) => {
	Object.defineProperty(navigator, 'clipboard', {
		value,
		configurable: true,
	});
};

let copiedTexts: string[] = [];
let execCommandResult = true;

beforeEach(() => {
	copiedTexts = [];
	execCommandResult = true;
	document.execCommand = (command: string) => {
		if (command !== 'copy') {
			throw new Error(`Unexpected command ${command}`);
		}

		const textarea = document.querySelector('textarea');
		if (!textarea) {
			throw new Error('Expected the text to be placed in a textarea');
		}

		copiedTexts.push(textarea.value);
		return execCommandResult;
	};
});

afterEach(() => {
	setClipboard(originalClipboard);
	document.execCommand = originalExecCommand;
	document.body.innerHTML = '';
});

test('uses the async clipboard API when it is available', async () => {
	const written: string[] = [];
	setClipboard({
		writeText: (text: string) => {
			written.push(text);
			return Promise.resolve();
		},
	} as unknown as Clipboard);

	await copyText('hello');

	expect(written).toEqual(['hello']);
	expect(copiedTexts).toEqual([]);
});

test('falls back to execCommand when navigator.clipboard is unavailable', async () => {
	setClipboard(undefined);
	const button = document.createElement('button');
	document.body.appendChild(button);
	button.focus();

	await copyText('copied over http');

	expect(copiedTexts).toEqual(['copied over http']);
	expect(document.querySelector('textarea')).toBeNull();
	expect(document.activeElement).toBe(button);
});

test('copies pending text once it resolves', async () => {
	setClipboard(undefined);

	await copyText(Promise.resolve('resolved later'));

	expect(copiedTexts).toEqual(['resolved later']);
});

test('rejects instead of throwing when the fallback copy is refused', async () => {
	setClipboard(undefined);
	execCommandResult = false;

	const result = copyText('refused');

	await expect(result).rejects.toThrow('did not allow copying');
	expect(document.querySelector('textarea')).toBeNull();
});

test('rejects instead of throwing when the Clipboard API throws synchronously', async () => {
	setClipboard({
		writeText: () => {
			throw new Error('writeText is not allowed here');
		},
	} as unknown as Clipboard);

	const result = copyText('sync failure');

	await expect(result).rejects.toThrow('writeText is not allowed here');
});
