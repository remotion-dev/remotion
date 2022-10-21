import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';
import {QuickSwitcherContent} from './QuickSwitcherContent';

const QuickSwitcher: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<QuickSwitcherContent />
		</ModalContainer>
	);
};

export default QuickSwitcher;
