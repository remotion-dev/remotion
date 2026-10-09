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
import React from 'react';
import type {TSequence} from '../CompositionManager.js';
import {
	SequenceOutlineContext,
	SequenceOutlineInternals,
} from '../sequence-outline.js';
import {SequenceRegistryContext} from '../SequenceManager.js';
import {useMediaInTimelineRegistration} from '../use-media-in-timeline.js';
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

test('useMediaInTimeline registers muted changes and unregisters the sequence', () => {
	let getSequences = (): TSequence[] => {
		throw new Error('Sequence registry has not mounted');
	};

	const CaptureRegistry = () => {
		const registry = React.useContext(SequenceRegistryContext);
		if (registry === null) throw new Error('Sequence registry has not mounted');
		getSequences = registry.getSnapshot;
		return null;
	};

	const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
		<WrapSequenceContext>
			<CaptureRegistry />
			{children}
		</WrapSequenceContext>
	);
	const {rerender, unmount} = renderHook(
		({muted}: {readonly muted: boolean}) =>
			useMediaInTimelineRegistration({
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
				loopVolumeCurveBehavior: 'repeat',
				documentationLink: null,
				muted,
			}),
		{wrapper, initialProps: {muted: false}},
	);
	expect(getSequences()).toHaveLength(1);
	expect(getSequences()[0]).toMatchObject({
		mediaFrameAtSequenceZero: 0,
		muted: false,
		refForOutline: null,
	});
	const id = getSequences()[0]?.id;
	rerender({muted: true});
	expect(getSequences()).toHaveLength(1);
	expect(getSequences()[0]).toMatchObject({id, muted: true});
	unmount();
	expect(getSequences()).toEqual([]);
});

test('useMediaInTimeline keeps documentation links for custom display names', () => {
	let getSequences = (): TSequence[] => {
		throw new Error('Sequence registry has not mounted');
	};

	const CaptureRegistry = () => {
		const registry = React.useContext(SequenceRegistryContext);
		if (registry === null) throw new Error('Sequence registry has not mounted');
		getSequences = registry.getSnapshot;
		return null;
	};

	const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
		<SequenceOutlineContext.Provider value>
			<WrapSequenceContext>
				<CaptureRegistry />
				{children}
			</WrapSequenceContext>
		</SequenceOutlineContext.Provider>
	);
	const {result} = renderHook(
		() =>
			useMediaInTimelineRegistration({
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
				loopVolumeCurveBehavior: 'repeat',
				documentationLink: 'https://www.remotion.dev/docs/html5-video',
				muted: false,
			}),
		{wrapper},
	);
	expect(getSequences()[0]).toMatchObject({
		displayName: 'Intro',
		documentationLink: 'https://www.remotion.dev/docs/html5-video',
		refForOutline: result.current.automaticOutlineRef,
	});
	expect(
		SequenceOutlineInternals.getNodes(result.current.automaticOutlineRef!),
	).toEqual([]);
});
