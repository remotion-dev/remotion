import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {ModalContainer} from '../ModalContainer';
import type {QuickSwitcherMode} from './NoResults';
import {QuickSwitcherContent} from './QuickSwitcherContent';

const QuickSwitcher: React.FC<{
	initialMode: QuickSwitcherMode;
	invocationTimestamp: number;
}> = ({initialMode, invocationTimestamp}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	// Separate child component to correctly capture keybindings
	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<QuickSwitcherContent
				invocationTimestamp={invocationTimestamp}
				initialMode={initialMode}
			/>
		</ModalContainer>
	);
};

export default QuickSwitcher;
