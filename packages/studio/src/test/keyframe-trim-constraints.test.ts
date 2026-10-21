import {expect, test} from 'bun:test';
import {CodemodsInternals, getNodeProps, getNodes} from '@remotion/codemods';
import {CanvasInternals} from '@remotion/sdk';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {waitFor} from '@testing-library/react';
import type {
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals, interpolate} from 'remotion';
import {getKeyframeTrimConstraints} from '../components/Timeline/get-keyframe-trim-constraints';
import {
	getTimelineSequenceDurationDragChanges,
	getTimelineSequenceDurationDragTargets,
	getTimelineSequenceLeftEdgeDragChanges,
	getTimelineSequenceLeftEdgeDragTargets,
} from '../components/Timeline/TimelineSequenceRightEdgeDragHandle';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';
import {makeRuntimeValueStore} from './make-runtime-value-store';

const config = (durationInFrames: number) => ({
	durationInFrames,
	fps: 30,
	width: 1920,
	height: 1080,
});

const makeSequence = ({
	id,
	parent,
	duration,
	contextDuration,
	runtime,
}: {
	id: string;
	parent: string | null;
	duration: number;
	contextDuration: number;
	runtime: Record<string, unknown>;
}): TSequence => ({
	id,
	parent,
	duration,
	from: 0,
	trimBefore: 0,
	type: 'sequence',
	sequencePlaybackRate: 1,
	displayName: id,
	documentationLink: null,
	showInTimeline: true,
	timelineOrder: null,
	loopDisplay: undefined,
	getStack: () => null,
	premountDisplay: null,
	postmountDisplay: null,
	refForOutline: null,
	effects: [],
	effectRuntimeValues: null,
	isInsideSeries: false,
	frozenFrame: null,
	controls: {
		schema: {},
		runtimeValues: makeRuntimeValueStore(runtime),
		overrideId: id,
		supportsEffects: true,
		componentIdentity: 'dev.remotion.remotion.Sequence',
		componentName: '<Sequence>',
		videoConfigValues: config(contextDuration),
	},
});

const makeFixture = (
	range: string,
	placement: 'child' | 'property' | 'effect',
	duration: number,
) => {
	const animation = 'interpolate(frame, frames, [0, 9, 9, 0])';
	const files: Record<string, string> = {
		'/trim-test/parent.tsx': `import {Sequence} from 'remotion'; export const App = () => <Sequence durationInFrames={${duration}}><Content /></Sequence>;`,
		'/trim-test/content.tsx': `import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {blur} from '@remotion/effects';
export const Content = () => {
 const {durationInFrames} = useVideoConfig(); const frame = useCurrentFrame(); const frames = ${range};
 return <AbsoluteFill ${placement === 'property' ? `opacity={${animation}}` : ''} ${placement === 'effect' ? `effects={[blur({radius: ${animation}})]}` : ''}>
 ${placement === 'child' ? `<circle r={${animation}} />` : ''}</AbsoluteFill>;
};`,
		'/trim-test/unrelated.tsx': `import {Sequence} from 'remotion'; export const Other = () => <Sequence durationInFrames={90} />;`,
	};
	const project = {rootDir: '/trim-test', files};
	const mappings: OverrideIdToNodePaths = {};
	const propStatuses: PropStatuses = {};
	for (const [id, fileName] of [
		['parent', 'parent'],
		['child', 'content'],
		['unrelated', 'unrelated'],
	]) {
		const node = getNodes({project, filePath: `/trim-test/${fileName}.tsx`})[0];
		const nodePath: SequencePropsSubscriptionKey = {
			absolutePath: node.filePath,
			nodePath: node.nodePath,
			sequenceKeys: ['durationInFrames'],
			effectKeys: [],
			videoConfigValues: null,
		};
		mappings[id] = nodePath;
		propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] =
			getNodeProps({
				project,
				node,
				keys: nodePath.sequenceKeys,
				effectKeys: [],
			});
	}

	const sequences = [
		makeSequence({
			id: 'parent',
			parent: null,
			duration,
			contextDuration: 1000,
			runtime: {durationInFrames: duration},
		}),
		makeSequence({
			id: 'child',
			parent: 'parent',
			duration,
			contextDuration: duration,
			runtime: {},
		}),
		makeSequence({
			id: 'unrelated',
			parent: null,
			duration: 90,
			contextDuration: 1000,
			runtime: {durationInFrames: 90},
		}),
	];
	return {files, mappings, propStatuses, sequences};
};

const prepareSource = (fixture: ReturnType<typeof makeFixture>) => {
	for (const nodePath of Object.values(fixture.mappings)) {
		const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
		const status = fixture.propStatuses[key];
		if (!status?.canUpdate) throw new Error('Expected editable fixture');
		expect(status.durationDependentKeyframes).toBeNull();
		fixture.propStatuses[key] = {
			...status,
			durationDependentKeyframes:
				CodemodsInternals.getDurationDependentKeyframesFromContent({
					fileContents: fixture.files[nodePath.absolutePath],
					nodePath: nodePath.nodePath,
				}),
		};
	}
};

const getTargets = (
	fixture: ReturnType<typeof makeFixture>,
	propStatuses: PropStatuses,
	id: string,
) => {
	const calculate = CanvasInternals.createTimelineCalculator();
	const {tracks} = calculate({
		sequences: fixture.sequences,
		overrideIdsToNodePaths: fixture.mappings,
	});
	const nodePathInfo = tracks.find(
		(track) => track.sequence.id === id,
	)?.nodePathInfo;
	if (!nodePathInfo) throw new Error('Expected fixture track');
	return getTimelineSequenceDurationDragTargets({
		draggedNodePathInfo: nodePathInfo,
		draggedSequenceMediaDurationDragLimits: null,
		selectedSequenceMediaDurationDragLimits: null,
		selectedItems: [],
		sequences: fixture.sequences,
		tracks,
		propStatuses,
		timelineDurationInFrames: 1000,
	})!;
};

const makeSourceOnlyFixture = ({
	trimBefore,
	explicitDuration,
	playbackRate,
	parentPlaybackRate,
	range,
}: {
	trimBefore: number;
	explicitDuration: boolean;
	playbackRate: number;
	parentPlaybackRate: number;
	range: string;
}) => {
	const calculate = CanvasInternals.createTimelineCalculator();
	const fixture = makeFixture(range, 'child', 120);
	// A declared source out-point bounds these unit tests without fetching media.
	const runtime = {
		from: 0,
		trimBefore,
		trimAfter: 300,
		playbackRate,
		...(explicitDuration ? {durationInFrames: 120 * playbackRate} : {}),
	};
	fixture.files['/trim-test/parent.tsx'] =
		`import {Video} from '@remotion/media';
export const App = () => <Video from={0} trimBefore={${trimBefore}} trimAfter={300} playbackRate={${playbackRate}} ${explicitDuration ? `durationInFrames={${120 * playbackRate}}` : ''} />;`;
	fixture.sequences[0] = {
		...makeSequence({
			id: 'parent',
			parent: 'outer',
			duration: 120,
			contextDuration: 120,
			runtime,
		}),
		type: 'video',
		src: 'source-only-fixture.mp4',
		muted: true,
		mediaFrameAtSequenceZero: null,
		frozenMediaFrame: null,
		playbackRate,
		startMediaFrom: trimBefore,
		// Media seeks through its runtime trim; its enclosing Sequence is untrimmed.
		trimBefore: 0,
		autoDuration: !explicitDuration,
	};
	fixture.sequences[0].controls!.componentIdentity = 'dev.remotion.media.Video';
	fixture.sequences[1].controls!.videoConfigValues = config(120 + trimBefore);
	fixture.sequences.push({
		...makeSequence({
			id: 'outer',
			parent: null,
			duration: 90 / parentPlaybackRate,
			contextDuration: 1000,
			runtime: {from: 60, durationInFrames: 90, trimBefore: 30},
		}),
		from: 60,
		trimBefore: 30,
		sequencePlaybackRate: parentPlaybackRate,
	});
	const node = getNodes({
		project: {rootDir: '/trim-test', files: fixture.files},
		filePath: '/trim-test/parent.tsx',
	})[0];
	const nodePath = {
		...fixture.mappings.parent,
		nodePath: node.nodePath,
		sequenceKeys: [
			'from',
			'durationInFrames',
			'trimBefore',
			'trimAfter',
			'playbackRate',
		],
	};
	fixture.mappings.parent = nodePath;
	fixture.propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] =
		getNodeProps({
			project: {rootDir: '/trim-test', files: fixture.files},
			node,
			keys: nodePath.sequenceKeys,
			effectKeys: [],
		});
	prepareSource(fixture);
	const {tracks} = calculate({
		sequences: fixture.sequences,
		overrideIdsToNodePaths: fixture.mappings,
	});
	const mediaTrack = tracks.find((track) => track.sequence.id === 'parent')!;
	return {
		fixture,
		mediaTrack,
		targets: getTimelineSequenceLeftEdgeDragTargets({
			draggedNodePathInfo: mediaTrack.nodePathInfo!,
			selectedItems: [],
			sequences: fixture.sequences,
			tracks,
			propStatuses: fixture.propStatuses,
			timelineDurationInFrames: 1000,
			trimBeforeOnly: true,
			rippleEdit: false,
		})!,
	};
};

test.each([
	{
		trimBefore: 0,
		explicitDuration: false,
		playbackRate: 1,
		parentPlaybackRate: 1,
		midDelta: 15,
		midFrom: 15,
		maximumTrim: 180,
	},
	{
		trimBefore: 20,
		explicitDuration: false,
		playbackRate: 1,
		parentPlaybackRate: 1,
		midDelta: 35,
		midFrom: 15,
		maximumTrim: 180,
	},
	{
		trimBefore: 20,
		explicitDuration: true,
		playbackRate: 1,
		parentPlaybackRate: 1,
		midDelta: 35,
		midFrom: 15,
		maximumTrim: 180,
	},
	{
		trimBefore: 20,
		explicitDuration: true,
		playbackRate: 0.5,
		parentPlaybackRate: 2,
		midDelta: 28,
		midFrom: 16,
		maximumTrim: 240,
	},
	{
		trimBefore: 20,
		explicitDuration: false,
		playbackRate: 2,
		parentPlaybackRate: 0.5,
		midDelta: 50,
		midFrom: 15,
		maximumTrim: 60,
	},
])('source-only trims preserve the visible range: %j', (testCase) => {
	const calculate = CanvasInternals.createTimelineCalculator();
	const {fixture, targets, mediaTrack} = makeSourceOnlyFixture({
		...testCase,
		range: '[0, 1]',
	});
	expect(targets).toHaveLength(1);
	const initial: Record<'from' | 'trimBefore' | 'durationInFrames', number> = {
		from: 0,
		trimBefore: testCase.trimBefore,
		durationInFrames: 120 * testCase.playbackRate,
	};
	for (const [deltaFrames, expected] of [
		[0, initial],
		[
			testCase.trimBefore / testCase.playbackRate / testCase.parentPlaybackRate,
			{...initial, trimBefore: 0},
		],
		[
			testCase.midDelta,
			{
				from: testCase.midFrom,
				trimBefore: 0,
				durationInFrames:
					(testCase.explicitDuration ? 120 - testCase.midFrom : 120) *
					testCase.playbackRate,
			},
		],
		[
			1000,
			{
				from: 30,
				trimBefore: 0,
				durationInFrames:
					(testCase.explicitDuration ? 90 : 120) * testCase.playbackRate,
			},
		],
		[-1000, {...initial, trimBefore: testCase.maximumTrim}],
	] as const) {
		const changes = getTimelineSequenceLeftEdgeDragChanges({
			targets,
			deltaFrames,
			trimBeforeOnly: true,
		});
		const actual = {...initial};
		for (const change of changes) {
			expect(change.fileName).toBe(fixture.mappings.parent.absolutePath);
			actual[change.fieldKey as keyof typeof actual] = change.value as number;
		}

		expect(actual).toEqual(expected);
		if (deltaFrames === 0) expect(changes).toEqual([]);
		const updatedTracks = calculate({
			sequences: fixture.sequences.map((sequence) =>
				sequence.id === 'parent'
					? {
							...sequence,
							from: actual.from,
							duration: actual.durationInFrames / testCase.playbackRate,
						}
					: sequence,
			),
			overrideIdsToNodePaths: fixture.mappings,
		}).tracks;
		const updated = updatedTracks.find(
			(track) => track.sequence.id === 'parent',
		)!;
		expect(updated.sequence.from).toBe(mediaTrack.sequence.from);
		expect(updated.sequence.duration).toBe(mediaTrack.sequence.duration);
	}
});

test.each([
	{
		range: '[0, durationInFrames - 130]',
		minimumTrim: 11,
		reason: 'Keyframe constraint',
	},
	{
		range: '[0, Math.max(1, durationInFrames - 50)]',
		minimumTrim: 20,
		reason: 'Computed keyframes',
	},
])(
	'source-only trims respect the keyframe floor: %j',
	({range, minimumTrim, reason}) => {
		const {targets} = makeSourceOnlyFixture({
			trimBefore: 20,
			explicitDuration: true,
			playbackRate: 1,
			parentPlaybackRate: 1,
			range,
		});
		const changes = getTimelineSequenceLeftEdgeDragChanges({
			targets,
			deltaFrames: 1000,
			trimBeforeOnly: true,
		});
		expect(changes.map(({fieldKey, value}) => [fieldKey, value])).toEqual(
			minimumTrim === 20 ? [] : [['trimBefore', minimumTrim]],
		);
		expect(targets[0].sourceOnlyLimits?.minimumReason).toBe(reason);
	},
);

test('source-only edits do not replace an animated trimBefore', () => {
	const calculate = CanvasInternals.createTimelineCalculator();
	const {fixture} = makeSourceOnlyFixture({
		trimBefore: 20,
		explicitDuration: true,
		playbackRate: 1,
		parentPlaybackRate: 1,
		range: '[0, 1]',
	});
	const filePath = fixture.mappings.parent.absolutePath;
	fixture.files[filePath] = `import {Video} from '@remotion/media';
import {interpolate, useCurrentFrame} from 'remotion';
export const App = () => {
 const frame = useCurrentFrame();
 return <Video from={0} durationInFrames={120} trimBefore={interpolate(frame, [0, 120], [20, 40])} />;
};`;
	const project = {rootDir: '/trim-test', files: fixture.files};
	const node = getNodes({project, filePath})[0];
	const nodePath = {...fixture.mappings.parent, nodePath: node.nodePath};
	fixture.mappings.parent = nodePath;
	fixture.propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)] =
		getNodeProps({project, node, keys: nodePath.sequenceKeys, effectKeys: []});
	expect(
		Internals.getPropStatusesCtx(fixture.propStatuses, nodePath)?.trimBefore
			.status,
	).toBe('keyframed');
	const {tracks} = calculate({
		sequences: fixture.sequences,
		overrideIdsToNodePaths: fixture.mappings,
	});
	const track = tracks.find((item) => item.sequence.id === 'parent')!;
	expect(
		getTimelineSequenceLeftEdgeDragTargets({
			draggedNodePathInfo: track.nodePathInfo!,
			selectedItems: [],
			sequences: fixture.sequences,
			tracks,
			propStatuses: fixture.propStatuses,
			timelineDurationInFrames: 1000,
			trimBeforeOnly: true,
			rippleEdit: false,
		}),
	).toBeNull();
});

test.each(['child', 'property', 'effect'] as const)(
	'trimming respects %s keyframes',
	(placement) => {
		const fixture = makeFixture(
			'[10, 21, durationInFrames - 18, durationInFrames - 8]',
			placement,
			90,
		);
		prepareSource(fixture);
		const changes = getTimelineSequenceDurationDragChanges({
			targets: getTargets(fixture, fixture.propStatuses, 'parent'),
			deltaFrames: -100,
		});
		expect(changes).toMatchObject([
			{
				fileName: '/trim-test/parent.tsx',
				fieldKey: 'durationInFrames',
				value: 40,
			},
		]);
		expect(interpolate(21, [10, 21, 22, 32], [0, 9, 9, 0])).toBe(9);
		expect(() => interpolate(21, [10, 21, 21, 31], [0, 9, 9, 0])).toThrow(
			'strictly',
		);
	},
);

test.each([
	['[0, 10, durationInFrames, 90]', 11, 89],
	['[0, 10, durationInFrames / 2, durationInFrames - 8]', 21, 1000],
	['[0, 10, 90 - durationInFrames, durationInFrames]', 46, 79],
	[
		'[0, 10, Math.max(20, durationInFrames - 18), durationInFrames - 8]',
		60,
		60,
	],
] as const)('clamps both ends for %s', (range, minimum, maximum) => {
	const fixture = makeFixture(range, 'child', 60);
	prepareSource(fixture);
	const targets = getTargets(fixture, fixture.propStatuses, 'parent');
	expect(targets[0].minimumDuration).toBe(minimum);
	expect(targets[0].maximumDuration).toBe(maximum);
	for (const [deltaFrames, value] of [
		[-1000, minimum],
		[1000, maximum],
	]) {
		const changes = getTimelineSequenceDurationDragChanges({
			targets,
			deltaFrames,
		});
		// A locked range produces no source edit.
		expect(changes[0]?.value ?? 60).toBe(value);
	}

	if (minimum === maximum)
		expect(targets[0].minimumDurationReason).toBe('Computed keyframes');
});

test.each([
	'dev.remotion.remotion.Sequence',
	'dev.remotion.remotion.Series.Sequence',
	'dev.remotion.transitions.TransitionSeries.Sequence',
])('left-edge trims respect keyframe bounds for %s', (componentIdentity) => {
	const calculate = CanvasInternals.createTimelineCalculator();
	for (const {
		range,
		deltaFrames,
		from,
		trimBefore,
		playbackRate,
		expectedDuration,
	} of [
		{
			range: '[0, durationInFrames - 50]',
			deltaFrames: 40,
			from: 0,
			trimBefore: 0,
			playbackRate: 1,
			expectedDuration: 51,
		},
		{
			range: '[0, durationInFrames - 50]',
			deltaFrames: 40,
			from: 0,
			trimBefore: 0,
			playbackRate: 2,
			expectedDuration: 52,
		},
		{
			range: '[0, durationInFrames, 100]',
			deltaFrames: -40,
			from: 30,
			trimBefore: 30,
			playbackRate: 1,
			expectedDuration: 69,
		},
		{
			range: '[0, Math.max(1, durationInFrames - 50)]',
			deltaFrames: 40,
			from: 0,
			trimBefore: 0,
			playbackRate: 1,
			expectedDuration: 60,
		},
	]) {
		const fixture = makeFixture(range, 'child', 60);
		const parentPath = fixture.mappings.parent;
		fixture.files[parentPath.absolutePath] =
			`import {Sequence} from 'remotion'; export const App = () => <Sequence from={${from}} trimBefore={${trimBefore}} durationInFrames={60}><Content /></Sequence>;`;
		const parentNode = getNodes({
			project: {rootDir: '/trim-test', files: fixture.files},
			filePath: parentPath.absolutePath,
		})[0];
		fixture.mappings.parent = {
			...parentPath,
			nodePath: parentNode.nodePath,
			sequenceKeys: ['durationInFrames', 'from', 'trimBefore'],
		};
		fixture.propStatuses[
			Internals.makeSequencePropsSubscriptionKey(fixture.mappings.parent)
		] = getNodeProps({
			project: {rootDir: '/trim-test', files: fixture.files},
			node: parentNode,
			keys: fixture.mappings.parent.sequenceKeys,
			effectKeys: [],
		});
		fixture.sequences[0].from = from;
		fixture.sequences[0].trimBefore = trimBefore;
		fixture.sequences[0].duration = 60 / playbackRate;
		fixture.sequences[0].sequencePlaybackRate = playbackRate;
		fixture.sequences[0].controls!.componentIdentity = componentIdentity;
		fixture.sequences[1].controls!.videoConfigValues = config(60 + trimBefore);
		prepareSource(fixture);
		const {tracks} = calculate({
			sequences: fixture.sequences,
			overrideIdsToNodePaths: fixture.mappings,
		});
		const targets = getTimelineSequenceLeftEdgeDragTargets({
			draggedNodePathInfo: tracks.find(
				(track) => track.sequence.id === 'parent',
			)!.nodePathInfo!,
			selectedItems: [],
			sequences: fixture.sequences,
			tracks,
			propStatuses: fixture.propStatuses,
			timelineDurationInFrames: 1000,
			trimBeforeOnly: false,
			rippleEdit: false,
		});
		expect(targets).not.toBeNull();
		const changes = getTimelineSequenceLeftEdgeDragChanges({
			targets: targets!,
			deltaFrames,
			trimBeforeOnly: false,
		});
		expect(
			changes.find((change) => change.fieldKey === 'durationInFrames')?.value ??
				60,
		).toBe(expectedDuration);
		const appliedDelta = (60 - expectedDuration) / playbackRate;
		expect(
			changes.find((change) => change.fieldKey === 'trimBefore')?.value ??
				trimBefore,
		).toBe(trimBefore + appliedDelta * playbackRate);
		if (componentIdentity === 'dev.remotion.remotion.Sequence') {
			expect(
				changes.find((change) => change.fieldKey === 'from')?.value ?? from,
			).toBe(from + appliedDelta);
		} else {
			expect(changes.some((change) => change.fieldKey === 'from')).toBe(false);
		}
	}
});

test('converts descendant constraints through offsets and playback rates', () => {
	const fixture = makeFixture(
		'[10, 21, durationInFrames - 18, durationInFrames - 8]',
		'child',
		90,
	);
	prepareSource(fixture);
	fixture.sequences[0] = {
		...fixture.sequences[0],
		parent: 'outer',
		from: 10,
		duration: 45,
		sequencePlaybackRate: 2,
	};
	fixture.sequences.unshift(
		makeSequence({
			id: 'outer',
			parent: null,
			duration: 200,
			contextDuration: 1000,
			runtime: {durationInFrames: 200},
		}),
	);
	fixture.mappings.outer = {
		...fixture.mappings.parent,
		absolutePath: '/trim-test/outer.tsx',
	};
	fixture.propStatuses[
		Internals.makeSequencePropsSubscriptionKey(fixture.mappings.outer)
	] = {
		canUpdate: true,
		durationDependentKeyframes: null,
		effects: [],
		props: {
			durationInFrames: {
				status: 'static',
				codeValue: 200,
				keyframeDisplayOffsetAdjustment: null,
			},
		},
	};
	const targets = getTargets(fixture, fixture.propStatuses, 'outer');
	expect(
		getTimelineSequenceDurationDragChanges({targets, deltaFrames: -1000})[0]
			.value,
	).toBe(30);
});

test('trims synchronously while affected source loads and refreshes cached constraints after changes', async () => {
	const fixture = makeFixture(
		'[10, 21, durationInFrames - 18, durationInFrames - 8]',
		'child',
		90,
	);
	const previousOperations = window.remotion_browserStudio;
	const reads: string[] = [];
	let emit: (event: EventSourceEvent) => void = () => {
		throw new Error('Not subscribed');
	};

	let pendingRead: Promise<string | null> | null = null;
	// Only host file I/O and watcher events are faked; parsing and trim math stay real.
	window.remotion_browserStudio = makeBrowserStudioOperations({
		subscribeToEvent: (listener) => {
			emit = listener;
			return () => undefined;
		},
		getFileSource: (fileName) => {
			reads.push(fileName);
			return pendingRead ?? Promise.resolve(fixture.files[fileName] ?? null);
		},
	});
	const load = () =>
		getKeyframeTrimConstraints({
			propStatuses: fixture.propStatuses,
			overrideIdsToNodePaths: fixture.mappings,
			sequences: fixture.sequences,
			affectedNodePaths: [fixture.mappings.parent],
		});
	const sourceChanged = () =>
		emit({
			type: 'sequence-props-updated',
			fileName: './content.tsx',
			nodePath: fixture.mappings.child,
			result:
				fixture.propStatuses[
					Internals.makeSequencePropsSubscriptionKey(fixture.mappings.child)
				]!,
		});
	try {
		const first = load();
		const concurrent = load();
		expect(first).not.toBeInstanceOf(Promise);
		expect(getTargets(fixture, first, 'parent')[0].minimumDuration).toBe(1);
		expect(getTargets(fixture, concurrent, 'parent')[0].minimumDuration).toBe(
			1,
		);
		await waitFor(() => {
			expect(getTargets(fixture, load(), 'parent')[0].minimumDuration).toBe(40);
		});
		expect(reads.sort()).toEqual([
			'/trim-test/content.tsx',
			'/trim-test/parent.tsx',
		]);
		// Background completion cannot change bounds already captured by an edit.
		expect(getTargets(fixture, first, 'parent')[0].minimumDuration).toBe(1);
		load();
		expect(reads).toHaveLength(2);

		fixture.files['/trim-test/content.tsx'] = fixture.files[
			'/trim-test/content.tsx'
		].replace('[10, 21,', '[10, 31,');
		sourceChanged();
		expect(getTargets(fixture, load(), 'parent')[0].minimumDuration).toBe(1);
		await waitFor(() => {
			expect(getTargets(fixture, load(), 'parent')[0].minimumDuration).toBe(50);
		});
		expect(reads.slice(2)).toEqual(['/trim-test/content.tsx']);

		let finishRead!: (source: string) => void;
		pendingRead = new Promise((resolve) => {
			finishRead = resolve;
		});
		sourceChanged();
		const stale = load();
		sourceChanged();
		finishRead(fixture.files['/trim-test/content.tsx']);
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(getTargets(fixture, stale, 'parent')[0].minimumDuration).toBe(1);
		pendingRead = Promise.resolve(null);
		expect(getTargets(fixture, load(), 'parent')[0].minimumDuration).toBe(1);
		await new Promise((resolve) => setTimeout(resolve, 0));
		pendingRead = null;
		await waitFor(() => {
			expect(getTargets(fixture, load(), 'parent')[0].minimumDuration).toBe(50);
		});
	} finally {
		emit({type: 'hmr', hmrEvent: {action: 'building'}});
		window.remotion_browserStudio = previousOperations;
	}
});
