import type React from 'react';
import {useContext, useEffect} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import {TimelineZoomCtx} from '../state/timeline-zoom';

const makeKey = (composition: string) => {
	return `remotion.zoom.${composition}`;
};

const persistCurrentZoom = (zoom: number) => {
	const currentComposition = deriveCanvasContentFromUrl();
	if (!currentComposition || currentComposition.type !== 'composition') {
		return;
	}

	localStorage.setItem(makeKey(currentComposition.compositionId), String(zoom));
};

export const getZoomForComposition = (composition: string) => {
	const zoom = localStorage.getItem(makeKey(composition));
	return zoom ? Number(zoom) : 0;
};

export const deriveCanvasContentFromUrl = (): CanvasContent | null => {
	const substrings = window.location.pathname.split('/');

	const lastPart = substrings[substrings.length - 1];

	if (substrings.includes('assets')) {
		return {type: 'asset', asset: window.location.pathname.substring(8)};
	}

	if (lastPart) {
		return {
			type: 'composition',
			compositionId: lastPart,
		};
	}

	return null;
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
	}, [zoom, isActive, playing]);

	return null;
};
