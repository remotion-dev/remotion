import React, {useCallback, useContext} from 'react';
import {SetSelectedModalContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';

export const DismissableModal: React.FC<{
	readonly children: React.ReactNode;
	readonly panelStyle?: React.CSSProperties;
}> = ({children, panelStyle}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<ModalContainer
			onOutsideClick={onQuit}
			onEscape={onQuit}
			panelStyle={panelStyle}
		>
			{children}
		</ModalContainer>
	);
};
