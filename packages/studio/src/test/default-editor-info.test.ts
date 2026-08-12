import {afterEach, expect, test} from 'bun:test';
import {getPreferredEditorId} from '../components/use-default-editor-info';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'window');
	}
});

const installTestWindow = (editorName: string | null) => {
	const testWindow: Pick<Window, 'remotion_editorName'> = {
		remotion_editorName: editorName,
	};

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: testWindow,
	});
};

test('prefers the running editor when one is detected', () => {
	installTestWindow('Cursor Editor');

	expect(
		getPreferredEditorId({
			defaultEditor: null,
			installedEditors: [
				{id: 'zed', name: 'Zed', nameWithType: 'Zed'},
				{id: 'cursor', name: 'Cursor', nameWithType: 'Cursor Editor'},
			],
		}),
	).toBe('cursor');
});

test('does not fall back if the running editor is not in the installed list', () => {
	installTestWindow('Custom Editor');

	expect(
		getPreferredEditorId({
			defaultEditor: null,
			installedEditors: [
				{id: 'zed', name: 'Zed', nameWithType: 'Zed'},
				{id: 'cursor', name: 'Cursor', nameWithType: 'Cursor Editor'},
			],
		}),
	).toBe(null);
});

test('prefers the configured default editor before fallback ordering', () => {
	installTestWindow(null);

	expect(
		getPreferredEditorId({
			defaultEditor: 'cursor',
			installedEditors: [
				{id: 'zed', name: 'Zed', nameWithType: 'Zed'},
				{id: 'cursor', name: 'Cursor', nameWithType: 'Cursor Editor'},
			],
		}),
	).toBe('cursor');
});

test('falls back to Zed, VS Code, Cursor, then alphabetical order', () => {
	installTestWindow(null);

	expect(
		getPreferredEditorId({
			defaultEditor: null,
			installedEditors: [
				{id: 'cursor', name: 'Cursor', nameWithType: 'Cursor Editor'},
				{id: 'vscode', name: 'Code', nameWithType: 'Code'},
				{id: 'zed', name: 'Zed', nameWithType: 'Zed'},
			],
		}),
	).toBe('zed');

	expect(
		getPreferredEditorId({
			defaultEditor: null,
			installedEditors: [
				{id: 'cursor', name: 'Cursor', nameWithType: 'Cursor Editor'},
				{id: 'vscode', name: 'Code', nameWithType: 'Code'},
			],
		}),
	).toBe('vscode');

	expect(
		getPreferredEditorId({
			defaultEditor: null,
			installedEditors: [
				{id: 'webstorm', name: 'WebStorm', nameWithType: 'WebStorm'},
				{
					id: 'sublime-text',
					name: 'Sublime Text',
					nameWithType: 'Sublime Text',
				},
			],
		}),
	).toBe('sublime-text');
});
