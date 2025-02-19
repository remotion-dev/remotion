import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {PreviewSize, PreviewSizeCtx} from 'remotion';
import {Internals} from 'remotion';
import {EditorZoomGesturesContext} from './editor-zoom-gestures';

const key = 'remotion.previewSize';

const persistPreviewSizeOption = (option: PreviewSize) => {
	localStorage.setItem(key, JSON.stringify(option));
};

const loadPreviewSizeOption = (): PreviewSize => {
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

export const PreviewSizeProvider: React.FC<{
	readonly children: React.ReactNode;
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
		[],
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
		<Internals.PreviewSizeContext.Provider value={previewSizeCtx}>
			{children}
		</Internals.PreviewSizeContext.Provider>
	);
};
