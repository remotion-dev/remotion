import React, {useCallback} from 'react';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {
	openInCodingAgent,
	openOriginalPositionInEditor,
} from '../../helpers/open-in-editor';
import {ContextMenu} from '../ContextMenu';
import {getSourceContextMenuItems} from '../get-source-context-menu-items';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {useOpenInMenuApps} from '../use-open-in-menu-apps';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import type {TimelineSelectionInteraction} from './TimelineSelection';

export const TimelineEffectsContextMenu: React.FC<{
	readonly children: React.ReactNode;
	readonly onSelect:
		| ((interaction: TimelineSelectionInteraction) => void)
		| null;
	readonly validatedLocation: CodePosition;
}> = ({children, onSelect, validatedLocation}) => {
	const {openInApps} = useOpenInMenuApps();
	const getItems = useCallback((): ComboboxValue[] => {
		onSelect?.({shiftKey: false, toggleKey: false});

		const contextForAgents = formatContextForAgents({
			location: validatedLocation,
			name: 'Effects',
			root: window.remotion_cwd,
		});

		return [
			...getSourceContextMenuItems({
				canOpenInEditor: openInApps.canOpenInEditor,
				codingAgentInfo: openInApps.codingAgentInfo,
				contextForAgents,
				editorInfo: openInApps.editorInfo,
				onConfigureApps: openInApps.onConfigureApps,
				openInCodingAgent: (codingAgentId, codingAgentName, context) => {
					openInCodingAgent(codingAgentId, context)
						.then((response) => {
							if (!response.success) {
								showNotification(`Could not open ${codingAgentName}`, 2000);
							}
						})
						.catch((error) => {
							showNotification((error as Error).message, 2000);
						});
				},
				openInEditor: (editorId) => {
					const resolvedEditorId = editorId ?? openInApps.defaultEditorId;
					if (!openInApps.canOpenInEditor || !resolvedEditorId) {
						return;
					}

					openOriginalPositionInEditor(
						validatedLocation,
						resolvedEditorId,
					).catch((error) => {
						showNotification((error as Error).message, 2000);
					});
				},
				originalLocation: validatedLocation,
			}),
			getCopyContextForAgentsMenuItem({contextForAgents}),
		];
	}, [openInApps, onSelect, validatedLocation]);

	return <ContextMenu getItems={getItems}>{children}</ContextMenu>;
};
