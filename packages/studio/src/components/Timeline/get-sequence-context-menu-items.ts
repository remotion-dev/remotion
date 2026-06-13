import type {ResolvedStackLocation, TSequence} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import type {TimelineAssetLinkInfo} from './timeline-asset-link';
import {openTimelineAssetLink} from './timeline-asset-link';

export const getSequenceContextMenuItems = ({
	assetLinkInfo,
	canOpenInEditor,
	deleteDisabled,
	disableInteractivityDisabled,
	duplicateDisabled,
	fileLocation,
	includeSourceEditItems,
	onDeleteSequenceFromSource,
	onDisableSequenceInteractivity,
	onDuplicateSequenceFromSource,
	openInEditor,
	originalLocation,
	selectAsset,
	sequence,
}: {
	readonly assetLinkInfo: TimelineAssetLinkInfo | null;
	readonly canOpenInEditor: boolean;
	readonly deleteDisabled: boolean;
	readonly disableInteractivityDisabled: boolean;
	readonly duplicateDisabled: boolean;
	readonly fileLocation: string | null;
	readonly includeSourceEditItems: boolean;
	readonly onDeleteSequenceFromSource: () => void;
	readonly onDisableSequenceInteractivity: () => void;
	readonly onDuplicateSequenceFromSource: () => void;
	readonly openInEditor: () => void;
	readonly originalLocation: ResolvedStackLocation | null;
	readonly selectAsset: (src: string) => void;
	readonly sequence: TSequence;
}): ComboboxValue[] => {
	const editorName = window.remotion_editorName;
	const {documentationLink} = sequence;

	return [
		editorName
			? {
					type: 'item' as const,
					id: 'show-in-editor',
					keyHint: null,
					label: `Show in ${editorName}`,
					leftItem: null,
					disabled: !canOpenInEditor || !originalLocation,
					onClick: openInEditor,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'show-in-editor',
				}
			: null,
		{
			type: 'item' as const,
			id: 'copy-file-location',
			keyHint: null,
			label: 'Copy file location',
			leftItem: null,
			disabled: !fileLocation,
			onClick: () => {
				if (!fileLocation) {
					return;
				}

				navigator.clipboard
					.writeText(fileLocation)
					.then(() => {
						showNotification('Copied file location to clipboard', 1000);
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
			value: 'copy-file-location',
		},
		documentationLink
			? {
					type: 'item' as const,
					id: 'open-component-docs',
					keyHint: null,
					label: 'Open component docs',
					leftItem: null,
					disabled: false,
					onClick: () => {
						window.open(documentationLink, '_blank', 'noopener,noreferrer');
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'open-component-docs',
				}
			: null,
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
		documentationLink || assetLinkInfo
			? {
					type: 'divider' as const,
					id: 'sequence-link-divider',
				}
			: null,
		{
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
		},
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'duplicate-sequence',
					keyHint: null,
					label: 'Duplicate',
					leftItem: null,
					disabled: duplicateDisabled,
					onClick: onDuplicateSequenceFromSource,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'duplicate-sequence',
				}
			: null,
		includeSourceEditItems
			? {
					type: 'item' as const,
					id: 'delete-sequence',
					keyHint: null,
					label: 'Delete',
					leftItem: null,
					disabled: deleteDisabled,
					onClick: onDeleteSequenceFromSource,
					quickSwitcherLabel: null,
					subMenu: null,
					value: 'delete-sequence',
				}
			: null,
	].filter(NoReactInternals.truthy);
};
