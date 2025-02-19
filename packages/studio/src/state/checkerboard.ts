import {createContext} from 'react';

type State = {
	checkerboard: boolean;
	setCheckerboard: (cb: (prevState: boolean) => boolean) => void;
};

export const persistCheckerboardOption = (option: boolean) => {
	localStorage.setItem('option', String(option));
};

export const loadCheckerboardOption = (): boolean => {
	const item = localStorage.getItem('option');
	return item !== 'false';
};

export const CheckerboardContext = createContext<State>({
	checkerboard: loadCheckerboardOption(),
	setCheckerboard: () => undefined,
});
