import React, {useCallback, useContext} from 'react';
import {LIGHT_TEXT, TRANSPARENT} from '../helpers/colors';
import {ModalsContext} from '../state/modals';
import {useZIndex} from '../state/z-index';

const buttonStyle: React.CSSProperties = {
	appearance: 'none',
	color: LIGHT_TEXT,
	border: 'none',
	fontWeight: 'bold',
	backgroundColor: TRANSPARENT,
	cursor: 'pointer',
	fontSize: 14,
	display: 'inline-flex',
	justifyContent: 'center',
	paddingLeft: 8,
	paddingRight: 8,
};

export const ConfigureLicenseNudge: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {tabIndex} = useZIndex();

	const openModal = useCallback(() => {
		setSelectedModal({
			type: 'configure-license',
		});
	}, [setSelectedModal]);

	if (readOnlyStudio || window.remotion_isReadOnlyStudio) {
		return null;
	}

	if (window.remotion_renderDefaults?.publicLicenseKey != null) {
		return null;
	}

	return (
		<button
			tabIndex={tabIndex}
			style={buttonStyle}
			onClick={openModal}
			type="button"
			title="Configure License"
		>
			Configure License
		</button>
	);
};
