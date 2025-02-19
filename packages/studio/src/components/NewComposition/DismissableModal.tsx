import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';

export const DismissableModal: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			{children}
		</ModalContainer>
	);
};
