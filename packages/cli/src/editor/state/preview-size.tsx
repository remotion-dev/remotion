import type {PreviewSize} from '@remotion/player';
import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import {EditorZoomGesturesContext} from './editor-zoom-gestures';

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

	const {editorZoomGestures} = useContext(EditorZoomGesturesContext);

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
			size: editorZoomGestures
				? size
				: {
						size: size.size,
						translation: {
							x: 0,
							y: 0,
						},
				  },
			setSize,
			translation,
			setTranslation,
		};
	}, [editorZoomGestures, size, setSize, translation]);

	return (
		<PreviewSizeContext.Provider value={previewSizeCtx}>
			{children}
		</PreviewSizeContext.Provider>
	);
};
