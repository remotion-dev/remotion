import React, {useMemo, useState} from 'react';
import type {
	ModalState,
	SetOpenModalCountContextType,
	SetSelectedModalContextType,
} from '../state/modals';
import {
	OpenModalCountContext,
	SelectedModalContext,
	SetOpenModalCountContext,
	SetSelectedModalContext,
} from '../state/modals';

export const ModalsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [selectedModal, setSelectedModal] = useState<ModalState | null>(null);
	const [openModalCount, setOpenModalCount] = useState(0);

	const setSelectedModalContext = useMemo((): SetSelectedModalContextType => {
		return {
			setSelectedModal,
		};
	}, []);
	const setOpenModalCountContext = useMemo((): SetOpenModalCountContextType => {
		return {setOpenModalCount};
	}, []);

	return (
		<SetOpenModalCountContext.Provider value={setOpenModalCountContext}>
			<OpenModalCountContext.Provider value={openModalCount}>
				<SetSelectedModalContext.Provider value={setSelectedModalContext}>
					<SelectedModalContext.Provider value={selectedModal}>
						{children}
					</SelectedModalContext.Provider>
				</SetSelectedModalContext.Provider>
			</OpenModalCountContext.Provider>
		</SetOpenModalCountContext.Provider>
	);
};
