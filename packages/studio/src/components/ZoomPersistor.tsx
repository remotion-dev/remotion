import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {deriveCanvasContentFromUrl} from './load-canvas-content-from-url';

const makeKey = () => {
	return `remotion.zoom-map`;
};

const persistCurrentZoom = (zoom: Record<string, number>) => {
	localStorage.setItem(makeKey(), JSON.stringify(zoom));
};

export const getZoomFromLocalStorage = (): Record<string, number> => {
	const zoom = localStorage.getItem(makeKey());
	return zoom ? JSON.parse(zoom) : {};
};

export const ZoomPersistor: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const {zoom} = useContext(TimelineZoomCtx);

	const {canvasContent} = useContext(Internals.CompositionManager);
	const urlState = deriveCanvasContentFromUrl();

	const isActive =
		urlState &&
		urlState.type === 'composition' &&
		canvasContent &&
		canvasContent.type === 'composition' &&
		urlState.compositionId === canvasContent.compositionId;

	useEffect(() => {
		if (!isActive) {
			return;
		}

		persistCurrentZoom(zoom);
	}, [zoom, isActive, playing, urlState]);

	return null;
};
