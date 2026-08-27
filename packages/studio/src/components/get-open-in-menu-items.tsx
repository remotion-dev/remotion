import type {DefaultCodingAgent} from '@remotion/renderer';
import type {GitClientId, TerminalId} from '@remotion/studio-shared';
import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React from 'react';
import {NoReactInternals} from 'remotion/no-react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {openGitSource} from '../helpers/get-git-menu-item';
import {EditorIcon} from '../icons/editor';
import {FinderIcon} from '../icons/finder';
import {GitClientIcon} from '../icons/git-client';
import {GitHubIcon} from '../icons/github';
import {TerminalIcon} from '../icons/terminal';
import {CodingAgentIcon} from './CodingAgentIcon';
import type {ComboboxValue} from './NewComposition/ComboBox';

const menuLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '16px',
};

export const getOpenInMenuItems = ({
	codingAgentInfo,
	editorDisabled,
	editorInfo,
	excludeCodingAgentId,
	excludeEditorId,
	fileManagerDisabled,
	folder,
	location,
	onConfigureApps,
	onOpenInCodingAgent,
	onOpenInEditor,
	onOpenInFileExplorer,
	onOpenInGitClient,
	onOpenInTerminal,
}: {
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorDisabled: boolean;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly excludeCodingAgentId: DefaultCodingAgent | null;
	readonly excludeEditorId: EditorPickerId | null;
	readonly fileManagerDisabled: boolean;
	readonly folder: boolean;
	readonly location: OriginalPosition | null;
	readonly onConfigureApps: (() => void) | null;
	readonly onOpenInCodingAgent: (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
	) => void;
	readonly onOpenInEditor: (editorId: EditorPickerId) => void;
	readonly onOpenInFileExplorer: () => void;
	readonly onOpenInGitClient: (gitClientId: GitClientId) => void;
	readonly onOpenInTerminal: ((terminalId: TerminalId) => void) | null;
}): ComboboxValue[] => {
	const showFinder = window.remotion_fileSystemPlatform === 'darwin';
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);
	const editors: ComboboxValue[] = (editorInfo?.installedEditors ?? [])
		.filter((editor) => editor.id !== excludeEditorId)
		.map((editor) => ({
			disabled: editorDisabled,
			id: `open-in-${editor.id}`,
			keyHint: null,
			label: <span style={menuLabel}>{editor.name}</span>,
			leftItem: <EditorIcon editorId={editor.id} size={18} />,
			onClick: () => {
				if (!editorDisabled) {
					onOpenInEditor(editor.id);
				}
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: editor.id,
		}));
	const codingAgents: ComboboxValue[] = (
		codingAgentInfo?.installedCodingAgents ?? []
	)
		.filter((codingAgent) => codingAgent.id !== excludeCodingAgentId)
		.map((codingAgent) => ({
			id: `open-in-coding-agent-${codingAgent.id}`,
			keyHint: null,
			label: <span style={menuLabel}>{codingAgent.name}</span>,
			leftItem: <CodingAgentIcon codingAgentId={codingAgent.id} size={18} />,
			onClick: () =>
				onOpenInCodingAgent(codingAgent.id, codingAgent.nameWithType),
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: `coding-agent-${codingAgent.id}`,
		}));
	const terminals = folder ? (codingAgentInfo?.installedTerminals ?? []) : [];
	const gitClients = folder ? (codingAgentInfo?.installedGitClients ?? []) : [];
	const gitHubItem: ComboboxValue | null = window.remotion_gitSource
		? {
				id: 'open-in-github',
				keyHint: null,
				label: <span style={menuLabel}>GitHub.com</span>,
				leftItem: <GitHubIcon size={18} />,
				onClick: () => {
					openGitSource({folder, location});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item' as const,
				value: 'github',
			}
		: null;
	const systemApps: ComboboxValue[] = [
		gitHubItem,
		showFinder
			? {
					disabled: fileManagerDisabled,
					id: 'open-in-file-explorer',
					keyHint: null,
					label: <span style={menuLabel}>{fileManagerName}</span>,
					leftItem: <FinderIcon size={18} />,
					onClick: () => {
						if (!fileManagerDisabled) {
							onOpenInFileExplorer();
						}
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item' as const,
					value: 'file-explorer',
				}
			: null,
	].filter(NoReactInternals.truthy);
	const hasCategorizedApps =
		editors.length > 0 ||
		codingAgents.length > 0 ||
		terminals.length > 0 ||
		gitClients.length > 0;

	return [
		...(editors.length > 0
			? [
					{
						type: 'section-header' as const,
						id: 'editor-header',
						label: 'Editor',
					},
					...editors,
				]
			: []),
		...(codingAgents.length > 0
			? [
					{
						type: 'section-header' as const,
						id: 'agent-header',
						label: 'Agent',
					},
					...codingAgents,
				]
			: []),
		...(terminals.length > 0
			? [
					{
						type: 'section-header' as const,
						id: 'terminal-header',
						label: 'Terminal',
					},
					...terminals.map((terminal) => ({
						id: `open-in-terminal-${terminal.id}`,
						keyHint: null,
						label: <span style={menuLabel}>{terminal.name}</span>,
						leftItem: <TerminalIcon terminalId={terminal.id} size={18} />,
						onClick: () => onOpenInTerminal?.(terminal.id),
						quickSwitcherLabel: null,
						subMenu: null,
						type: 'item' as const,
						value: `terminal-${terminal.id}`,
					})),
				]
			: []),
		...(gitClients.length > 0
			? [
					{
						type: 'section-header' as const,
						id: 'git-client-header',
						label: 'Git Client',
					},
					...gitClients.map((gitClient) => ({
						id: `open-in-git-client-${gitClient.id}`,
						keyHint: null,
						label: <span style={menuLabel}>{gitClient.name}</span>,
						leftItem: <GitClientIcon gitClientId={gitClient.id} size={18} />,
						onClick: () => onOpenInGitClient(gitClient.id),
						quickSwitcherLabel: null,
						subMenu: null,
						type: 'item' as const,
						value: `git-client-${gitClient.id}`,
					})),
				]
			: []),
		...(systemApps.length > 0
			? [
					...(hasCategorizedApps
						? [
								{
									type: 'divider' as const,
									id: 'open-in-system-apps-divider',
								},
							]
						: []),
					...systemApps,
				]
			: []),
		...(onConfigureApps && (hasCategorizedApps || systemApps.length > 0)
			? [{type: 'divider' as const, id: 'open-in-settings-divider'}]
			: []),
		onConfigureApps
			? {
					id: 'change-default-apps',
					keyHint: null,
					label: <span style={menuLabel}>Change default apps...</span>,
					leftItem: null,
					onClick: onConfigureApps,
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item' as const,
					value: 'change-default-apps',
				}
			: null,
	].filter(NoReactInternals.truthy);
};
