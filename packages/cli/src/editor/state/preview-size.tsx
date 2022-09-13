import type {PreviewSize} from '@remotion/player';
import React, {createContext, useCallback, useMemo, useState} from 'react';

type PreviewSizeCtx = {
	size: PreviewSize;
	setSize: (cb: (oldSize: PreviewSize) => PreviewSize) => void;
};

const key = 'remotion.previewSize';

export const persistPreviewSizeOption = (option: PreviewSize) => {
	localStorage.setItem(key, JSON.stringify(option));
};

export const loadPreviewSizeOption = (): PreviewSize => {
	const item = localStorage.getItem(key);
	if (item === null) {
		return {
			size: 'auto',
			translation: {
				x: 0,
				y: 0,
			},
		};
	}

	return JSON.parse(item) as PreviewSize;
};

export const PreviewSizeContext = createContext<PreviewSizeCtx>({
	setSize: () => undefined,
	size: loadPreviewSizeOption(),
});

export const PreviewSizeProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [size, setSizeState] = useState(() => loadPreviewSizeOption());
	const [translation, setTranslation] = useState(() => {
		return {
			x: 0,
			y: 0,
		};
	});

	const setSize = useCallback(
		(newValue: (prevState: PreviewSize) => PreviewSize) => {
			setSizeState((prevState) => {
				const newVal = newValue(prevState);
				persistPreviewSizeOption(newVal);
				return newVal;
			});
		},
		[]
	);

	const previewSizeCtx: PreviewSizeCtx = useMemo(() => {
		return {
			size,
			setSize,
			translation,
			setTranslation,
		};
	}, [setSize, size, translation, setTranslation]);

	return (
		<PreviewSizeContext.Provider value={previewSizeCtx}>
			{children}
		</PreviewSizeContext.Provider>
	);
};
