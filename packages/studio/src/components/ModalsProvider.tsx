import React, {useMemo, useState} from 'react';
import type {ModalState, SetSelectedModalContextType} from '../state/modals';
import {SelectedModalContext, SetSelectedModalContext} from '../state/modals';

export const ModalsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [selectedModal, setSelectedModal] = useState<ModalState | null>(null);

	const setSelectedModalContext = useMemo((): SetSelectedModalContextType => {
		return {
			setSelectedModal,
		};
	}, []);

	return (
		<SetSelectedModalContext.Provider value={setSelectedModalContext}>
			<SelectedModalContext.Provider value={selectedModal}>
				{children}
			</SelectedModalContext.Provider>
		</SetSelectedModalContext.Provider>
	);
};
