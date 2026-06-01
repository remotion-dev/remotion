import {afterEach, beforeEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React, {useCallback, useMemo} from 'react';
import {Internals} from 'remotion';
import {Gif} from '../Gif';
import {manuallyManagedGifCache} from '../gif-cache';
import type {GifState} from '../props';

type RegisteredSequence = {
	readonly refForOutline: React.RefObject<HTMLElement | null> | null;
};

class MockWorker {
	public addEventListener = () => undefined;
	public removeEventListener = () => undefined;
	public postMessage = () => undefined;
	public terminate = () => undefined;
}

const OriginalWorker = globalThis.Worker;
const originalGetContext = HTMLCanvasElement.prototype.getContext;

const stub2dContext = (canvas: HTMLCanvasElement) => ({
	canvas,
	clearRect: () => undefined,
	drawImage: () => undefined,
	putImageData: () => undefined,
});

const gifState: GifState = {
	delays: [100],
	frames: [
		{
			data: new Uint8ClampedArray(4),
			width: 1,
			height: 1,
			colorSpace: 'srgb',
		} as ImageData,
	],
	width: 1,
	height: 1,
};

const studioEnvironment = {
	isRendering: false,
	isClientSideRendering: false,
	isPlayer: false,
	isStudio: true,
	isReadOnlyStudio: false,
};

const compositionContext = {
	compositions: [
		{
			id: 'comp',
			durationInFrames: 100,
			component: () => null,
			defaultProps: {},
			folderName: null,
			fps: 30,
			height: 1080,
			width: 1920,
			parentFolderName: null,
			nonce: [[0, 0]],
			calculateMetadata: null,
			schema: null,
			stack: null,
		},
	],
	folders: [],
	canvasContent: {type: 'composition' as const, compositionId: 'comp'},
	currentCompositionMetadata: {
		defaultCodec: null,
		defaultOutName: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: null,
		defaultVideoImageFormat: null,
		durationInFrames: 100,
		fps: 30,
		height: 1080,
		width: 1920,
		props: {},
	},
} as React.ContextType<typeof Internals.CompositionManager>;

const timelineContext = {
	frame: {},
	playing: false,
	rootId: 'test-root',
	imperativePlaying: {current: false},
	audioAndVideoTags: {current: []},
} as React.ContextType<typeof Internals.TimelineContext>;

const playbackRateContext = {
	playbackRate: 1,
	setPlaybackRate: () => undefined,
} as React.ContextType<typeof Internals.PlaybackRateContext>;

const logContext = {
	logLevel: 'info',
	mountTime: 0,
} as React.ContextType<typeof Internals.LogLevelContext>;

const SequenceRegistrationWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: RegisteredSequence) => void;
}> = ({children, onRegisterSequence}) => {
	const registerSequence = useCallback(
		(sequence: RegisteredSequence) => {
			onRegisterSequence(sequence);
		},
		[onRegisterSequence],
	);
	const unregisterSequence = useCallback(() => undefined, []);
	const sequenceManagerContext = useMemo(
		() =>
			({
				registerSequence,
				unregisterSequence,
				sequences: [],
			}) as React.ContextType<typeof Internals.SequenceManager>,
		[registerSequence, unregisterSequence],
	);

	return (
		<Internals.LogLevelContext.Provider value={logContext}>
			<Internals.BufferingProvider>
				<Internals.CanUseRemotionHooksProvider>
					<Internals.AbsoluteTimeContext.Provider value={timelineContext}>
						<Internals.TimelineContext.Provider value={timelineContext}>
							<Internals.PlaybackRateContext.Provider
								value={playbackRateContext}
							>
								<Internals.RemotionEnvironmentContext.Provider
									value={studioEnvironment}
								>
									<Internals.SequenceManager.Provider
										value={sequenceManagerContext}
									>
										<Internals.CompositionManager.Provider
											value={compositionContext}
										>
											{children}
										</Internals.CompositionManager.Provider>
									</Internals.SequenceManager.Provider>
								</Internals.RemotionEnvironmentContext.Provider>
							</Internals.PlaybackRateContext.Provider>
						</Internals.TimelineContext.Provider>
					</Internals.AbsoluteTimeContext.Provider>
				</Internals.CanUseRemotionHooksProvider>
			</Internals.BufferingProvider>
		</Internals.LogLevelContext.Provider>
	);
};

beforeEach(() => {
	globalThis.Worker = MockWorker as unknown as typeof Worker;
	HTMLCanvasElement.prototype.getContext = function (
		this: HTMLCanvasElement,
		kind: string,
	) {
		if (kind === '2d') {
			return stub2dContext(this);
		}

		return null;
	} as HTMLCanvasElement['getContext'];
	manuallyManagedGifCache.set('test.gif', gifState);
});

afterEach(() => {
	cleanup();
	globalThis.Worker = OriginalWorker;
	HTMLCanvasElement.prototype.getContext = originalGetContext;
	manuallyManagedGifCache.clear();
});

test('<Gif> registers its canvas as the outline ref', async () => {
	const registeredSequences: RegisteredSequence[] = [];
	const ref = React.createRef<HTMLCanvasElement>();

	render(
		<SequenceRegistrationWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Gif ref={ref} src="test.gif" />
		</SequenceRegistrationWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences[0]?.refForOutline?.current).toBeInstanceOf(
			HTMLCanvasElement,
		);
	});

	const refForOutline = registeredSequences[0]
		.refForOutline as React.RefObject<HTMLCanvasElement | null>;
	expect(ref.current).toBe(refForOutline.current);
});
