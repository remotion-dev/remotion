import {renderHook} from '@testing-library/react-hooks';
import React from 'react';
import * as useAudioFrameModule from '../audio/use-audio-frame';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {SequenceContext, SequenceContextType} from '../sequencing';
import * as useFrameModule from '../use-frame';

test('Media starts at 0 if it is outside a sequence', () => {
	const wrapper: React.FC = ({children}) => (
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
	const wrapper: React.FC = ({children}) => (
		<SequenceContext.Provider value={mockSequence}>
			{children}
		</SequenceContext.Provider>
	);
	const {result} = renderHook(() => useMediaStartsAt(), {wrapper});
	expect(result.current).toEqual(-100);
});

describe('useFrameForVolumeProp hook tests', () => {
	beforeAll(() => {
		jest
			.spyOn(useAudioFrameModule, 'useMediaStartsAt')
			.mockImplementation(() => -10);
	});
	afterAll(() => {
		jest.spyOn(useAudioFrameModule, 'useMediaStartsAt').mockRestore();
	});

	test('Media not mounted', () => {
		jest.spyOn(useFrameModule, 'useCurrentFrame').mockImplementation(() => 9);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(-1);
	});
	test('Media mounted', () => {
		jest.spyOn(useFrameModule, 'useCurrentFrame').mockImplementation(() => 10);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(0);
	});
	test('Media mounted + 1 frame', () => {
		jest.spyOn(useFrameModule, 'useCurrentFrame').mockImplementation(() => 11);
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(1);
	});
});
