// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import {renderHook} from '@testing-library/react';
import React from 'react';
import {afterAll, beforeAll, describe, expect, test, vi, vitest} from 'vitest';
import * as useAudioFrameModule from '../audio/use-audio-frame';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {SequenceContext, SequenceContextType} from '../sequencing';
import {useCurrentFrame} from '../use-frame';

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

describe('useFrameForVolumeProp hook tests', () => {
	beforeAll(() => {
		vitest
			.spyOn(useAudioFrameModule, 'useMediaStartsAt')
			.mockImplementation(() => -10);
	});
	afterAll(() => {
		vitest.spyOn(useAudioFrameModule, 'useMediaStartsAt').mockRestore();
	});

	test.skip('Media not mounted', () => {
		const mock = vi.fn().mockImplementation(useCurrentFrame);
		mock.mockImplementationOnce(() => 9);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(-1);
	});
	test.skip('Media mounted', () => {
		vi.fn()
			.mockImplementation(useCurrentFrame)
			.mockImplementation(() => 10);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(0);
	});
	test.skip('Media mounted + 1 frame', () => {
		vi.fn()
			.mockImplementation(useCurrentFrame)
			.mockImplementation(() => 11);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(1);
	});
});
