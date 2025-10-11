import React, {useMemo, useState} from 'react';
import type {ModalContextType, ModalState} from '../state/modals';
import {ModalsContext} from '../state/modals';

export const ModalsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [modalContextType, setModalContextType] = useState<ModalState | null>(
		null,
	);

	const modalsContext = useMemo((): ModalContextType => {
		return {
			selectedModal: modalContextType,
			setSelectedModal: setModalContextType,
		};
	}, [modalContextType]);
	return (
		<ModalsContext.Provider value={modalsContext}>
			{children}
		</ModalsContext.Provider>
	);
};
