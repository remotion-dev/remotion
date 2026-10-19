import type {DefaultCodingAgent, DefaultEditor} from '@remotion/renderer';
import type {
	GetAppInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {
	getAvailableCodingAgents,
	getRunningCodingAgents,
} from './coding-agent-registry';
import {resolveCustomEditorExecutable} from './custom-editor';
import {getAvailableEditors, getRunningEditors} from './editor-registry';
import {getAvailableGitClients} from './git-client-registry';
import {getAvailableTerminals} from './terminal-registry';

let appDiscovery: ReturnType<typeof discoverApps> | null = null;

const discoverApps = async () => {
	const [installedEditors, installedCodingAgents] = await Promise.all([
		getAvailableEditors(),
		getAvailableCodingAgents(),
	]);
	const [runningEditors, runningCodingAgents] = await Promise.all([
		getRunningEditors(installedEditors),
		getRunningCodingAgents(installedCodingAgents),
	]);
	return {
		installedEditors,
		installedCodingAgents,
		runningEditors,
		runningCodingAgents,
	};
};

// The terminal helper and Studio requests share the same in-flight discovery
// and process snapshot. Only share in-flight discovery so running apps stay current.
export const getAppDiscovery = () => {
	appDiscovery ??= discoverApps().finally(() => {
		appDiscovery = null;
	});
	return appDiscovery;
};

export const getEditorInfo = async (
	configuredEditor: DefaultEditor | null,
): Promise<GetDefaultEditorInfoResponse> => {
	const {installedEditors, runningEditors} = await getAppDiscovery();
	const customEditor =
		configuredEditor &&
		typeof configuredEditor === 'object' &&
		resolveCustomEditorExecutable(configuredEditor)
			? configuredEditor
			: null;
	return {
		defaultEditor:
			configuredEditor && typeof configuredEditor === 'object'
				? 'custom'
				: configuredEditor,
		runningEditors,
		installedEditors: [
			...installedEditors.map(({id, name, nameWithType}) => ({
				id,
				name,
				nameWithType,
			})),
			...(customEditor
				? [
						{
							id: 'custom' as const,
							name: customEditor.name,
							nameWithType: customEditor.name,
						},
					]
				: []),
		],
	};
};

export const getAppInfo = async ({
	defaultEditor,
	defaultCodingAgent,
}: {
	defaultEditor: DefaultEditor | null;
	defaultCodingAgent: DefaultCodingAgent | null;
}): Promise<GetAppInfoResponse> => {
	const [editorInfo, discovery, installedTerminals, installedGitClients] =
		await Promise.all([
			getEditorInfo(defaultEditor),
			getAppDiscovery(),
			getAvailableTerminals(),
			getAvailableGitClients(),
		]);
	return {
		editorInfo,
		codingAgentInfo: {
			defaultCodingAgent,
			runningCodingAgents: discovery.runningCodingAgents,
			installedCodingAgents: discovery.installedCodingAgents.map(
				({id, name, nameWithType}) => ({id, name, nameWithType}),
			),
			installedTerminals: installedTerminals.map(({id, name}) => ({id, name})),
			installedGitClients: installedGitClients.map(({id, name}) => ({
				id,
				name,
			})),
		},
	};
};
