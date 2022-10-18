import type React from 'react';
import {createContext} from 'react';
import type {UpdateInfo} from '../components/UpdateCheck';

export type CompType = 'composition' | 'still';

export type ModalState =
	| {
			type: 'new-comp';
			compType: CompType;
	  }
	| {
			type: 'update';
			info: UpdateInfo;
	  }
	| {
			type: 'shortcuts';
	  };

export type ModalContextType = {
	selectedModal: ModalState | null;
	setSelectedModal: React.Dispatch<React.SetStateAction<ModalState | null>>;
};

export const ModalsContext = createContext<ModalContextType>({
	selectedModal: null,
	setSelectedModal: () => undefined,
});
