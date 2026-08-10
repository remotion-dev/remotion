import type {DefaultCodingAgent} from '@remotion/renderer';
import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import type {ResolvedStackLocation, TSequence} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {getOpenInMenuItems} from '../get-open-in-menu-items';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from '../RenderQueue/actions';
import type {TimelineAssetLinkInfo} from './timeline-asset-link';
import {openTimelineAssetLink} from './timeline-asset-link';

const normalizeMenuDividers = (items: ComboboxValue[]): ComboboxValue[] => {
	const normalized: ComboboxValue[] = [];

	for (const item of items) {
		if (item.type === 'divider') {
			const previousItem = normalized[normalized.length - 1];
			if (!previousItem || previousItem.type === 'divider') {
				continue;
			}
		}

		normalized.push(item);
	}

	if (normalized[normalized.length - 1]?.type === 'divider') {
		normalized.pop();
	}

	return normalized;
};

const interactiveSvgComponentIdentity = 'dev.remotion.remotion.Interactive.Svg';

export const getSequenceContextMenuItems = ({
	assetLinkInfo,
	canOpenInEditor,
	deleteDisabled,
	disableInteractivityDisabled,
	duplicateDisabled,
	isProgrammaticallyDuplicated,
	includeSourceEditItems,
	codingAgentInfo,
	editorInfo,
	onConfigureApps,
	onDeleteSequenceFromSource,
	onDisableSequenceInteractivity,
	onDuplicateSequenceFromSource,
	openInCodingAgent,
	openInEditor,
	originalLocation,
	selectAsset,
	sequence,
	sourceActions = [],
}: {
	readonly assetLinkInfo: TimelineAssetLinkInfo | null;
	readonly canOpenInEditor: boolean;
	readonly deleteDisabled: boolean;
	readonly disableInteractivityDisabled: boolean;
	readonly duplicateDisabled: boolean;
	readonly isProgrammaticallyDuplicated: boolean;
	readonly includeSourceEditItems: boolean;
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly onConfigureApps: (() => void) | null;
	readonly onDeleteSequenceFromSource: () => void;
	readonly onDisableSequenceInteractivity: () => void;
	readonly onDuplicateSequenceFromSource: () => void;
	readonly openInCodingAgent: (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
		contextForAgents: string | null,
	) => void;
	readonly openInEditor: (editorId: EditorPickerId | null) => void;
	readonly originalLocation: ResolvedStackLocation | null;
	readonly selectAsset: (src: string) => void;
	readonly sequence: TSequence;
	readonly sourceActions?: readonly ComboboxValue[];
}): ComboboxValue[] => {
	const editorName = window.remotion_editorName;
	const isInteractiveSvg =
		sequence.controls?.componentIdentity === interactiveSvgComponentIdentity;
	const installedEditors = editorInfo?.installedEditors ?? [];
	const defaultEditorId =
		installedEditors.find((editor) => editor.nameWithType === editorName)?.id ??
		null;
	const defaultCodingAgent = codingAgentInfo?.installedCodingAgents.find(
		(codingAgent) => codingAgent.id === codingAgentInfo.defaultCodingAgent,
	);
	const contextForAgents = formatContextForAgents({
		location: originalLocation,
		name: sequence.displayName || sequence.controls?.componentName || null,
		root: window.remotion_cwd,
	});
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

	const openInMenuItems = onConfigureApps
		? getOpenInMenuItems({
				codingAgentInfo,
				editorDisabled: !canOpenInEditor || !originalLocation,
				editorInfo,
				excludeCodingAgentId: defaultCodingAgent?.id ?? null,
				excludeEditorId: defaultEditorId,
				fileManagerDisabled: !originalLocation?.source,
				onConfigureApps,
				onOpenInCodingAgent: openInCodingAgentWithContext,
				onOpenInEditor: openInEditor,
				onOpenInFileExplorer: () => {
					if (!originalLocation?.source) {
						return;
					}

					openInFileExplorer({directory: originalLocation.source}).catch(
						(err) => {
							showNotification(`Could not open file: ${err.message}`, 2000);
						},
					);
				},
			})
		: [];

	const items = [
		editorName
			? {
					type: 'item' as const,
					id: 'open-in-editor',
					keyHint: null,
					label: `Open in ${editorName}`,
					leftItem: null,
					disabled: !canOpenInEditor || !originalLocation,
					onClick: () => openInEditor(null),
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'open-in-editor',
				}
			: null,
		defaultCodingAgent
			? {
					type: 'item' as const,
					id: 'open-in-default-coding-agent',
					keyHint: null,
					label: `Open in ${defaultCodingAgent.nameWithType}`,
					leftItem: null,
					disabled: false,
					onClick: () =>
						openInCodingAgentWithContext(
							defaultCodingAgent.id,
							defaultCodingAgent.nameWithType,
						),
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'open-in-default-coding-agent',
				}
			: null,
		onConfigureApps
			? {
					type: 'item' as const,
					id: 'open-in-another-app',
					keyHint: null,
					label: 'Open in...',
					leftItem: null,
					disabled: false,
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
		{
			type: 'item' as const,
			id: 'copy-context-for-agents',
			keyHint: null,
			label: 'Copy context for agents',
			leftItem: null,
			disabled: !contextForAgents,
			onClick: () => {
				if (!contextForAgents) {
					return;
				}

				navigator.clipboard.writeText(contextForAgents).catch((err) => {
					showNotification(
						`Could not copy to clipboard: ${(err as Error).message}`,
						1000,
					);
				});
			},
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'copy-context-for-agents',
		},
		assetLinkInfo
			? {
					type: 'item' as const,
					id: 'show-asset',
					keyHint: null,
					label: 'Show asset',
					leftItem: null,
					disabled: false,
					onClick: () => {
						openTimelineAssetLink(assetLinkInfo, selectAsset);
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'show-asset',
				}
			: null,
		assetLinkInfo
			? {
					type: 'divider' as const,
					id: 'sequence-link-divider',
				}
			: null,
		isInteractiveSvg
			? {
					type: 'item' as const,
					id: 'copy-svg',
					keyHint: null,
					label: 'Copy SVG',
					leftItem: null,
					disabled: !sequence.refForOutline?.current,
					onClick: () => {
						const svg = sequence.refForOutline?.current;
						if (!svg) {
							return;
						}

						navigator.clipboard
							.writeText(svg.outerHTML)
							.then(() => {
								showNotification('Copied SVG to clipboard', 1000);
							})
							.catch((err) => {
								showNotification(
									`Could not copy to clipboard: ${(err as Error).message}`,
									1000,
								);
							});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'copy-svg',
				}
			: null,
		isInteractiveSvg
			? {
					type: 'divider' as const,
					id: 'copy-svg-divider',
				}
			: null,
		sourceActions.length > 0
			? {
					type: 'divider' as const,
					id: 'sequence-source-actions-divider',
				}
			: null,
		...sourceActions,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'disable-interactivity',
					keyHint: null,
					label: 'Disable interactivity',
					leftItem: null,
					disabled: disableInteractivityDisabled,
					onClick: onDisableSequenceInteractivity,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'disable-interactivity',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'duplicate-sequence',
					keyHint: null,
					label: 'Duplicate',
					leftItem: null,
					disabled: duplicateDisabled || isProgrammaticallyDuplicated,
					onClick: onDuplicateSequenceFromSource,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'duplicate-sequence',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'divider' as const,
					id: 'sequence-duplicate-delete-divider',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'delete-sequence',
					keyHint: null,
					label: isProgrammaticallyDuplicated ? 'Delete all' : 'Delete',
					leftItem: null,
					disabled: deleteDisabled,
					onClick: onDeleteSequenceFromSource,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'delete-sequence',
				}
			: null,
	].filter(NoReactInternals.truthy);

	return normalizeMenuDividers(items);
};
