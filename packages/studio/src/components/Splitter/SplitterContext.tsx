import React from 'react';

export type SplitterDragState = false | {x: number; y: number};

export type SplitterOrientation = 'horizontal' | 'vertical';

export type SplitterPosition = {
	positionInPixels: number;
	minPositionInPixels: number;
	maxPositionInPixels: number;
};

export type TSplitterContext = {
	flexValue: number;
	position: SplitterPosition | null;
	collapsedDuringDrag: 'left' | 'right' | null;
	setCollapsedDuringDrag: (side: 'left' | 'right' | null) => void;
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
	firstPaneId: string;
	getPosition: () => SplitterPosition | null;
	setPosition: (positionInPixels: number) => SplitterPosition;
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

export const getEffectiveSplitterFlex = ({
	flexValue,
	...bounds
}: SplitterFlexBounds & {readonly flexValue: number}) => {
	const {minFlex, maxFlex} = getSplitterFlexBounds(bounds);
	const {availableSize} = bounds;
	if (availableSize !== null && availableSize > 0) {
		const minimumSize = Math.ceil(minFlex * availableSize);
		const maximumSize = Math.floor(maxFlex * availableSize);
		if (minimumSize <= maximumSize) {
			const positionInPixels = Math.min(
				maximumSize,
				Math.max(minimumSize, Math.round(flexValue * availableSize)),
			);
			return {
				flexValue: positionInPixels / availableSize,
				position: {
					positionInPixels,
					minPositionInPixels: minimumSize,
					maxPositionInPixels: maximumSize,
				},
			};
		}
	}

	const effectiveFlex = Math.min(maxFlex, Math.max(minFlex, flexValue));
	return {
		flexValue: effectiveFlex,
		position:
			availableSize === null || availableSize <= 0
				? null
				: {
						positionInPixels: effectiveFlex * availableSize,
						minPositionInPixels: minFlex * availableSize,
						maxPositionInPixels: maxFlex * availableSize,
					},
	};
};

export const SplitterContext = React.createContext<TSplitterContext>({
	flexValue: 1,
	position: null,
	collapsedDuringDrag: null,
	setCollapsedDuringDrag: () => undefined,
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
	firstPaneId: '',
	getPosition: () => null,
	setPosition: () => {
		throw new Error('Splitter is unavailable.');
	},
	persistFlex: () => undefined,
});

// Propagate layout changes only through the affected splitter subtree.
export const SplitterLayoutContext = React.createContext<object | null>(null);
