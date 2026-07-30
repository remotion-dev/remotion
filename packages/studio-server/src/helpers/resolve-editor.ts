import type {DefaultEditor, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {getAvailableEditors, getDefaultEditorName} from './editor-registry';
import type {InstalledEditor} from './editor-registry';
import {getDisplayNameForEditor, guessEditor} from './open-in-editor';
import type {ProcessAndCommand} from './open-in-editor';

export type ResolvedEditor = ProcessAndCommand & {
	id: DefaultEditor | null;
	name: string;
};

type ResolveEditorDependencies = {
	getInstalledEditors: () => Promise<readonly InstalledEditor[]>;
	getLegacyEditors: () => Promise<readonly ProcessAndCommand[]>;
	warn: (message: string) => void;
	warnedEditors: Set<DefaultEditor>;
};

const legacyEditors = guessEditor();
const warnedEditors = new Set<DefaultEditor>();

const defaultDependencies: ResolveEditorDependencies = {
	getInstalledEditors: getAvailableEditors,
	getLegacyEditors: () => legacyEditors,
	warn: () => undefined,
	warnedEditors,
};

export const resolveEditor = async (
	{
		defaultEditor,
		logLevel,
	}: {
		defaultEditor: DefaultEditor | null;
		logLevel: LogLevel;
	},
	overrides: Partial<ResolveEditorDependencies> = {},
): Promise<ResolvedEditor | null> => {
	const dependencies = {
		...defaultDependencies,
		warn: (message: string) => {
			RenderInternals.Log.warn({indent: false, logLevel}, message);
		},
		...overrides,
	};

	if (defaultEditor) {
		const installedEditors = await dependencies.getInstalledEditors();
		const installedEditor = installedEditors.find(
			(editor) => editor.id === defaultEditor,
		);
		if (installedEditor) {
			return installedEditor;
		}

		if (!dependencies.warnedEditors.has(defaultEditor)) {
			dependencies.warnedEditors.add(defaultEditor);
			dependencies.warn(
				`The default editor ${getDefaultEditorName(defaultEditor)} (${defaultEditor}) is not installed. Falling back to automatic editor detection.`,
			);
		}
	}

	const [legacyEditor] = await dependencies.getLegacyEditors();
	if (!legacyEditor) {
		return null;
	}

	return {
		...legacyEditor,
		id: null,
		name: getDisplayNameForEditor(legacyEditor.command) ?? legacyEditor.command,
	};
};
