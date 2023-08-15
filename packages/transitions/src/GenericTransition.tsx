import React from 'react';
import {SlideTransition} from './presentations/Slide';
import {TriangleTransition} from './presentations/Triangle';
import type {TransitionDirection, TransitionPresentation} from './types';

export const GenericTransition: React.FC<{
	progress: number;
	children: React.ReactNode;
	direction: TransitionDirection;
	preset: TransitionPresentation;
}> = ({progress, children, direction, preset}) => {
	if (preset.type === 'triangle') {
		return (
			<TriangleTransition progress={progress} direction={direction}>
				{children}
			</TriangleTransition>
		);
	}

	if (preset.type === 'slide') {
		return (
			<SlideTransition progress={progress} direction={direction}>
				{children}
			</SlideTransition>
		);
	}

	throw new Error('preset does not exist ' + JSON.stringify(preset));
};
