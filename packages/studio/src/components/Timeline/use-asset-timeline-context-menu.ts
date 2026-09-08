import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {getFileManagerName} from '../../helpers/get-file-manager-name';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from '../RenderQueue/actions';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';

export const useAssetTimelineContextMenu = (): ComboboxValue[] | null => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {previewServerState} = useContext(StudioServerConnectionCtx);

	return useMemo(() => {
		if (canvasContent?.type !== 'asset') {
			return null;
		}

		const copyContextItem = getCopyContextForAgentsMenuItem({
			contextForAgents: window.remotion_publicFolderExists
				? `Asset: ${window.remotion_publicFolderExists}/${canvasContent.asset}`
				: `Asset: staticFile(${JSON.stringify(canvasContent.asset)})`,
		});

		if (getBrowserStudioOperations() !== null) {
			return [copyContextItem];
		}

		return [
			{
				type: 'item',
				id: 'open-asset-in-explorer',
				label: `Show in ${getFileManagerName(window.remotion_fileSystemPlatform)}`,
				keyHint: null,
				leftItem: null,
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'open-asset-in-explorer',
				disabled:
					Boolean(window.remotion_isReadOnlyStudio) ||
					!window.remotion_publicFolderExists ||
					previewServerState.type !== 'connected',
				onClick: () => {
					openInFileExplorer({
						directory:
							window.remotion_publicFolderExists + '/' + canvasContent.asset,
					}).catch((err) => {
						showNotification(`Could not open file: ${err.message}`, 2000);
					});
				},
			},
			copyContextItem,
		];
	}, [canvasContent, previewServerState.type]);
};
