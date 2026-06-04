import React, {useMemo} from 'react';
import type {TSequence} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {formatFileLocation} from '../../helpers/format-file-location';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {useOpenSequenceInEditor} from './use-open-sequence-in-editor';

export const getSequenceSourceContextMenuItems = ({
	canOpenInEditor,
	editorName,
	fileLocation,
	onCopyFileLocation,
	onShowInEditor,
}: {
	readonly canOpenInEditor: boolean;
	readonly editorName: string | null;
	readonly fileLocation: string | null;
	readonly onCopyFileLocation: () => void;
	readonly onShowInEditor: () => void;
}): ComboboxValue[] => {
	return [
		editorName
			? {
					type: 'item' as const,
					id: 'show-in-editor',
					keyHint: null,
					label: `Show in ${editorName}`,
					leftItem: null,
					disabled: !canOpenInEditor,
					onClick: onShowInEditor,
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
			onClick: onCopyFileLocation,
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'copy-file-location',
		},
	].filter(NoReactInternals.truthy);
};

export const useSequenceSourceContextMenuItems = (
	sequence: TSequence,
): {
	readonly canOpenInEditor: boolean;
	readonly fileLocation: string | null;
	readonly openInEditor: () => void;
	readonly originalLocation: OriginalPosition | null;
	readonly sequenceSourceContextMenuItems: ComboboxValue[];
} => {
	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInEditor(sequence);
	const fileLocation = useMemo(
		() =>
			formatFileLocation({
				location: originalLocation,
				root: window.remotion_cwd,
			}),
		[originalLocation],
	);

	const onCopyFileLocation = React.useCallback(() => {
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
	}, [fileLocation]);

	const sequenceSourceContextMenuItems = useMemo(
		() =>
			getSequenceSourceContextMenuItems({
				canOpenInEditor,
				editorName: window.remotion_editorName,
				fileLocation,
				onCopyFileLocation,
				onShowInEditor: openInEditor,
			}),
		[canOpenInEditor, fileLocation, onCopyFileLocation, openInEditor],
	);

	return {
		canOpenInEditor,
		fileLocation,
		openInEditor,
		originalLocation,
		sequenceSourceContextMenuItems,
	};
};
