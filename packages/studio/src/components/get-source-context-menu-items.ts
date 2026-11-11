import type {DefaultCodingAgent} from '@remotion/renderer';
import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {
	getDefaultOpenInTarget,
	getGitSourceName,
	openGitSource,
} from '../helpers/get-git-menu-item';
import {
	resolveSourceLocation,
	type SourceLocationTarget,
} from '../helpers/open-in-editor';
import {getOpenInMenuItems} from './get-open-in-menu-items';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {getPreferredEditorId} from './use-default-editor-info';

export const getSourceContextMenuItems = ({
	canOpenInEditor,
	codingAgentInfo,
	contextForAgents,
	editorInfo,
	onConfigureApps,
	openInCodingAgent,
	openInEditor,
	originalLocation,
	sourceTarget,
}: {
	readonly canOpenInEditor: boolean;
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly contextForAgents: string | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly onConfigureApps: (() => void) | null;
	readonly openInCodingAgent: (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
		contextForAgents: string | null,
	) => void;
	readonly openInEditor: (editorId: EditorPickerId | null) => void;
	readonly originalLocation: OriginalPosition | null;
	readonly sourceTarget: SourceLocationTarget | null;
}): ComboboxValue[] => {
	const installedEditors = editorInfo?.installedEditors ?? [];
	const defaultEditorId = getPreferredEditorId(editorInfo);
	const defaultEditor = installedEditors.find(
		(editor) => editor.id === defaultEditorId,
	);
	const editorName = defaultEditor?.nameWithType ?? null;
	const defaultOpenInTarget = getDefaultOpenInTarget({canOpenInEditor});
	const gitSourceName = window.remotion_gitSource
		? getGitSourceName(window.remotion_gitSource)
		: null;
	const defaultOpenInName =
		defaultOpenInTarget === 'editor' ? editorName : gitSourceName;
	const openInCodingAgentWithContext = (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
	) => {
		openInCodingAgent(
			codingAgentId,
			codingAgentName,
			codingAgentId === 'copilot' ? null : contextForAgents,
		);
	};

	const openInGitSource = async () => {
		if (!originalLocation?.source) return;
		if (sourceTarget === null) {
			openGitSource({folder: false, location: originalLocation});
			return;
		}

		try {
			const location = await resolveSourceLocation({
				originalPosition: {
					source: originalLocation.source,
					line: originalLocation.line ?? 1,
					column: originalLocation.column ?? 1,
				},
				property: sourceTarget?.property ?? null,
				effectIndex: sourceTarget?.effectIndex ?? null,
			});
			openGitSource({folder: false, location});
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	};

	const openInMenuItems = getOpenInMenuItems({
		canOpenDesktopApps: onConfigureApps !== null,
		codingAgentInfo,
		editorDisabled: !canOpenInEditor || !originalLocation?.source,
		editorInfo,
		excludeCodingAgentId: null,
		excludeEditorId: defaultEditorId,
		excludeGitSource: defaultOpenInTarget === 'git-source',
		fileManagerDisabled: !originalLocation?.source,
		folder: false,
		gitSourceDisabled: !originalLocation?.source,
		onConfigureApps,
		onOpenInCodingAgent: openInCodingAgentWithContext,
		onOpenInEditor: openInEditor,
		onOpenInFileExplorer: () => {
			if (!originalLocation?.source) {
				return;
			}

			openInFileExplorer({directory: originalLocation.source}).catch((err) => {
				showNotification(`Could not open file: ${err.message}`, 2000);
			});
		},
		onOpenInGitClient: () => undefined,
		onOpenInGitSource: () => {
			openInGitSource();
		},
		onOpenInTerminal: null,
	});

	return [
		defaultOpenInTarget && defaultOpenInName
			? {
					type: 'item' as const,
					id:
						defaultOpenInTarget === 'editor'
							? 'open-in-editor'
							: 'open-in-git-source',
					keyHint: null,
					label: `Open in ${defaultOpenInName}`,
					leftItem: null,
					disabled: !originalLocation?.source,
					onClick: () => {
						if (defaultOpenInTarget === 'editor') {
							openInEditor(null);
							return;
						}

						openInGitSource();
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value:
						defaultOpenInTarget === 'editor'
							? 'open-in-editor'
							: 'open-in-git-source',
				}
			: null,
		openInMenuItems.length > 0
			? {
					type: 'item' as const,
					id: 'open-in-another-app',
					keyHint: null,
					label: 'Open in...',
					leftItem: null,
					disabled: !originalLocation?.source,
					onClick: () => undefined,
					quickSwitcherLabel: null,
					subMenu: {
						items: openInMenuItems,
						leaveLeftSpace: true,
						preselectIndex: false as const,
					},
					value: 'open-in-another-app',
				}
			: null,
	].filter(NoReactInternals.truthy);
};
