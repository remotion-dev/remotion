import {
	afterAll,
	afterEach,
	beforeAll,
	expect,
	mock,
	spyOn,
	test,
} from 'bun:test';
import {cleanup, renderHook} from '@testing-library/react';
import React, {useMemo} from 'react';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {SequenceManager} from '../SequenceManager.js';
import {useMediaInTimeline} from '../use-media-in-timeline.js';
import * as useVideoConfigModule from '../use-video-config.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const useVideoConfigSpy = spyOn(useVideoConfigModule, 'useVideoConfig');

afterEach(() => {
	cleanup();
});

beforeAll(() => {
	useVideoConfigSpy.mockImplementation(() => ({
		width: 10,
		height: 10,
		fps: 30,
		durationInFrames: 100,
		id: 'hithere',
		defaultProps: {},
		props: {},
		defaultCodec: null,
		defaultOutName: null,
		defaultVideoImageFormat: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: null,
	}));
});
afterAll(() => {
	mock.restore();
});

test('useMediaInTimeline registers and unregisters new sequence', () => {
	const registerSequence = mock();
	const unregisterSequence = mock();
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
					{children}
				</SequenceManager.Provider>
			</WrapSequenceContext>
		);
	};

	const {unmount} = renderHook(
		() =>
			useMediaInTimeline({
				volume: 1,
				src: 'test',
				mediaVolume: 1,
				mediaType: 'audio',
				playbackRate: 1,
				displayName: null,
				id: 'test',
				getStack: () => null,
				showInTimeline: true,
				premountDisplay: null,
				postmountDisplay: null,
				loopDisplay: undefined,
				documentationLink: null,
				refForOutline: null,
			}),
		{
			wrapper,
		},
	);
	expect(registerSequence).toHaveBeenCalled();
	unmount();
	expect(unregisterSequence).toHaveBeenCalled();
});

test('useMediaInTimeline keeps documentation links for custom display names', () => {
	const registerSequence = mock();
	const unregisterSequence = mock();
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
					{children}
				</SequenceManager.Provider>
			</WrapSequenceContext>
		);
	};

	renderHook(
		() =>
			useMediaInTimeline({
				volume: 1,
				src: 'test.mp4',
				mediaVolume: 1,
				mediaType: 'video',
				playbackRate: 1,
				displayName: 'Intro',
				id: 'test',
				getStack: () => null,
				showInTimeline: true,
				premountDisplay: null,
				postmountDisplay: null,
				loopDisplay: undefined,
				documentationLink: 'https://www.remotion.dev/docs/html5-video',
				refForOutline: null,
			}),
		{
			wrapper,
		},
	);

	expect(registerSequence.mock.calls[0]?.[0]).toMatchObject({
		displayName: 'Intro',
		documentationLink: 'https://www.remotion.dev/docs/html5-video',
	});
});
