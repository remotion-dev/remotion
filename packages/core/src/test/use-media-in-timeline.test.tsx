/**
 * @vitest-environment jsdom
 */
import type {RefObject} from 'react';
import React from 'react';
import {afterAll, beforeAll, expect, test, vitest} from 'vitest';
import type {CompositionManagerContext} from '../CompositionManager';
import {Internals} from '../internals';
import {useMediaInTimeline} from '../use-media-in-timeline';
import * as useVideoConfigModule from '../use-video-config';
import {renderHook} from './render-hook';
import {mockCompositionContext} from './wrap-sequence-context';

beforeAll(() => {
	vitest
		.spyOn(useVideoConfigModule, 'useVideoConfig')
		.mockImplementation(() => ({
			width: 10,
			height: 10,
			fps: 30,
			durationInFrames: 100,
			id: 'hithere',
			defaultProps: () => ({}),
		}));
});
afterAll(() => {
	vitest.spyOn(useVideoConfigModule, 'useVideoConfig').mockClear();
});

test('useMediaInTimeline registers and unregisters new sequence', () => {
	const registerSequence = vitest.fn();
	const unregisterSequence = vitest.fn();
	const wrapper: React.FC<{
		children: React.ReactNode;
	}> = ({children}) => (
		<Internals.CompositionManager.Provider
			value={
				// eslint-disable-next-line react/jsx-no-constructed-context-values
				{
					...mockCompositionContext,
					registerSequence,
					unregisterSequence,
				} as unknown as CompositionManagerContext
			}
		>
			{children}
		</Internals.CompositionManager.Provider>
	);

	const audioRef = {
		current: {volume: 0.5},
	} as unknown as RefObject<HTMLAudioElement>;

	const {unmount} = renderHook(
		() =>
			useMediaInTimeline({
				volume: 1,
				src: 'test',
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
