import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {getCurrentCompositionFromUrl} from './FramePersistor';

const makeKey = (composition: string) => {
	return `remotion.zoom.${composition}`;
};

export const persistCurrentZoom = (zoom: number) => {
	const currentComposition = getCurrentCompositionFromUrl();
	if (!currentComposition) {
		return;
	}

	localStorage.setItem(makeKey(currentComposition), String(zoom));
};

export const getZoomForComposition = (composition: string) => {
	const zoom = localStorage.getItem(makeKey(composition));
	return zoom ? Number(zoom) : 0;
};

export const ZoomPersistor: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const {zoom} = useContext(TimelineZoomCtx);

	const {currentComposition} = useContext(Internals.CompositionManager);
	const isActive = currentComposition === getCurrentCompositionFromUrl();

	useEffect(() => {
		if (!isActive) {
			return;
		}

		persistCurrentZoom(zoom);
	}, [zoom, isActive, playing]);

	return null;
};
