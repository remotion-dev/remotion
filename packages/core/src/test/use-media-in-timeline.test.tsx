import {renderHook} from '@testing-library/react-hooks';
import React, {RefObject} from 'react';
import {CompositionManagerContext} from '../CompositionManager';
import {Internals} from '../internals';
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

test('useMediaInTimeline registers and unregisters new sequence', () => {
	const registerSequence = jest.fn();
	const unregisterSequence = jest.fn();
	const wrapper: React.FC = ({children}) => (
		<Internals.CompositionManager.Provider
			value={
				// eslint-disable-next-line react/jsx-no-constructed-context-values
				({
					registerSequence,
					unregisterSequence,
				} as unknown) as CompositionManagerContext
			}
		>
			{children}
		</Internals.CompositionManager.Provider>
	);

	const audioRef = ({
		current: {volume: 0.5},
	} as unknown) as RefObject<HTMLAudioElement>;

	const {unmount} = renderHook(
		() =>
			useMediaInTimeline({
				volume: 1,
				mediaVolume: 1,
				mediaType: 'audio',
				mediaRef: audioRef,
			}),
		{
			wrapper,
		}
	);
	expect(registerSequence).toHaveBeenCalled();
	unmount();
	expect(unregisterSequence).toHaveBeenCalled();
});
