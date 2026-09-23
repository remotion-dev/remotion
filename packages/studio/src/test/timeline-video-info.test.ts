import {afterEach, expect, test} from 'bun:test';
import {
	getLoopDisplaySegments,
	sliceVisibleWaveformPeaks,
} from '@remotion/timeline-utils';
import type {
	InteractivitySchema,
	SequenceRegistrationControls,
	TSequence,
} from 'remotion';
import {getTimelineMediaStartFrame} from '../components/Timeline/get-timeline-media-start-frame';
import {getTimelineMediaVisualizationLayout} from '../components/Timeline/get-timeline-media-visualization-layout';
import {getTimelineVideoInfoWidths} from '../components/Timeline/get-timeline-video-info-widths';
import {
	getTimelineAssetSrcFromSchema,
	getTimelineAssetLinkInfo,
	openTimelineAssetLink,
	splitRemoteSourceForMiddleEllipsis,
} from '../components/Timeline/timeline-asset-link';
import {getTimelineVideoFilmstripTimes} from '../components/Timeline/timeline-video-filmstrip-times';
import {toFileToken} from '../components/Timeline/TimelineAssetField';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {isVideoWithLastFrameHold} from '../helpers/is-video-with-last-frame-hold';
import {makeRuntimeValueStore} from './make-runtime-value-store';

type TestWindow = Pick<
	Window,
	| 'history'
	| 'location'
	| 'open'
	| 'remotion_isReadOnlyStudio'
	| 'remotion_staticBase'
>;

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

const installTestWindow = ({
	onPushState,
	onOpen,
}: {
	onPushState: (url: string | URL | null | undefined) => void;
	onOpen: Window['open'];
}) => {
	const testWindow: TestWindow = {
		remotion_staticBase: '/static-abcdef',
		remotion_isReadOnlyStudio: false,
		history: {
			pushState: (_state, _title, url) => onPushState(url),
		} as History,
		location: {
			pathname: '/',
		} as Location,
		open: onOpen,
	};

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: testWindow,
	});
};

const makeSequenceControls = ({
	schema,
	currentRuntimeValueDotNotation,
}: {
	schema: InteractivitySchema;
	currentRuntimeValueDotNotation: Record<string, unknown>;
}): SequenceRegistrationControls => ({
	componentIdentity: null,
	componentName: 'Test',
	runtimeValues: makeRuntimeValueStore(currentRuntimeValueDotNotation),
	videoConfigValues: null,
	overrideId: 'test',
	schema,
	supportsEffects: false,
});

test('video timeline thumbnails ignore premount and postmount width', () => {
	const withoutPremount = getTimelineVideoInfoWidths({
		visualizationWidth: 400,
		naturalWidth: 500,
		premountWidth: 0,
		postmountWidth: 20,
	});
	const withPremount = getTimelineVideoInfoWidths({
		visualizationWidth: 510,
		naturalWidth: 610,
		premountWidth: 110,
		postmountWidth: 20,
	});

	expect(withPremount).toEqual(withoutPremount);
});

test('timeline media visualizations exclude premount and postmount width', () => {
	expect(
		getTimelineMediaVisualizationLayout({
			visualizationWidth: 510,
			premountWidth: 110,
			postmountWidth: 20,
		}),
	).toEqual({
		marginLeft: 110,
		width: 380,
	});
});

test('timeline media visualization widths never go negative', () => {
	expect(
		getTimelineMediaVisualizationLayout({
			visualizationWidth: 100,
			premountWidth: 70,
			postmountWidth: 70,
		}),
	).toEqual({
		marginLeft: 70,
		width: 0,
	});
});

test('video timeline thumbnail widths never go negative', () => {
	expect(
		getTimelineVideoInfoWidths({
			visualizationWidth: 100,
			naturalWidth: 80,
			premountWidth: 70,
			postmountWidth: 70,
		}),
	).toEqual({
		mediaVisualizationWidth: 0,
		mediaNaturalWidth: 0,
	});
});

test('@remotion/media Video holds its last frame', () => {
	expect(
		isVideoWithLastFrameHold({
			type: 'video',
			controls: {
				componentIdentity: 'dev.remotion.media.Video',
			},
		} as TSequence),
	).toBe(true);

	expect(
		isVideoWithLastFrameHold({
			type: 'video',
			controls: null,
		} as TSequence),
	).toBe(false);
});

test('video timeline filmstrip range starts at the registered media frame', () => {
	expect(
		getTimelineVideoFilmstripTimes({
			trimBefore: 908,
			durationInFrames: 120,
			playbackRate: 1,
			fps: 30,
			loopDisplay: undefined,
			frozenMediaFrame: null,
		}),
	).toEqual({
		type: 'range',
		fromSeconds: 908 / 30,
		toSeconds: (908 + 120) / 30,
	});
});

test('video timeline media start applies playback rate after sequence zero', () => {
	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: 5,
			mediaFrameAtSequenceZero: 5,
			sequenceFrameOffset: 10,
			playbackRate: 2,
		}),
	).toBe(25);
});

test('video timeline media start includes trimBefore with no sequence offset', () => {
	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: 31,
			mediaFrameAtSequenceZero: 31,
			sequenceFrameOffset: 0,
			playbackRate: 1,
		}),
	).toBe(31);
});

test('legacy video timeline media start keeps its playback rate behavior', () => {
	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: 10,
			mediaFrameAtSequenceZero: null,
			sequenceFrameOffset: 10,
			playbackRate: 2,
		}),
	).toBe(10);
});

test('video timeline filmstrip uses one timestamp for frozen video', () => {
	expect(
		getTimelineVideoFilmstripTimes({
			trimBefore: 5,
			durationInFrames: 120,
			playbackRate: 1,
			fps: 30,
			loopDisplay: undefined,
			frozenMediaFrame: 29,
		}),
	).toEqual({
		type: 'frozen',
		timestampInSeconds: 29 / 30,
	});
});

test('inspector asset source is derived from the src asset schema', () => {
	const controls = makeSequenceControls({
		schema: {
			src: {
				type: 'asset',
				default: undefined,
				description: 'Source',
				keyframable: false,
			},
		},
		currentRuntimeValueDotNotation: {
			src: '/static-abcdef/video.mp4',
		},
	});

	expect(getTimelineAssetSrcFromSchema(controls)).toBe(
		'/static-abcdef/video.mp4',
	);
});

test('inspector ignores runtime src values without a src asset schema', () => {
	const controls = makeSequenceControls({
		schema: {},
		currentRuntimeValueDotNotation: {
			src: '/static-abcdef/video.mp4',
		},
	});

	expect(getTimelineAssetSrcFromSchema(controls)).toBeNull();
	expect(getTimelineAssetSrcFromSchema(null)).toBeNull();
});

test('asset selections serialize to staticFile source tokens', () => {
	expect(toFileToken('video.mp4')).toBe('remotion-file:video.mp4');
	expect(toFileToken('folder name/video #1.mp4')).toBe(
		'remotion-file:folder%20name/video%20%231.mp4',
	);
});

test('timeline asset links resolve staticFile source tokens', () => {
	expect(
		getTimelineAssetLinkInfo('remotion-file:folder%20name/video%20%231.mp4'),
	).toEqual({
		kind: 'local',
		assetPath: 'folder name/video #1.mp4',
		title: 'folder name/video #1.mp4',
	});
});

test('timeline local asset links select the asset and push the asset route', () => {
	const pushedUrls: (string | URL | null | undefined)[] = [];
	installTestWindow({
		onPushState: (url) => {
			pushedUrls.push(url);
		},
		onOpen: () => null,
	});

	const linkInfo = getTimelineAssetLinkInfo(
		'/static-abcdef/folder%20name/image.png',
	);
	const selectedAssets: string[] = [];

	expect(linkInfo).toEqual({
		kind: 'local',
		assetPath: 'folder name/image.png',
		title: 'folder name/image.png',
	});

	if (!linkInfo) {
		throw new Error('Expected local asset link');
	}

	openTimelineAssetLink(linkInfo, (asset) => {
		selectedAssets.push(asset);
	});

	expect(selectedAssets).toEqual(['folder name/image.png']);
	expect(pushedUrls).toEqual(['/assets/folder name/image.png']);
});

test('timeline remote asset links still open in a new tab', () => {
	const pushedUrls: (string | URL | null | undefined)[] = [];
	const openedUrls: Parameters<Window['open']>[] = [];
	installTestWindow({
		onPushState: (url) => {
			pushedUrls.push(url);
		},
		onOpen: (...args) => {
			openedUrls.push(args);
			return null;
		},
	});

	const linkInfo = getTimelineAssetLinkInfo('https://example.com/image.png');

	expect(linkInfo).toEqual({
		kind: 'remote',
		href: 'https://example.com/image.png',
		title: 'example.com',
	});

	if (!linkInfo) {
		throw new Error('Expected remote asset link');
	}

	openTimelineAssetLink(linkInfo, () => {
		throw new Error('Remote links should not select assets');
	});

	expect(openedUrls).toEqual([
		['https://example.com/image.png', '_blank', 'noopener,noreferrer'],
	]);
	expect(pushedUrls).toEqual([]);
});

test('remote asset URLs split before the filename for middle ellipsis', () => {
	const src = 'https://example.com/a/very/long/path/video.mp4?download=1';
	const parts = splitRemoteSourceForMiddleEllipsis(src);

	expect(parts).toEqual({
		leading: 'https://example.com/a/very/long/path/',
		trailing: 'video.mp4?download=1',
	});
	expect(parts.leading + parts.trailing).toBe(src);
});

test('filmstrips and waveform peaks follow nested sequence rates and trims', () => {
	const outer: TSequence = {
		controls: null,
		displayName: 'outer',
		documentationLink: null,
		duration: 100,
		effects: [],
		effectRuntimeValues: null,
		from: 10,
		frozenFrame: null,
		getStack: () => null,
		id: 'outer',
		isInsideSeries: false,
		loopDisplay: undefined,
		parent: null,
		postmountDisplay: null,
		premountDisplay: null,
		refForOutline: null,
		sequencePlaybackRate: 1.5,
		showInTimeline: true,
		timelineOrder: null,
		trimBefore: 6,
		type: 'sequence',
	};
	const inner: TSequence = {
		...outer,
		id: 'inner',
		parent: 'outer',
		from: 30,
		duration: 60,
		sequencePlaybackRate: 2,
		trimBefore: 8,
	};
	const media: TSequence = {
		...outer,
		id: 'media',
		parent: 'inner',
		from: 0,
		duration: 180,
		sequencePlaybackRate: 1,
		trimBefore: null,
		type: 'video',
		src: 'video.mp4',
		playbackRate: 0.5,
		mediaFrameAtSequenceZero: 5,
		startMediaFrom: 5,
		frozenMediaFrame: null,
		muted: false,
		doesVolumeChange: false,
		volume: 1,
	};
	const track = calculateTimeline({
		sequences: [outer, inner, media],
		overrideIdsToNodePaths: {},
	}).find((candidate) => candidate.sequence.id === 'media')!;
	if (track.sequence.type !== 'video') throw new Error('Expected video');
	const startFrame = getTimelineMediaStartFrame({
		startMediaFrom: track.sequence.startMediaFrom,
		mediaFrameAtSequenceZero: track.sequence.mediaFrameAtSequenceZero,
		sequenceFrameOffset: track.sequenceFrameOffset,
		playbackRate: track.sequence.playbackRate,
	});
	const playbackRate =
		track.sequence.playbackRate * track.sequence.sequencePlaybackRate;
	expect(startFrame).toBeCloseTo(9);
	const filmstrip = getTimelineVideoFilmstripTimes({
		trimBefore: startFrame,
		durationInFrames: track.sequence.duration,
		playbackRate,
		fps: 30,
		loopDisplay: undefined,
		frozenMediaFrame: null,
	});
	if (filmstrip.type !== 'range') throw new Error('Expected moving filmstrip');
	expect(filmstrip.fromSeconds).toBeCloseTo(0.3);
	expect(filmstrip.toSeconds).toBeCloseTo(2.3);

	// Scrolling ten composition frames into this track advances fifteen media frames.
	const peaks = sliceVisibleWaveformPeaks({
		displayOffsetInFrames: 10,
		displayDurationInFrames: 20,
		durationInFrames: track.sequence.duration,
		fps: 30,
		loopDisplay: undefined,
		peaks: Float32Array.from({length: 180}, (_, frame) => frame),
		playbackRate,
		startFrom: startFrame,
		waveformSampleRate: 30,
	});
	expect(peaks[0]).toBe(24);
	expect(peaks[peaks.length - 1]).toBe(53);

	// A parent trim can skip whole loops and most of the next iteration. Both
	// media-owned loops and HTML5's wrapping Loop must show the same clipped span.
	const trimmedParent: TSequence = {
		...outer,
		from: 30,
		duration: 90,
		sequencePlaybackRate: 2,
		trimBefore: 75,
	};
	const cycle = 27 / 0.7;
	for (const {iteration, parentDuration} of [
		{iteration: null, parentDuration: 90},
		{iteration: 1, parentDuration: 90},
		{iteration: 2, parentDuration: 90},
		{iteration: null, parentDuration: 4},
	]) {
		const loopingVideo: TSequence = {
			...media,
			parent: iteration === null ? 'outer' : 'media-trim',
			duration: iteration === null ? 255 : cycle + 12,
			playbackRate: 0.7,
			startMediaFrom: 12,
			mediaFrameAtSequenceZero: iteration === null ? 12 : 12 * (1 - 0.7),
			loopDisplay:
				iteration === null
					? {
							durationInFrames: cycle,
							numberOfTimes: 255 / cycle,
							startOffset: 0,
						}
					: undefined,
		};
		const loop: TSequence = {
			...outer,
			id: 'loop',
			parent: 'outer',
			from: (iteration ?? 0) * cycle,
			duration: cycle,
			sequencePlaybackRate: 1,
			trimBefore: null,
			loopDisplay: {
				durationInFrames: cycle,
				numberOfTimes: 255 / cycle,
				startOffset: -(iteration ?? 0) * cycle,
			},
		};
		const mediaTrim: TSequence = {
			...loop,
			id: 'media-trim',
			parent: 'loop',
			from: -12,
			duration: cycle + 12,
			loopDisplay: undefined,
		};
		const loopTrack = calculateTimeline({
			sequences:
				iteration === null
					? [{...trimmedParent, duration: parentDuration}, loopingVideo]
					: [
							{...trimmedParent, duration: parentDuration},
							loop,
							mediaTrim,
							loopingVideo,
						],
			overrideIdsToNodePaths: {},
		}).find((candidate) => candidate.sequence.id === 'media')!;
		if (loopTrack.sequence.type !== 'video') throw new Error('Expected video');
		const {sequence: loopedMedia} = loopTrack;
		const {loopDisplay} = loopedMedia;
		if (!loopDisplay) throw new Error('Expected loop display');
		const rate = loopedMedia.playbackRate * loopedMedia.sequencePlaybackRate;
		const cycleStartFrame =
			getTimelineMediaStartFrame({
				startMediaFrom: loopedMedia.startMediaFrom,
				mediaFrameAtSequenceZero: loopedMedia.mediaFrameAtSequenceZero,
				sequenceFrameOffset: loopTrack.sequenceFrameOffset,
				playbackRate: loopedMedia.playbackRate,
			}) -
			loopDisplay.mediaOffsetInFrames * rate;
		expect(loopedMedia.from + loopDisplay.startOffset).toBeCloseTo(30);
		expect(
			loopDisplay.durationInFrames * loopDisplay.numberOfTimes,
		).toBeCloseTo(parentDuration);
		expect(cycleStartFrame).toBeCloseTo(12);

		const segments = getLoopDisplaySegments({
			displayOffsetInFrames: loopDisplay.phaseOffsetInFrames,
			displayDurationInFrames: 4,
			loopDurationInFrames: loopDisplay.durationInFrames,
		});
		expect(segments).toHaveLength(2);
		const filmstrips = segments.map((segment) =>
			getTimelineVideoFilmstripTimes({
				trimBefore: cycleStartFrame + segment.loopOffsetInFrames * rate,
				durationInFrames: segment.durationInFrames,
				playbackRate: rate,
				fps: 30,
				loopDisplay: undefined,
				frozenMediaFrame: null,
			}),
		);
		expect(filmstrips[0]).toEqual({
			type: 'range',
			fromSeconds: expect.closeTo(1.25),
			toSeconds: expect.closeTo(1.3),
		});
		expect(filmstrips[1]).toEqual({
			type: 'range',
			fromSeconds: expect.closeTo(0.4),
			toSeconds: expect.closeTo(16.1 / 30),
		});
		const loopedPeaks = sliceVisibleWaveformPeaks({
			displayDurationInFrames: 4,
			displayOffsetInFrames: loopDisplay.phaseOffsetInFrames,
			durationInFrames: loopDisplay.durationInFrames,
			fps: 30,
			loopDisplay,
			peaks: Float32Array.from({length: 120}, (_, index) =>
				index >= 12 && index < 39 ? index : -1,
			),
			playbackRate: rate,
			startFrom: cycleStartFrame,
			waveformSampleRate: 30,
		});
		expect(Array.from(loopedPeaks)).toEqual([37, 38, 12, 13, 14, 15, 16]);
	}
});
