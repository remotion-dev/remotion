import type {DefaultEditor} from '@remotion/renderer';
import type {GetDefaultEditorInfoResponse} from '@remotion/studio-shared';
import {
	getAvailableCodingAgents,
	getRunningCodingAgents,
} from './coding-agent-registry';
import {resolveCustomEditorExecutable} from './custom-editor';
import {getAvailableEditors, getRunningEditors} from './editor-registry';

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
// and process snapshot. Configuration and app history are read separately.
export const getAppDiscovery = () => {
	appDiscovery ??= discoverApps();
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
