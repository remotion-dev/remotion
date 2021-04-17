import {renderHook} from '@testing-library/react-hooks';
import React, {RefObject} from 'react';
import {
	CompositionManager,
	CompositionManagerContext,
} from '../CompositionManager';
import {useMediaInTimeline} from '../use-media-in-timeline';
import * as useVideoConfigModule from '../use-video-config';

beforeAll(() => {
	jest.spyOn(useVideoConfigModule, 'useVideoConfig').mockImplementation(() => ({
		width: 10,
		height: 10,
		fps: 30,
		durationInFrames: 100,
	}));
});
afterAll(() => {
	jest.spyOn(useVideoConfigModule, 'useVideoConfig').mockClear();
});

test('useMediaInTimeline registers new sequence', () => {
	const registerSequence = jest.fn();
	const unregisterSequence = jest.fn();
	const wrapper: React.FC = ({children}) => (
		<CompositionManager.Provider
			value={
				({
					registerSequence,
					unregisterSequence,
				} as unknown) as CompositionManagerContext
			}
		>
			{children}
		</CompositionManager.Provider>
	);

	const audioRef = ({
		current: {volume: 0.5},
	} as unknown) as RefObject<HTMLAudioElement>;

	renderHook(
		() =>
			useMediaInTimeline({
				volume: 1,
				src: 'test',
				mediaType: 'audio',
				mediaRef: audioRef,
			}),
		{
			wrapper,
		}
	);
	expect(registerSequence).toHaveBeenCalled();
});
