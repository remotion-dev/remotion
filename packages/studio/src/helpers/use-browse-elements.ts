import {useCallback, useContext} from 'react';
import {useSettings} from '../components/SettingsContext';
import {SetSelectedModalContext} from '../state/modals';
import {getBrowserStudioOperations} from './browser-studio-operations';
import {StudioServerConnectionCtx} from './client-id';
import {
	REMOTION_ELEMENTS_URL,
	THIRD_PARTY_ELEMENTS_URL,
} from './element-libraries';
import {getElementLibraryLabel} from './get-element-library-label';
import {canEditStudioConfig} from './settings-tab-availability';

export const useBrowseElements = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig, addElementLibrary} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);

	return useCallback(() => {
		const library = studioRuntimeConfig?.elementLibraries[0];
		if (library) {
			setSelectedModal({
				type: 'element-library',
				name: getElementLibraryLabel(library),
				url: library.url,
			});
			return;
		}

		const canAdd = canEditStudioConfig({
			isBrowserStudio: getBrowserStudioOperations() !== null,
			previewServerConnected: previewServerState.type === 'connected',
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
		if (canAdd) {
			addElementLibrary({
				url: REMOTION_ELEMENTS_URL,
				displayName: 'Remotion Elements',
				captionStylesUrl: null,
			});
		}

		setSelectedModal({
			type: 'element-library',
			name: canAdd ? 'Remotion Elements' : 'Explore',
			url: canAdd ? REMOTION_ELEMENTS_URL : THIRD_PARTY_ELEMENTS_URL,
		});
	}, [
		addElementLibrary,
		previewServerState.type,
		setSelectedModal,
		studioRuntimeConfig,
	]);
};
