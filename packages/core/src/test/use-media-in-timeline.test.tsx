/**
 * @vitest-environment jsdom
 */
import type {RefObject} from 'react';
import React, {useMemo} from 'react';
import {afterAll, beforeAll, expect, test, vitest} from 'vitest';
import {AssetManagerProvider} from '../AssetManager.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {SequenceManager} from '../SequenceManager.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import * as useVideoConfigModule from '../use-video-config.js';
import {renderHook} from './render-hook.js';
import {mockCompositionContext} from './wrap-sequence-context.js';

beforeAll(() => {
	vitest
		.spyOn(useVideoConfigModule, 'useVideoConfig')
		.mockImplementation(() => ({
			width: 10,
			height: 10,
			fps: 30,
			durationInFrames: 100,
			id: 'hithere',
			defaultProps: {},
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
	}> = ({children}) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const sequenceManagerContext: SequenceManagerContext = useMemo(() => {
			return {
				registerSequence,
				unregisterSequence,
				sequences: [],
			};
		}, []);

		return (
			<CompositionManager.Provider value={mockCompositionContext}>
				<SequenceManager.Provider value={sequenceManagerContext}>
					<AssetManagerProvider>
						<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
					</AssetManagerProvider>
				</SequenceManager.Provider>
			</CompositionManager.Provider>
		);
	};

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
				playbackRate: 1,
			}),
		{
			wrapper,
		}
	);
	expect(registerSequence).toHaveBeenCalled();
	unmount();
	expect(unregisterSequence).toHaveBeenCalled();
});
