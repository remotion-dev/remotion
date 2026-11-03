import {createContext} from 'react';

type State = {
	showControlsInFullscreen: boolean;
	setShowControlsInFullscreen: (cb: (prevState: boolean) => boolean) => void;
};

const key = 'remotion.showControlsInFullscreen';

export const persistShowControlsInFullscreenOption = (option: boolean) => {
	localStorage.setItem(key, String(option));
};

export const loadShowControlsInFullscreenOption = (): boolean => {
	const item = localStorage.getItem(key);
	return item !== 'false';
};

export const ShowControlsInFullscreenContext = createContext<State>({
	showControlsInFullscreen: true,
	setShowControlsInFullscreen: () => undefined,
});
