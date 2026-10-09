import type {DefaultCodingAgent} from '@remotion/renderer';
import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
	GitClientId,
	TerminalId,
} from '@remotion/studio-shared';
import React from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {LIGHT_TEXT} from '../helpers/colors';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {ClipboardIcon} from '../icons/clipboard';
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

const copyIcon: React.CSSProperties = {height: 16, width: 16};

export const getConfigureDefaultAppsMenuItems = ({
	hasPreviousItems,
	onConfigureApps,
}: {
	readonly hasPreviousItems: boolean;
	readonly onConfigureApps: (() => void) | null;
}): ComboboxValue[] => {
	if (!onConfigureApps) {
		return [];
	}

	return [
		...(hasPreviousItems
			? [{type: 'divider' as const, id: 'open-in-settings-divider'}]
			: []),
		{
			id: 'change-default-apps',
			keyHint: null,
			label: <span style={menuLabel}>Configure default apps...</span>,
			leftItem: null,
			onClick: onConfigureApps,
			quickSwitcherLabel: 'Configure default apps...',
			subMenu: null,
			type: 'item' as const,
			value: 'change-default-apps',
		},
	];
};

export const getOpenInMenuItems = ({
	canOpenDesktopApps,
	codingAgentInfo,
	editorDisabled,
	editorInfo,
	excludeCodingAgentId,
	excludeEditorId,
	excludeGitSource,
	fileManagerDisabled,
	folder,
	gitSourceDisabled,
	onConfigureApps,
	onCopyPath,
	onOpenInCodingAgent,
	onOpenInEditor,
	onOpenInFileExplorer,
	onOpenInGitClient,
	onOpenInGitSource,
	onOpenInTerminal,
}: {
	readonly canOpenDesktopApps: boolean;
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorDisabled: boolean;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly excludeCodingAgentId: DefaultCodingAgent | null;
	readonly excludeEditorId: EditorPickerId | null;
	readonly excludeGitSource: boolean;
	readonly fileManagerDisabled: boolean;
	readonly folder: boolean;
	readonly gitSourceDisabled: boolean;
	readonly onConfigureApps: (() => void) | null;
	readonly onCopyPath?: () => void;
	readonly onOpenInCodingAgent: (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
	) => void;
	readonly onOpenInEditor: (editorId: EditorPickerId) => void;
	readonly onOpenInFileExplorer: () => void;
	readonly onOpenInGitClient: (gitClientId: GitClientId) => void;
	readonly onOpenInGitSource: () => void;
	readonly onOpenInTerminal: ((terminalId: TerminalId) => void) | null;
}): ComboboxValue[] => {
	const showFinder =
		canOpenDesktopApps && window.remotion_fileSystemPlatform === 'darwin';
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);
	const editors: ComboboxValue[] = (
		canOpenDesktopApps ? (editorInfo?.installedEditors ?? []) : []
	)
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
			quickSwitcherLabel: `Open in ${editor.name}`,
			subMenu: null,
			type: 'item' as const,
			value: editor.id,
		}));
	const codingAgents: ComboboxValue[] = (
		canOpenDesktopApps ? (codingAgentInfo?.installedCodingAgents ?? []) : []
	)
		.filter((codingAgent) => codingAgent.id !== excludeCodingAgentId)
		.map((codingAgent) => ({
			id: `open-in-coding-agent-${codingAgent.id}`,
			keyHint: null,
			label: <span style={menuLabel}>{codingAgent.name}</span>,
			leftItem: <CodingAgentIcon codingAgentId={codingAgent.id} size={18} />,
			onClick: () =>
				onOpenInCodingAgent(codingAgent.id, codingAgent.nameWithType),
			quickSwitcherLabel: `Open in ${codingAgent.nameWithType}`,
			subMenu: null,
			type: 'item' as const,
			value: `coding-agent-${codingAgent.id}`,
		}));
	const terminals =
		canOpenDesktopApps && folder
			? (codingAgentInfo?.installedTerminals ?? [])
			: [];
	const gitClients =
		canOpenDesktopApps && folder
			? (codingAgentInfo?.installedGitClients ?? [])
			: [];
	const gitHubItem: ComboboxValue | null =
		window.remotion_gitSource && !excludeGitSource
			? {
					disabled: gitSourceDisabled,
					id: 'open-in-github',
					keyHint: null,
					label: <span style={menuLabel}>GitHub.com</span>,
					leftItem: <GitHubIcon size={16} />,
					onClick: () => {
						if (!gitSourceDisabled) {
							onOpenInGitSource();
						}
					},
					quickSwitcherLabel: 'Open in GitHub.com',
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
					quickSwitcherLabel: `Open in ${fileManagerName}`,
					subMenu: null,
					type: 'item' as const,
					value: 'file-explorer',
				}
			: null,
		onCopyPath
			? {
					id: 'copy-path',
					keyHint: null,
					label: <span style={menuLabel}>Copy path</span>,
					leftItem: <ClipboardIcon color={LIGHT_TEXT} style={copyIcon} />,
					onClick: onCopyPath,
					quickSwitcherLabel: 'Copy path',
					subMenu: null,
					type: 'item' as const,
					value: 'copy-path',
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
						quickSwitcherLabel: `Open in ${terminal.name}`,
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
						quickSwitcherLabel: `Open in ${gitClient.name}`,
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
		...getConfigureDefaultAppsMenuItems({
			hasPreviousItems: hasCategorizedApps || systemApps.length > 0,
			onConfigureApps,
		}),
	].filter(NoReactInternals.truthy);
};
