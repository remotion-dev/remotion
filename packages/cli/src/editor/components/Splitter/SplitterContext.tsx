import React from 'react';

export type SplitterDragState = false | {x: number; y: number};

export type SplitterOrientation = 'horizontal' | 'vertical';

export type TSplitterContext = {
	flexValue: number;
	setFlexValue: React.Dispatch<React.SetStateAction<number>>;
	domRect: DOMRect | DOMRectReadOnly | null;
	orientation: SplitterOrientation;
	maxFlex: number;
	minFlex: number;
	defaultFlex: number;
	id: string;
	persistFlex: (value: number) => void;
	isDragging: React.MutableRefObject<
		| false
		| {
				x: number;
				y: number;
		  }
	>;
};

export const SplitterContext = React.createContext<TSplitterContext>({
	flexValue: 1,
	domRect: null,
	setFlexValue: () => undefined,
	isDragging: {current: false},
	orientation: 'horizontal',
	maxFlex: 1,
	minFlex: 1,
	defaultFlex: 1,
	id: '--',
	persistFlex: () => undefined,
});
