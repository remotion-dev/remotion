import type React from 'react';
import type {ResolvedOptions} from 'roughjs/bin/core';
import {renderAnnotation} from './render-annotation';
import type {Rect, ResolvedAnnotationConfig} from './types';

const svgRect = ({
	svg,
	element,
	scale,
}: {
	readonly svg: SVGSVGElement;
	readonly element: HTMLElement;
	readonly scale: number;
}): Rect => {
	const rect1 = svg.getBoundingClientRect();
	const rect2 = element.getBoundingClientRect();
	const inverseScale = 1 / scale;

	return {
		x: (rect2.x - rect1.x) * inverseScale,
		y: (rect2.y - rect1.y) * inverseScale,
		w: rect2.width * inverseScale,
		h: rect2.height * inverseScale,
	};
};

export const render = ({
	svg,
	seed,
	element,
	config,
	scale,
	progress,
	options,
}: {
	readonly svg: SVGSVGElement;
	readonly seed: number;
	readonly element: HTMLElement;
	readonly config: ResolvedAnnotationConfig;
	readonly scale: number;
	readonly progress: number;
	readonly options: Partial<ResolvedOptions>;
}): React.ReactElement[] => {
	if (scale === 0) {
		return [];
	}

	const rect = svgRect({svg, element, scale});
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
