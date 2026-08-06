import type {DefaultCodingAgent} from '@remotion/renderer';
import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React from 'react';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {EditorIcon} from '../icons/editor';
import {FinderIcon} from '../icons/finder';
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
	onConfigureApps,
	onOpenInCodingAgent,
	onOpenInEditor,
	onOpenInFileExplorer,
}: {
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorDisabled: boolean;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly excludeCodingAgentId: DefaultCodingAgent | null;
	readonly excludeEditorId: EditorPickerId | null;
	readonly fileManagerDisabled: boolean;
	readonly onConfigureApps: () => void;
	readonly onOpenInCodingAgent: (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
	) => void;
	readonly onOpenInEditor: (editorId: EditorPickerId) => void;
	readonly onOpenInFileExplorer: () => void;
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
			leftItem: <CodingAgentIcon iconDataUrl={codingAgent.iconDataUrl} />,
			onClick: () =>
				onOpenInCodingAgent(codingAgent.id, codingAgent.nameWithType),
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: `coding-agent-${codingAgent.id}`,
		}));

	return [
		...(editors.length > 0
			? [
					{
						type: 'section-header' as const,
						id: 'editors-header',
						label: 'Editors',
					},
					...editors,
				]
			: []),
		...(codingAgents.length > 0
			? [
					{
						type: 'section-header' as const,
						id: 'agents-header',
						label: 'Agents',
					},
					...codingAgents,
				]
			: []),
		...(showFinder
			? [
					...(editors.length > 0 || codingAgents.length > 0
						? [
								{
									type: 'divider' as const,
									id: 'open-in-file-explorer-divider',
								},
							]
						: []),
					{
						disabled: fileManagerDisabled,
						id: 'open-in-file-explorer',
						keyHint: null,
						label: <span style={menuLabel}>{fileManagerName}</span>,
						leftItem: <FinderIcon />,
						onClick: () => {
							if (!fileManagerDisabled) {
								onOpenInFileExplorer();
							}
						},
						quickSwitcherLabel: null,
						subMenu: null,
						type: 'item' as const,
						value: 'file-explorer',
					},
				]
			: []),
		...(editors.length > 0 || codingAgents.length > 0 || showFinder
			? [{type: 'divider' as const, id: 'open-in-settings-divider'}]
			: []),
		{
			id: 'change-default-apps',
			keyHint: null,
			label: <span style={menuLabel}>Change default apps...</span>,
			leftItem: null,
			onClick: onConfigureApps,
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: 'change-default-apps',
		},
	];
};
