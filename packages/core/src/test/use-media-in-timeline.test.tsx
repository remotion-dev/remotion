/**
 * @vitest-environment jsdom
 */
import type {RefObject} from 'react';
import React, {useMemo} from 'react';
import {afterAll, beforeAll, expect, test, vitest} from 'vitest';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {SequenceManager} from '../SequenceManager.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import * as useVideoConfigModule from '../use-video-config.js';
import {renderHook} from './render-hook.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

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
			props: {},
			defaultCodec: null,
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
			<WrapSequenceContext>
				<SequenceManager.Provider value={sequenceManagerContext}>
					<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
				</SequenceManager.Provider>
			</WrapSequenceContext>
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
				displayName: null,
				id: 'test',
				stack: null,
				showInTimeline: true,
				premountDisplay: null,
				onAutoPlayError: null,
			}),
		{
			wrapper,
		},
	);
	expect(registerSequence).toHaveBeenCalled();
	unmount();
	expect(unregisterSequence).toHaveBeenCalled();
});
