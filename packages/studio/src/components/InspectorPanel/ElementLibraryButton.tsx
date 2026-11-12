import React, {useCallback, useContext} from 'react';
import {BrowseElementsIcon} from '../../icons/browse-elements';
import {SetSelectedModalContext} from '../../state/modals';
import {REMOTION_ELEMENTS_URL} from '../ElementLibrariesSettings';
import {
	InspectorQuickAction,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';

export const ElementLibraryButton: React.FC = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const openElementsLibrary = useCallback(() => {
		setSelectedModal({
			type: 'element-library',
			view: 'library',
			name: 'Remotion Elements',
			url: REMOTION_ELEMENTS_URL,
		});
	}, [setSelectedModal]);

	return (
		<InspectorQuickAction
			disabled={false}
			iconContainerStyle={largeInspectorActionIconContainerStyle}
			onClick={openElementsLibrary}
			renderIcon={(color) => (
				<BrowseElementsIcon
					color={color}
					style={largeInspectorActionIconStyle}
				/>
			)}
		>
			Browse Elements
		</InspectorQuickAction>
	);
};
