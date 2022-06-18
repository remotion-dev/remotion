import React from 'react';
import {SlideTransition} from './Slide';
import {TransitionDirection} from './transition-direction';
import {TriangleTransition} from './Triangle';

export type TransitionPreset =
	| {
			type: 'triangle';
	  }
	| {
			type: 'slide';
	  };

export const GenericTransition: React.FC<{
	progress: number;
	children: React.ReactNode;
	direction: TransitionDirection;
	preset: TransitionPreset;
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
