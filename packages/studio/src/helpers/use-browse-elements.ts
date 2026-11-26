import {useCallback, useContext} from 'react';
import {useSettings} from '../components/SettingsContext';
import {SetSelectedModalContext} from '../state/modals';
import {ELEMENT_LIBRARIES_URL} from './element-libraries';
import {getElementLibraryLabel} from './get-element-library-label';

export const useBrowseElements = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig} = useSettings();

	return useCallback(() => {
		const library = studioRuntimeConfig?.elementLibraries[0];
		setSelectedModal({
			type: 'element-library',
			name: library ? getElementLibraryLabel(library) : 'Explore',
			url: library ? library.url : ELEMENT_LIBRARIES_URL,
		});
	}, [setSelectedModal, studioRuntimeConfig]);
};
