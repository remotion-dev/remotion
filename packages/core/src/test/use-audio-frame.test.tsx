/**
 * @vitest-environment jsdom
 */
import React from 'react';
import {afterAll, beforeAll, describe, expect, test, vitest} from 'vitest';
import * as useAudioFrameModule from '../audio/use-audio-frame';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import type {SequenceContextType} from '../Sequence';
import {SequenceContext} from '../Sequence';
import * as useFrameModule from '../use-current-frame';
import {renderHook} from './render-hook';

test.skip('Media starts at 0 if it is outside a sequence', () => {
	const wrapper: React.FC<{
		children: React.ReactNode;
	}> = ({children}) => (
		<SequenceContext.Provider value={null}>{children}</SequenceContext.Provider>
	);
	const {result} = renderHook(() => useMediaStartsAt(), {wrapper});
	expect(result.current).toEqual(0);
});

test.skip('Media start is shifted back based on sequence', () => {
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
		vitest.spyOn(useFrameModule, 'useCurrentFrame').mockImplementation(() => 9);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(-1);
	});
	test.skip('Media mounted', () => {
		vitest
			.spyOn(useFrameModule, 'useCurrentFrame')
			.mockImplementation(() => 10);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(0);
	});
	test.skip('Media mounted + 1 frame', () => {
		vitest
			.spyOn(useFrameModule, 'useCurrentFrame')
			.mockImplementation(() => 11);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(1);
	});
});
