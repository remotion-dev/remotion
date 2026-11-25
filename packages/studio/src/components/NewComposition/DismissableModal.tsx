import React, {useCallback, useContext} from 'react';
import {SetSelectedModalContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';

export const useDismissModal = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	return useCallback(() => setSelectedModal(null), [setSelectedModal]);
};

export const DismissableModal: React.FC<{
	readonly children: React.ReactNode;
	readonly panelStyle?: React.CSSProperties;
	readonly ariaLabel?: string;
}> = ({children, panelStyle, ariaLabel}) => {
	const onQuit = useDismissModal();

	return (
		<ModalContainer
			ariaLabel={ariaLabel}
			onOutsideClick={onQuit}
			onEscape={onQuit}
			panelStyle={panelStyle}
		>
			{children}
		</ModalContainer>
	);
};
