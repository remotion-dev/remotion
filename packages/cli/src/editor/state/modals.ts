import type React from 'react';
import {createContext} from 'react';
import type {TCompMetadata} from 'remotion';
import type {QuickSwitcherMode} from '../components/QuickSwitcher/NoResults';
import type {UpdateInfo} from '../components/UpdateCheck';

export type CompType = 'composition' | 'still';

export type ModalState =
	| {
			type: 'new-comp';
			compType: CompType;
	  }
	| {
			type: 'render';
			composition: TCompMetadata;
	  }
	| {
			type: 'update';
			info: UpdateInfo;
	  }
	| {
			type: 'quick-switcher';
			mode: QuickSwitcherMode;
			invocationTimestamp: number;
	  };

export type ModalContextType = {
	selectedModal: ModalState | null;
	setSelectedModal: React.Dispatch<React.SetStateAction<ModalState | null>>;
};

export const ModalsContext = createContext<ModalContextType>({
	selectedModal: null,
	setSelectedModal: () => undefined,
});
