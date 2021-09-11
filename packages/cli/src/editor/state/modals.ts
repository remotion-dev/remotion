import React, {createContext} from 'react';

export type ModalType = 'new-comp' | 'update';

export type ModalContextType = {
	selectedModal: ModalType | null;
	setSelectedModal: React.Dispatch<React.SetStateAction<ModalType | null>>;
};

export const ModalsContext = createContext<ModalContextType>({
	selectedModal: null,
	setSelectedModal: () => undefined,
});
