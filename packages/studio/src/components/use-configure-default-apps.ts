import {useCallback, useContext} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {SetSelectedModalContext} from '../state/modals';
import {canUseEditorPicker} from './use-default-editor-info';

export const useConfigureDefaultApps = (): (() => void) | null => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const configureDefaultApps = useCallback(() => {
		setSelectedModal({
			type: 'settings',
			initialTab: 'apps',
			initialPublicLicenseKey:
				window.remotion_renderDefaults?.publicLicenseKey ?? null,
		});
	}, [setSelectedModal]);

	return canUseEditorPicker(previewServerState.type === 'connected')
		? configureDefaultApps
		: null;
};
