import * as readline from 'node:readline';
import type {
	DefaultCodingAgent,
	DefaultEditor,
	LogLevel,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {
	getPreferredApp,
	preferredFallbackEditorIds,
} from '@remotion/studio-shared';
import {focusBrowserTabByOrigin} from './better-opn';
import {getAppDiscovery, getEditorInfo} from './helpers/app-discovery';
import {
	launchCodingAgent,
	type InstalledCodingAgent,
} from './helpers/coding-agent-registry';
import {launchCustomEditor} from './helpers/custom-editor';
import {launchEditor} from './helpers/open-in-editor';
import {getRecentlyUsedApps} from './helpers/recently-used-apps';
import {resolveEditor, type ResolvedEditor} from './helpers/resolve-editor';
import {maybeOpenBrowser} from './maybe-open-browser';
import {clearPrintPortMessageTimeout} from './preview-server/live-events';

type Key = {
	name?: string;
	ctrl?: boolean;
	meta?: boolean;
};

export const registerStudioShortcuts = ({
	browserArgs,
	browserFlag,
	url,
	logLevel,
	remotionRoot,
	getDefaultEditor,
	getDefaultCodingAgent,
}: {
	browserArgs: string;
	browserFlag: string;
	url: string;
	logLevel: LogLevel;
	remotionRoot: string;
	getDefaultEditor: () => DefaultEditor | null;
	getDefaultCodingAgent: () => DefaultCodingAgent | null;
}): {registered: boolean; cleanup: () => void} => {
	if (!process.stdin.isTTY) {
		return {registered: false, cleanup: () => undefined};
	}

	if (typeof process.stdin.setRawMode !== 'function') {
		return {registered: false, cleanup: () => undefined};
	}

	const wasRaw = process.stdin.isRaw;
	const shouldPauseAfterCleanup = process.stdin.isPaused();
	let cleanedUp = false;
	let isOpeningBrowser = false;
	let editor: ResolvedEditor | null = null;
	let codingAgent: InstalledCodingAgent | null = null;
	const openingApps = new Set<string>();

	const discoverShortcuts = async () => {
		const [discovery, editorInfo, recentEditors, recentCodingAgents] =
			await Promise.all([
				getAppDiscovery(),
				getEditorInfo(getDefaultEditor()),
				getRecentlyUsedApps({
					remotionRoot,
					type: 'editor',
					recentlyUsedIds: null,
				}),
				getRecentlyUsedApps({
					remotionRoot,
					type: 'coding-agent',
					recentlyUsedIds: null,
				}),
			]);
		const preferredEditor = getPreferredApp({
			installedApps: editorInfo.installedEditors,
			configuredId: editorInfo.defaultEditor,
			runningIds: editorInfo.runningEditors ?? [],
			recentlyUsedIds: recentEditors,
			fallbackIds: preferredFallbackEditorIds,
		});
		editor = preferredEditor
			? await resolveEditor({
					defaultEditor: getDefaultEditor(),
					preferredEditor: preferredEditor.id,
					logLevel,
				})
			: null;
		codingAgent = getPreferredApp({
			installedApps: discovery.installedCodingAgents,
			configuredId: getDefaultCodingAgent(),
			runningIds: discovery.runningCodingAgents,
			recentlyUsedIds: recentCodingAgents,
			fallbackIds: discovery.installedCodingAgents.map(({id}) => id),
		});
	};

	const printShortcuts = () => {
		if (cleanedUp) {
			return;
		}

		const shortcuts = [
			'[s] Open Studio',
			...(codingAgent ? [`[a] Open agent (${codingAgent.name})`] : []),
			...(editor
				? [
						`[c] Open editor (${editor.name === 'Code' ? 'VS Code' : editor.name})`,
					]
				: []),
		];
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray(shortcuts.join('  ')),
		);
	};

	const openApp = async (key: 'a' | 'c') => {
		if (openingApps.has(key) || cleanedUp) {
			return;
		}

		openingApps.add(key);
		try {
			if (key === 'a' && codingAgent) {
				await launchCodingAgent({
					codingAgent,
					projectPath: remotionRoot,
					logLevel,
					prompt: null,
				});
			} else if (key === 'c' && editor) {
				if (editor.type === 'custom') {
					await launchCustomEditor({
						editor: editor.editor,
						resolvedExecutable: editor,
						targetPath: remotionRoot,
						lineNumber: 1,
						columnNumber: 1,
						logLevel,
						spawnProcess: null,
					});
				} else {
					await launchEditor(
						{
							editor,
							fileName: remotionRoot,
							lineNumber: 1,
							colNumber: 1,
							vsCodeNewWindow: false,
							logLevel,
						},
						remotionRoot,
					);
				}
			}
		} catch (err) {
			RenderInternals.Log.error(
				{indent: false, logLevel},
				key === 'a' ? 'Could not open coding agent:' : 'Could not open editor:',
				err,
			);
		} finally {
			openingApps.delete(key);
		}
	};

	const cleanup = () => {
		if (cleanedUp) {
			return;
		}

		cleanedUp = true;
		process.stdin.removeListener('keypress', onKeypress);
		process.removeListener('SIGINT', cleanup);
		process.removeListener('exit', cleanup);

		if (!wasRaw && process.stdin.isTTY) {
			process.stdin.setRawMode(false);
		}

		if (shouldPauseAfterCleanup) {
			process.stdin.pause();
		}
	};

	const openStudio = async () => {
		if (isOpeningBrowser) {
			return;
		}

		isOpeningBrowser = true;
		clearPrintPortMessageTimeout();
		try {
			const didFocus = await focusBrowserTabByOrigin({
				url,
				browserArgs,
				browserFlag,
			});
			if (didFocus) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					RenderInternals.chalk.blue(`Opened ${url} in browser`),
				);
				return;
			}

			const result = await maybeOpenBrowser({
				browserArgs,
				browserFlag,
				shouldOpenBrowser: true,
				url,
				logLevel,
			});
			if (result.didOpenBrowser) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					RenderInternals.chalk.blue(`Opened ${url} in browser`),
				);
			}
		} catch (err) {
			RenderInternals.Log.error(
				{indent: false, logLevel},
				'Could not open browser:',
				err,
			);
		} finally {
			isOpeningBrowser = false;
		}
	};

	function onKeypress(_str: string, key: Key | undefined) {
		if (key?.ctrl && key.name === 'c') {
			cleanup();
			process.kill(process.pid, 'SIGINT');
			return;
		}

		if (key?.meta || key?.ctrl) {
			return;
		}

		if (key?.name === 's') {
			openStudio().catch(() => undefined);
		} else if (key?.name === 'a' || key?.name === 'c') {
			openApp(key.name).catch(() => undefined);
		}
	}

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on('keypress', onKeypress);
	process.once('SIGINT', cleanup);
	process.once('exit', cleanup);
	// Discovery may finish after other startup logs; never await it here.
	discoverShortcuts()
		.catch((err) => {
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				'Could not discover Studio shortcuts:',
				err,
			);
		})
		.then(printShortcuts);

	return {registered: true, cleanup};
};
