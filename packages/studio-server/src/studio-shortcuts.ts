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
	type GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {focusBrowserTabByOrigin} from './better-opn';
import {getAppDiscovery, getEditorInfo} from './helpers/app-discovery';
import type {InstalledCodingAgent} from './helpers/coding-agent-registry';
import {openInCodingAgent, openInEditor} from './helpers/open-in-app';
import {
	getRecentlyUsedApps,
	subscribeToRecentlyUsedApps,
} from './helpers/recently-used-apps';
import {maybeOpenBrowser} from './maybe-open-browser';
import {
	clearPrintPortMessageTimeout,
	subscribeToConfigChanges,
} from './preview-server/live-events';

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
	let editor: GetDefaultEditorInfoResponse['installedEditors'][number] | null =
		null;
	let codingAgent: InstalledCodingAgent | null = null;
	const openingApps = new Set<string>();
	let refreshRevision = 0;
	let lastPrintedAssignment: string | null = null;

	const refreshShortcuts = async () => {
		const revision = ++refreshRevision;
		const configuredEditor = getDefaultEditor();
		const configuredCodingAgent = getDefaultCodingAgent();
		const [discovery, editorInfo, recentEditors, recentCodingAgents] =
			await Promise.all([
				getAppDiscovery(),
				getEditorInfo(configuredEditor),
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
		if (cleanedUp || revision !== refreshRevision) {
			return;
		}

		editor = getPreferredApp({
			installedApps: editorInfo.installedEditors,
			configuredId: editorInfo.defaultEditor,
			runningIds: editorInfo.runningEditors ?? [],
			recentlyUsedIds: recentEditors,
			fallbackIds: preferredFallbackEditorIds,
		});
		codingAgent = getPreferredApp({
			installedApps: discovery.installedCodingAgents,
			configuredId: configuredCodingAgent,
			runningIds: discovery.runningCodingAgents,
			recentlyUsedIds: recentCodingAgents,
			fallbackIds: discovery.installedCodingAgents.map(({id}) => id),
		});
		printShortcuts();
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
						`[e] Open editor (${editor.name === 'Code' ? 'VS Code' : editor.name})`,
					]
				: []),
		];
		const assignment = JSON.stringify([
			editor?.id ?? null,
			codingAgent?.id ?? null,
			shortcuts,
			editor?.id === 'custom' ? getDefaultEditor() : null,
		]);
		if (assignment === lastPrintedAssignment) {
			return;
		}

		lastPrintedAssignment = assignment;
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray(shortcuts.join('  ')),
		);
	};

	const onPreferencesChange = () => {
		if (cleanedUp) {
			return;
		}

		refreshShortcuts().catch((err) => {
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				'Could not refresh Studio shortcuts:',
				err,
			);
			printShortcuts();
		});
	};

	const unsubscribeHistory = subscribeToRecentlyUsedApps({
		remotionRoot,
		onChange: onPreferencesChange,
	});
	const unsubscribeConfig = subscribeToConfigChanges(onPreferencesChange);

	const openApp = async (key: 'a' | 'e') => {
		if (openingApps.has(key) || cleanedUp) {
			return;
		}

		openingApps.add(key);
		try {
			const response =
				key === 'a' && codingAgent
					? await openInCodingAgent({
							input: {codingAgentId: codingAgent.id, prompt: null},
							remotionRoot,
							logLevel,
						})
					: key === 'e' && editor
						? await openInEditor({
								input: {
									editorId: editor.id,
									stack: {
										originalFileName: remotionRoot,
										originalLineNumber: 1,
										originalColumnNumber: 1,
										originalFunctionName: null,
										originalScriptCode: null,
									},
								},
								remotionRoot,
								logLevel,
								getDefaultEditor,
							})
						: null;
			if (response && !response.success) {
				RenderInternals.Log.error(
					{indent: false, logLevel},
					`Could not open ${key === 'a' ? codingAgent?.name : editor?.name}`,
				);
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
		unsubscribeHistory();
		unsubscribeConfig();
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
		} else if (key?.name === 'a' || key?.name === 'e') {
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
	onPreferencesChange();

	return {registered: true, cleanup};
};
