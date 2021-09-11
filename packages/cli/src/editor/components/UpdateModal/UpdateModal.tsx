import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';

export const UpdateModal: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);
	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="Update available" />
		</ModalContainer>
	);
};
