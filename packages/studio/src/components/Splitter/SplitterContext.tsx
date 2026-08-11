import React from 'react';

export type SplitterDragState = false | {x: number; y: number};

export type SplitterOrientation = 'horizontal' | 'vertical';

export type TSplitterContext = {
	flexValue: number;
	setFlexValue: React.Dispatch<React.SetStateAction<number>>;
	orientation: SplitterOrientation;
	ref: React.RefObject<HTMLDivElement | null>;
	maxFlex: number;
	minFlex: number;
	maxFlexerSize: number | null;
	minFlexerSize: number | null;
	maxAntiFlexerSize: number | null;
	minAntiFlexerSize: number | null;
	defaultFlex: number;
	id: string;
	persistFlex: (value: number) => void;
	isDragging: React.RefObject<
		| false
		| {
				x: number;
				y: number;
		  }
	>;
};

type SplitterFlexBounds = Pick<
	TSplitterContext,
	| 'maxAntiFlexerSize'
	| 'maxFlex'
	| 'maxFlexerSize'
	| 'minAntiFlexerSize'
	| 'minFlex'
	| 'minFlexerSize'
> & {
	readonly availableSize: number | null;
};

export const getSplitterFlexBounds = ({
	availableSize,
	maxAntiFlexerSize,
	maxFlex,
	maxFlexerSize,
	minAntiFlexerSize,
	minFlex,
	minFlexerSize,
}: SplitterFlexBounds) => {
	if (availableSize === null || availableSize <= 0) {
		return {minFlex, maxFlex};
	}

	const minimum = Math.min(
		1,
		Math.max(
			minFlex,
			minFlexerSize === null ? 0 : minFlexerSize / availableSize,
			maxAntiFlexerSize === null ? 0 : 1 - maxAntiFlexerSize / availableSize,
		),
	);
	const maximum = Math.max(
		minimum,
		Math.min(
			maxFlex,
			maxFlexerSize === null ? 1 : maxFlexerSize / availableSize,
			minAntiFlexerSize === null ? 1 : 1 - minAntiFlexerSize / availableSize,
		),
	);

	return {minFlex: minimum, maxFlex: maximum};
};

export const getClampedSplitterFlex = ({
	flexValue,
	...bounds
}: SplitterFlexBounds & {readonly flexValue: number}) => {
	const {minFlex, maxFlex} = getSplitterFlexBounds(bounds);
	return Math.min(maxFlex, Math.max(minFlex, flexValue));
};

export const SplitterContext = React.createContext<TSplitterContext>({
	flexValue: 1,
	ref: {current: null},
	setFlexValue: () => undefined,
	isDragging: {current: false},
	orientation: 'horizontal',
	maxFlex: 1,
	minFlex: 1,
	maxFlexerSize: null,
	minFlexerSize: null,
	maxAntiFlexerSize: null,
	minAntiFlexerSize: null,
	defaultFlex: 1,
	id: '--',
	persistFlex: () => undefined,
});
