import type React from 'react';
import {useContext, useEffect} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import {getPathname} from '../helpers/url-state';
import {TimelineZoomCtx} from '../state/timeline-zoom';

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

export const deriveCanvasContentFromUrl = (): CanvasContent | null => {
	const substrings = getPathname().split('/').filter(Boolean);

	const lastPart = substrings[substrings.length - 1];

	if (substrings[0] === 'assets') {
		return {
			type: 'asset',
			asset: decodeURIComponent(getPathname().substring('/assets/'.length)),
		};
	}

	if (substrings[0] === 'outputs') {
		return {
			type: 'output',
			path: decodeURIComponent(getPathname().substring('/outputs/'.length)),
		};
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
	}, [zoom, isActive, playing, urlState]);

	return null;
};
