import type React from 'react';
import {renderAnnotation} from './render-annotation';
import type {
	Rect,
	ResolvedAnnotationConfig,
	RoughAnnotationOptions,
} from './types';

export const getLocalRect = (element: HTMLElement): Rect => {
	return {
		x: element.offsetLeft,
		y: element.offsetTop,
		w: element.offsetWidth,
		h: element.offsetHeight,
	};
};

export const render = ({
	seed,
	element,
	config,
	progress,
	options,
}: {
	readonly seed: number;
	readonly element: HTMLElement;
	readonly config: ResolvedAnnotationConfig;
	readonly progress: number;
	readonly options: RoughAnnotationOptions;
}): React.ReactElement[] => {
	const rect = getLocalRect(element);
	if (rect.w === 0 || rect.h === 0) {
		return [];
	}

	return renderAnnotation({
		config,
		seed,
		rect,
		progress,
		options,
	});
};
