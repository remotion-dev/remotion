import React, {
	createContext,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';

type AudioLevels = {left: number; right: number};

type State = {
	visible: boolean;
	setVisible: (update: (previous: boolean) => boolean) => void;
	levels: React.MutableRefObject<AudioLevels | null>;
};

export const AudioLevelsContext = createContext<State>({
	visible: false,
	setVisible: () => undefined,
	levels: {current: null},
});

export const AudioLevelsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [visible, setVisibleState] = useState(
		() => localStorage.getItem('remotion.audioLevels') === 'true',
	);
	const levels = useRef<AudioLevels | null>(null);
	const setVisible = useCallback((update: (previous: boolean) => boolean) => {
		setVisibleState((previous) => {
			const next = update(previous);
			localStorage.setItem('remotion.audioLevels', String(next));
			return next;
		});
	}, []);
	const value = useMemo(
		() => ({visible, setVisible, levels}),
		[visible, setVisible],
	);

	return (
		<AudioLevelsContext.Provider value={value}>
			{children}
		</AudioLevelsContext.Provider>
	);
};
