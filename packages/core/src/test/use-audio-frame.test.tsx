// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import {expect, test} from 'vitest';
import {useMediaStartsAt} from '../audio/use-media-starts-at';
import {SequenceContext, SequenceContextType} from '../sequencing';
import {renderHook} from './render-hook';

test('Media starts at 0 if it is outside a sequence', () => {
	const wrapper: React.FC<{
		children: React.ReactNode;
	}> = ({children}) => (
		<SequenceContext.Provider value={null}>{children}</SequenceContext.Provider>
	);
	const {result} = renderHook(() => useMediaStartsAt(), {wrapper});
	expect(result.current).toEqual(0);
});

test('Media start is shifted back based on sequence', () => {
	const mockSequence: SequenceContextType = {
		cumulatedFrom: 0,
		relativeFrom: -100,
		parentFrom: 0,
		durationInFrames: 0,
		id: 'mock',
	};
	const wrapper: React.FC<{
		children: React.ReactNode;
	}> = ({children}) => (
		<SequenceContext.Provider value={mockSequence}>
			{children}
		</SequenceContext.Provider>
	);
	const {result} = renderHook(() => useMediaStartsAt(), {wrapper});
	expect(result.current).toEqual(-100);
});
