import type {
	BuiltInEditor,
	CustomEditor,
	DefaultEditor,
	LogLevel,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {
	resolveCustomEditorExecutable,
	type ResolvedCustomEditorExecutable,
} from './custom-editor';
import {getAvailableEditors, getDefaultEditorName} from './editor-registry';
import type {InstalledEditor} from './editor-registry';
import {getDisplayNameForEditor, guessEditor} from './open-in-editor';
import type {ProcessAndCommand} from './open-in-editor';

export type ResolvedEditor =
	| (ProcessAndCommand & {
			type: 'built-in';
			id: BuiltInEditor | null;
			name: string;
	  })
	| (ResolvedCustomEditorExecutable & {
			type: 'custom';
			id: 'custom';
			name: string;
			editor: CustomEditor;
	  });

type ResolveEditorDependencies = {
	getInstalledEditors: () => Promise<readonly InstalledEditor[]>;
	getLegacyEditors: () => Promise<readonly ProcessAndCommand[]>;
	resolveCustomEditor: (
		editor: CustomEditor,
	) => ResolvedCustomEditorExecutable | null;
	warn: (message: string) => void;
	warnedEditors: Set<string>;
};

let legacyEditors: ReturnType<typeof guessEditor> | null = null;
const getLegacyEditors = () => {
	legacyEditors ??= guessEditor();

	return legacyEditors;
};

const warnedEditors = new Set<string>();

const defaultDependencies: ResolveEditorDependencies = {
	getInstalledEditors: getAvailableEditors,
	getLegacyEditors,
	resolveCustomEditor: resolveCustomEditorExecutable,
	warn: () => undefined,
	warnedEditors,
};

export const resolveEditor = async (
	{
		defaultEditor,
		logLevel,
		preferredEditor,
	}: {
		defaultEditor: DefaultEditor | null;
		logLevel: LogLevel;
		preferredEditor: BuiltInEditor | 'custom' | null;
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

	if (preferredEditor === 'custom') {
		if (!defaultEditor || typeof defaultEditor !== 'object') {
			return null;
		}

		const resolvedExecutable = dependencies.resolveCustomEditor(defaultEditor);
		if (!resolvedExecutable) {
			return null;
		}

		return {
			...resolvedExecutable,
			type: 'custom',
			id: 'custom',
			name: defaultEditor.name,
			editor: defaultEditor,
		};
	}

	if (preferredEditor !== null) {
		const installedEditors = await dependencies.getInstalledEditors();
		const installedEditor = installedEditors.find(
			(editor) => editor.id === preferredEditor,
		);

		return installedEditor ? {...installedEditor, type: 'built-in'} : null;
	}

	if (defaultEditor && typeof defaultEditor === 'object') {
		const resolvedExecutable = dependencies.resolveCustomEditor(defaultEditor);
		if (resolvedExecutable) {
			return {
				...resolvedExecutable,
				type: 'custom',
				id: 'custom',
				name: defaultEditor.name,
				editor: defaultEditor,
			};
		}

		const warningId = `custom:${defaultEditor.executable}`;
		if (!dependencies.warnedEditors.has(warningId)) {
			dependencies.warnedEditors.add(warningId);
			dependencies.warn(
				`The executable for custom editor ${defaultEditor.name} (${defaultEditor.executable}) was not found or is not executable. Falling back to automatic editor detection.`,
			);
		}
	}

	if (typeof defaultEditor === 'string') {
		const installedEditors = await dependencies.getInstalledEditors();
		const installedEditor = installedEditors.find(
			(editor) => editor.id === defaultEditor,
		);
		if (installedEditor) {
			return {...installedEditor, type: 'built-in'};
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
		type: 'built-in',
		id: null,
		name: getDisplayNameForEditor(legacyEditor.command) ?? legacyEditor.command,
	};
};
