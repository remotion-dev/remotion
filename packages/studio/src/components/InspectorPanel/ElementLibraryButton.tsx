import React from 'react';
import {useBrowseElements} from '../../helpers/use-browse-elements';
import {BrowseElementsIcon} from '../../icons/browse-elements';
import {
	InspectorQuickAction,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';

export const ElementLibraryButton: React.FC = () => {
	const openElementsLibrary = useBrowseElements();

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
