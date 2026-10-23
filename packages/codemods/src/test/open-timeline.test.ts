import {expect, test} from 'bun:test';
import {runInNewContext} from 'node:vm';
import type {Expression, JSXOpeningElement} from '@babel/types';
import * as recast from 'recast';
import {interpolate} from 'remotion';
import {
	addOpenTimelineComposition,
	OpenTimelineImportError,
} from '../add-open-timeline-composition';
import {applyCodemodChanges, type CodemodProject} from '../codemod-project';
import {generateOpenTimelineComposition} from '../open-timeline/generate';
import {normalizeOpenTimeline} from '../open-timeline/normalize';
import {parseAstForReadOnly} from '../sequence-props/parse-ast';

const time = (value: number, rate = 24) => ({
	OTIO_SCHEMA: 'RationalTime.1',
	value,
	rate,
});
const range = (start: number, duration: number, rate = 24) => ({
	OTIO_SCHEMA: 'TimeRange.1',
	start_time: time(start, rate),
	duration: time(duration, rate),
});
const clip = (name: string, start: number, duration: number, rate = 24) => ({
	OTIO_SCHEMA: 'Clip.1',
	name,
	source_range: range(start, duration, rate),
	media_reference: {
		OTIO_SCHEMA: 'ExternalReference.1',
		target_url: `${name}.mp4`,
		available_range: range(0, 2400),
	},
});
const gap = (duration: number) => ({
	OTIO_SCHEMA: 'Gap.1',
	source_range: range(0, duration),
});
const track = (children: unknown[], kind = 'Video') => ({
	OTIO_SCHEMA: 'Track.1',
	name: `${kind} track`,
	kind,
	children,
});
const timeline = (children: unknown[]) => ({
	OTIO_SCHEMA: 'Timeline.1',
	name: 'Imported timeline',
	tracks: {OTIO_SCHEMA: 'Stack.1', children},
});
const dissolve = (inOffset: number, outOffset: number) => ({
	OTIO_SCHEMA: 'Transition.1',
	name: 'Dissolve',
	transition_type: 'SMPTE_Dissolve',
	in_offset: time(inOffset),
	out_offset: time(outOffset),
});
const generate = (input: unknown, fps = 24) =>
	generateOpenTimelineComposition({
		timeline: input,
		componentName: 'ImportedTimeline',
		fps,
		width: 1920,
		height: 1080,
	});

const elements = (source: string | null, tag: string) => {
	expect(source).not.toBeNull();
	const found: JSXOpeningElement[] = [];
	recast.types.visit(parseAstForReadOnly(source!), {
		visitJSXOpeningElement(path) {
			if (
				path.node.name.type === 'JSXIdentifier' &&
				path.node.name.name === tag
			) {
				found.push(path.node as JSXOpeningElement);
			}

			return this.traverse(path);
		},
	});
	return found;
};

const prop = (element: JSXOpeningElement, name: string) => {
	const attribute = element.attributes.find(
		(value) => value.type === 'JSXAttribute' && value.name.name === name,
	);
	if (!attribute || attribute.type !== 'JSXAttribute') {
		return undefined;
	}

	if (attribute.value?.type === 'JSXExpressionContainer') {
		return attribute.value.expression;
	}

	return attribute.value;
};

const numeric = (expression: ReturnType<typeof prop>, fps = 24): number => {
	if (expression?.type === 'NumericLiteral') {
		return expression.value;
	}

	if (expression?.type === 'Identifier' && expression.name === 'fps') {
		return fps;
	}

	if (expression?.type === 'UnaryExpression' && expression.operator === '-') {
		return -numeric(expression.argument, fps);
	}

	if (expression?.type === 'BinaryExpression') {
		const left = numeric(expression.left as Expression, fps);
		const right = numeric(expression.right, fps);
		if (expression.operator === '+') return left + right;
		if (expression.operator === '-') return left - right;
		if (expression.operator === '*') return left * right;
		if (expression.operator === '/') return left / right;
	}

	throw new Error(
		`Expected a numeric timing expression, got ${expression?.type}`,
	);
};

// Evaluate controlled fixture expressions with their actual generated formatter.
const evaluateProp = (
	source: string,
	expression: NonNullable<ReturnType<typeof prop>>,
	frame: number,
	fps: number,
) => {
	const ast = parseAstForReadOnly(source);
	const helpers = ast.program.body.filter(
		(statement) => statement.type === 'VariableDeclaration',
	);
	const helperSource = helpers
		.map((statement) => recast.prettyPrint(statement).code)
		.join('\n');
	const transpiler = new Bun.Transpiler({loader: 'ts'});
	return runInNewContext(
		`${transpiler.transformSync(helperSource)}\n(${recast.prettyPrint(expression).code})`,
		{frame, fps, staticFile: (path: string) => `/public/${path}`, interpolate},
	);
};

test('OTIO source timecode is converted to a file-relative media trim', () => {
	const input = clip('Timecode', 1000, 50, 25);
	input.media_reference.available_range = range(900, 2500, 25);
	const result = generate(timeline([track([input])]), 30);
	expect(result.metadata).toEqual({
		fps: 30,
		width: 1920,
		height: 1080,
		durationInFrames: 60,
	});
	const video = elements(result.source, 'Video')[0];
	expect(numeric(prop(video, 'trimBefore'), 30)).toBe(120);
	expect(numeric(prop(video, 'durationInFrames'), 30)).toBe(60);
	expect(prop(video, 'premountFor')).toMatchObject({
		type: 'Identifier',
		name: 'fps',
	});
	expect(prop(video, 'muted')).not.toBeUndefined();
});

test('mixed rational rates and gaps preserve sequential placement without rounding each clip', () => {
	const input = timeline([
		track([clip('First', 0, 24), gap(12), clip('Second', 0, 25, 25)]),
	]);
	const result = generate(input, 30);
	expect(result.metadata?.durationInFrames).toBe(75);
	const videos = elements(result.source, 'Video');
	expect(videos).toHaveLength(2);
	expect(numeric(prop(videos[1], 'from'), 30)).toBe(45);
	expect(numeric(prop(videos[1], 'durationInFrames'), 30)).toBe(30);
	expect(elements(result.source, 'Solid')).toHaveLength(0);

	const fractional = generate(
		timeline([track([clip('Fraction', 0, 1, 25)])]),
		24,
	);
	expect(fractional.metadata?.durationInFrames).toBe(1);
	expect(
		numeric(prop(elements(fractional.source, 'Video')[0], 'durationInFrames')),
	).toBeCloseTo(0.96);
});

test('nested tracks and stacks preserve trim and simultaneous layer order', () => {
	const nested = {
		OTIO_SCHEMA: 'Stack.1',
		name: 'Nested scene',
		source_range: range(12, 24),
		children: [
			track([clip('Bottom', 48, 72)]),
			track([gap(24), clip('Top', 0, 24)]),
		],
	};
	const input = timeline([track([gap(24), nested, clip('End', 0, 24)])]);
	const normalized = normalizeOpenTimeline(input);
	expect(normalized.diagnostics).toEqual([]);
	expect(normalized.root?.duration).toBe(3);
	expect(normalized.root?.children[0].children[1]).toMatchObject({
		type: 'stack',
		sourceStart: 0.5,
		duration: 1,
	});
	const result = generate(input);
	expect(result.metadata?.durationInFrames).toBe(72);
	const videos = elements(result.source, 'Video');
	expect(videos.map((video) => prop(video, 'name'))).toEqual([
		expect.objectContaining({value: 'Bottom'}),
		expect.objectContaining({value: 'Top'}),
		expect.objectContaining({value: 'End'}),
	]);
	const scene = elements(result.source, 'Sequence').find((element) => {
		const name = prop(element, 'name');
		return name?.type === 'StringLiteral' && name.value === 'Nested scene';
	});
	expect(scene).toBeDefined();
	expect(numeric(prop(scene!, 'trimBefore'))).toBe(12);
	expect(numeric(prop(scene!, 'durationInFrames'))).toBe(24);
});

test('Clip.2 selects its active media reference and derives absent source_range', () => {
	const input = timeline([
		track([
			{
				OTIO_SCHEMA: 'Clip.2',
				name: 'Selected',
				active_media_reference_key: 'proxy',
				media_references: {
					original: {OTIO_SCHEMA: 'MissingReference.1'},
					proxy: {
						OTIO_SCHEMA: 'ExternalReference.1',
						target_url: 'https://example.com/proxy.mp4',
						available_range: range(240, 48),
					},
				},
			},
		]),
	]);
	const result = generate(input);
	expect(result.metadata?.durationInFrames).toBe(48);
	const video = elements(result.source, 'Video')[0];
	expect(prop(video, 'src')).toMatchObject({
		value: 'https://example.com/proxy.mp4',
	});
	expect(numeric(prop(video, 'trimBefore'))).toBe(0);
});

test('positive linear retiming preserves the OTIO edit duration', () => {
	const input = timeline([
		track([
			{
				...clip('Fast', 24, 48),
				effects: [{OTIO_SCHEMA: 'LinearTimeWarp.1', time_scalar: 2}],
			},
			clip('Following', 0, 24),
		]),
	]);
	const result = generate(input);
	expect(result.metadata?.durationInFrames).toBe(72);
	const videos = elements(result.source, 'Video');
	expect(numeric(prop(videos[0], 'trimBefore'))).toBe(24);
	expect(numeric(prop(videos[0], 'durationInFrames'))).toBe(96);
	expect(numeric(prop(videos[0], 'playbackRate'))).toBe(2);
	expect(numeric(prop(videos[1], 'from'))).toBe(48);
});

test('freeze frames hold the first selected frame for the full edit duration', () => {
	const result = generate(
		timeline([
			track([
				{
					...clip('Frozen', 24, 48),
					effects: [{OTIO_SCHEMA: 'FreezeFrame.1', time_scalar: 0}],
				},
			]),
		]),
	);
	const video = elements(result.source, 'Video')[0];
	expect(result.metadata?.durationInFrames).toBe(48);
	expect(numeric(prop(video, 'freeze'))).toBe(0);
	expect(numeric(prop(video, 'trimBefore'))).toBe(24);
	expect(numeric(prop(video, 'durationInFrames'))).toBe(48);
});

test('internal dissolves extend source handles without shortening the edit', () => {
	const result = generate(
		timeline([
			track([
				clip('Outgoing', 240, 48),
				dissolve(12, 6),
				clip('Incoming', 240, 48),
			]),
		]),
	);
	expect(result.metadata?.durationInFrames).toBe(96);
	const videos = elements(result.source, 'Video');
	expect(numeric(prop(videos[0], 'durationInFrames'))).toBe(54);
	expect(numeric(prop(videos[1], 'from'))).toBe(36);
	expect(numeric(prop(videos[1], 'trimBefore'))).toBe(228);
	expect(numeric(prop(videos[1], 'durationInFrames'))).toBe(60);
	expect(result.source).toContain('interpolate(');
});

test('Audio tracks use audio nodes and dissolve gain automation', () => {
	const result = generate(
		timeline([
			track(
				[clip('Outgoing', 240, 48), dissolve(12, 6), clip('Incoming', 240, 48)],
				'Audio',
			),
		]),
	);
	const audio = elements(result.source, 'Audio');
	expect(audio).toHaveLength(2);
	expect(elements(result.source, 'Video')).toHaveLength(0);
	expect(prop(audio[0], 'volume')).toBeDefined();
	expect(prop(audio[1], 'volume')).toBeDefined();
	expect(result.metadata?.durationInFrames).toBe(96);
});

test('disabled clips keep their edit duration but do not emit media', () => {
	const result = generate(
		timeline([
			track([
				{...clip('Disabled', 0, 48), enabled: false},
				clip('Following', 0, 24),
			]),
		]),
	);
	expect(result.metadata?.durationInFrames).toBe(72);
	const videos = elements(result.source, 'Video');
	expect(videos).toHaveLength(1);
	expect(numeric(prop(videos[0], 'from'))).toBe(48);
});

test('metadata, markers and global timecode are retained without shifting the edit', () => {
	const marker = {
		OTIO_SCHEMA: 'Marker.2',
		name: 'Review',
		marked_range: range(12, 6),
		color: 'RED',
		metadata: {comment: 'Keep this'},
	};
	const input = {
		...timeline([
			track([
				{...clip('Annotated', 0, 24), markers: [marker], metadata: {shot: 7}},
			]),
		]),
		global_start_time: time(86400),
		metadata: {project: 'Documentary'},
	};
	const result = generate(input);
	expect(result.metadata?.durationInFrames).toBe(24);
	expect(result.globalStartTime).toEqual({value: 86400, rate: 24});
	expect(result.annotations).toContainEqual({
		path: '$',
		metadata: {project: 'Documentary'},
		markers: [],
	});
	expect(result.annotations).toContainEqual({
		path: '$.tracks.children[0].children[0]',
		metadata: {shot: 7},
		markers: [marker],
	});
});

test('source generation is deterministic, does not mutate input and escapes strings', () => {
	const malicious = `quote'" <Video /> {globalThis.pwned = true} \u2028`;
	const input = timeline([
		track([
			{
				...clip('Escaped', 0, 24),
				name: malicious,
				media_reference: {
					OTIO_SCHEMA: 'ExternalReference.1',
					target_url: `https://example.com/${malicious}.mp4`,
				},
			},
		]),
	]);
	const original = JSON.stringify(input);
	const first = generate(input);
	const second = generate(JSON.stringify(input));
	expect(first).toEqual(second);
	expect(JSON.stringify(input)).toBe(original);
	const videos = elements(first.source, 'Video');
	expect(videos).toHaveLength(1);
	expect(prop(videos[0], 'name')).toMatchObject({value: malicious});
	expect(prop(videos[0], 'src')).toMatchObject({
		value: `https://example.com/${malicious}.mp4`,
	});
});

test.each([
	['invalid JSON', '{'],
	['wrong root', {OTIO_SCHEMA: 'SerializableCollection.1', children: []}],
	[
		'future schema',
		timeline([track([{...clip('Future', 0, 24), OTIO_SCHEMA: 'Clip.99'}])]),
	],
	[
		'zero rate',
		timeline([
			track([{...clip('Zero', 0, 24), source_range: range(0, 24, 0)}]),
		]),
	],
	['negative duration', timeline([track([clip('Negative', 0, -24)])])],
	[
		'unknown duration',
		timeline([
			track([
				{
					OTIO_SCHEMA: 'Clip.1',
					media_reference: {
						OTIO_SCHEMA: 'ExternalReference.1',
						target_url: 'video.mp4',
					},
				},
			]),
		]),
	],
	[
		'custom effect',
		timeline([
			track([
				{
					...clip('Effect', 0, 24),
					effects: [{OTIO_SCHEMA: 'Effect.1', effect_name: 'Glow'}],
				},
			]),
		]),
	],
	[
		'reverse playback',
		timeline([
			track([
				{
					...clip('Reverse', 24, 24),
					effects: [{OTIO_SCHEMA: 'LinearTimeWarp.1', time_scalar: -1}],
				},
			]),
		]),
	],
	[
		'boundary transition',
		timeline([track([dissolve(12, 6), clip('Boundary', 240, 48)])]),
	],
	[
		'missing media',
		timeline([
			track([
				{
					...clip('Missing', 0, 24),
					media_reference: {OTIO_SCHEMA: 'MissingReference.1'},
				},
			]),
		]),
	],
	[
		'unresolved file URL',
		timeline([
			track([
				{
					...clip('Local', 0, 24),
					media_reference: {
						OTIO_SCHEMA: 'ExternalReference.1',
						target_url: 'file:///Users/editor/video.mp4',
					},
				},
			]),
		]),
	],
])(
	'OTIO refuses %s with a diagnostic instead of silently changing the edit',
	(_name, input) => {
		const result = generate(input);
		expect(result.source).toBeNull();
		expect(result.metadata).toBeNull();
		expect(result.diagnostics.some((entry) => entry.severity === 'error')).toBe(
			true,
		);
		expect(
			result.diagnostics.every((entry) => entry.path.startsWith('$')),
		).toBe(true);
	},
);

test('invalid transition handles and overlapping transitions report their source paths', () => {
	const result = generate(
		timeline([
			track([
				clip('First', 0, 24),
				dissolve(12, 18),
				clip('Middle', 0, 24),
				dissolve(18, 12),
				clip('Last', 0, 24),
			]),
		]),
	);
	expect(result.source).toBeNull();
	expect(
		result.diagnostics.some((entry) => entry.path.includes('.children[')),
	).toBe(true);
});

const project = (): CodemodProject & {entryPoint: string} => ({
	rootDir: '/',
	entryPoint: 'src/index.ts',
	files: {
		'src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);`,
		'src/Root.tsx': `import {Composition} from 'remotion';
const Existing = () => null;
export const Root = () => <Composition id="Existing" component={Existing} durationInFrames={24} fps={24} width={1920} height={1080} />;`,
	},
});

test('addOpenTimelineComposition creates source and registration atomically in a virtual project', () => {
	const original = project();
	const result = addOpenTimelineComposition({
		project: original,
		compositionFile: 'src/Root.tsx',
		compositionId: 'Imported',
		component: {
			filePath: 'src/Imported.tsx',
			importName: 'ImportedTimeline',
			importPath: './Imported',
		},
		timeline: timeline([track([clip('Import', 0, 48)])]),
		fps: 24,
		width: 1920,
		height: 1080,
	});
	expect(Object.keys(original.files)).toHaveLength(2);
	expect(original.files['src/Root.tsx']).not.toContain('ImportedTimeline');
	const updated = applyCodemodChanges(original, result.changes);
	expect(updated.files['src/Imported.tsx']).toContain('ImportedTimeline');
	const registration = elements(
		updated.files['src/Root.tsx'],
		'Composition',
	).find((element) => {
		const id = prop(element, 'id');
		return id?.type === 'StringLiteral' && id.value === 'Imported';
	});
	expect(registration).toBeDefined();
	expect(numeric(prop(registration!, 'durationInFrames'))).toBe(48);
	expect(result.insertedNode.filePath).toBe('src/Root.tsx');

	expect(() =>
		addOpenTimelineComposition({
			project: updated,
			compositionFile: 'src/Root.tsx',
			compositionId: 'Duplicate',
			component: {
				filePath: '/src/Imported.tsx',
				importName: 'ImportedTimeline',
				importPath: './Imported',
			},
			timeline: timeline([track([clip('Import', 0, 48)])]),
			fps: 24,
			width: 1920,
			height: 1080,
		}),
	).toThrow('already exists');
});

test('failed OTIO imports expose structured diagnostics and leave project files unchanged', () => {
	const original = project();
	const snapshot = JSON.stringify(original);
	let error: unknown;
	try {
		addOpenTimelineComposition({
			project: original,
			compositionFile: 'src/Root.tsx',
			compositionId: 'Imported',
			component: {
				filePath: 'src/Imported.tsx',
				importName: 'ImportedTimeline',
				importPath: './Imported',
			},
			timeline: timeline([
				track([
					{
						...clip('Unsupported', 0, 24),
						effects: [{OTIO_SCHEMA: 'Effect.1', effect_name: 'Lens flare'}],
					},
				]),
			]),
			fps: 24,
			width: 1920,
			height: 1080,
		});
	} catch (caught) {
		error = caught;
	}

	expect(error).toBeInstanceOf(OpenTimelineImportError);
	expect((error as OpenTimelineImportError).diagnostics).toEqual(
		expect.arrayContaining([
			expect.objectContaining({severity: 'error', code: 'unsupported-effect'}),
		]),
	);
	expect(JSON.stringify(original)).toBe(snapshot);
});

test('nested source trims keep audio dissolve gain on the correct parent frame', () => {
	const input = timeline([
		{
			...track(
				[clip('Outgoing', 240, 48), dissolve(12, 6), clip('Incoming', 240, 48)],
				'Audio',
			),
			source_range: range(24, 48),
		},
	]);
	const result = generate(input);
	const audio = elements(result.source, 'Audio');
	const outgoing = prop(audio[0], 'volume')!;
	const incoming = prop(audio[1], 'volume')!;
	expect(evaluateProp(result.source!, outgoing, 12, 24)).toBe(1);
	expect(evaluateProp(result.source!, incoming, 12, 24)).toBe(0);
	expect(evaluateProp(result.source!, outgoing, 21, 24)).toBeCloseTo(0.5);
	expect(evaluateProp(result.source!, incoming, 21, 24)).toBeCloseTo(0.5);
	expect(evaluateProp(result.source!, outgoing, 30, 24)).toBe(0);
	expect(evaluateProp(result.source!, incoming, 30, 24)).toBe(1);
});

test('image sequence filenames honor source timecode, frame_step, signed padding and mixed rates', () => {
	const result = generate(
		timeline([
			track([
				{
					OTIO_SCHEMA: 'Clip.1',
					name: 'Frames',
					source_range: range(100, 12, 24),
					media_reference: {
						OTIO_SCHEMA: 'ImageSequenceReference.1',
						target_url_base: 'frames',
						name_prefix: 'shot.',
						name_suffix: '.png',
						start_frame: -3,
						frame_step: 2,
						rate: 24,
						frame_zero_padding: 4,
						missing_frame_policy: 'error',
						available_range: range(100, 48, 24),
					},
				},
			]),
		]),
		30,
	);
	expect(result.metadata?.durationInFrames).toBe(15);
	const images = elements(result.source, 'CanvasImage');
	expect(images).toHaveLength(1);
	const src = prop(images[0], 'src')!;
	expect(evaluateProp(result.source!, src, 0, 30)).toBe(
		'/public/frames/shot.-0003.png',
	);
	expect(evaluateProp(result.source!, src, 2, 30)).toBe(
		'/public/frames/shot.-0003.png',
	);
	expect(evaluateProp(result.source!, src, 3, 30)).toBe(
		'/public/frames/shot.-0001.png',
	);
	expect(evaluateProp(result.source!, src, 5, 30)).toBe(
		'/public/frames/shot.0001.png',
	);
	expect(evaluateProp(result.source!, src, 10, 30)).toBe(
		'/public/frames/shot.0005.png',
	);
	expect(result.assets).toEqual([
		expect.objectContaining({
			kind: 'image-sequence',
			src: 'frames',
			source: 'public',
		}),
	]);
});

test('media resolution can relink local files, missing media and generator references', () => {
	const seen: Array<{targetUrl: string | null; trackKind: string}> = [];
	const result = generateOpenTimelineComposition({
		timeline: timeline([
			track([
				{
					...clip('Local', 0, 24),
					media_reference: {
						OTIO_SCHEMA: 'ExternalReference.1',
						target_url: 'file:///original.mp4',
					},
				},
				{
					...clip('Missing', 0, 24),
					media_reference: {OTIO_SCHEMA: 'MissingReference.1'},
				},
				{
					...clip('Generator', 0, 24),
					media_reference: {
						OTIO_SCHEMA: 'GeneratorReference.1',
						generator_kind: 'ApplicationSpecific',
					},
				},
			]),
		]),
		componentName: 'Relinked',
		fps: 24,
		width: 1920,
		height: 1080,
		resolveMedia: ({targetUrl, trackKind, reference}) => {
			seen.push({targetUrl, trackKind});
			return reference.OTIO_SCHEMA === 'GeneratorReference.1'
				? {src: 'generated.png', source: 'public', kind: 'image'}
				: {src: 'relinked.mp4', source: 'public', kind: 'video'};
		},
	});
	expect(result.metadata?.durationInFrames).toBe(72);
	expect(seen).toEqual([
		{targetUrl: 'file:///original.mp4', trackKind: 'Video'},
		{targetUrl: null, trackKind: 'Video'},
		{targetUrl: null, trackKind: 'Video'},
	]);
	expect(elements(result.source, 'Video')).toHaveLength(2);
	expect(elements(result.source, 'CanvasImage')).toHaveLength(1);
	expect(result.assets).toHaveLength(3);
});

test('media resolver exceptions become actionable diagnostics', () => {
	const result = generateOpenTimelineComposition({
		timeline: timeline([track([clip('Local', 0, 24)])]),
		componentName: 'FailedResolver',
		fps: 24,
		width: 1920,
		height: 1080,
		resolveMedia: () => {
			throw new Error('Asset mapping missing');
		},
	});
	expect(result.source).toBeNull();
	expect(result.diagnostics).toContainEqual(
		expect.objectContaining({
			code: 'media-resolver-failed',
			path: '$.tracks.children[0].children[0]',
			message: expect.stringContaining('Asset mapping missing'),
		}),
	);
});

test.each(['Video', 'Sequence', 'AbsoluteFill'])(
	'component name %s cannot shadow generated imports or rewrite input strings',
	(componentName) => {
		const input = {
			...clip('Named', 0, 24),
			name: '<Video /> <Sequence /> <AbsoluteFill />',
		};
		const result = generateOpenTimelineComposition({
			timeline: timeline([track([input])]),
			componentName,
			fps: 24,
			width: 1920,
			height: 1080,
		});
		const ast = parseAstForReadOnly(result.source!);
		const imports = ast.program.body.filter(
			(node) => node.type === 'ImportDeclaration',
		);
		expect(
			imports
				.flatMap((node) => node.specifiers)
				.every((specifier) => specifier.local.name !== componentName),
		).toBe(true);
		const videos = elements(
			result.source,
			componentName === 'Video' ? 'OpenTimelineVideo' : 'Video',
		);
		expect(prop(videos[0], 'name')).toMatchObject({value: input.name});
		if (componentName === 'AbsoluteFill') {
			expect(elements(result.source, 'AbsoluteFill')).toHaveLength(0);
			expect(elements(result.source, 'OpenTimelineAbsoluteFill')).toHaveLength(
				1,
			);
		}
	},
);

test('zero-duration dissolves are hard cuts without invalid interpolation ranges', () => {
	const result = generate(
		timeline([
			track([clip('Before', 0, 24), dissolve(0, 0), clip('After', 0, 24)]),
		]),
	);
	expect(result.metadata?.durationInFrames).toBe(48);
	const videos = elements(result.source, 'Video');
	expect(numeric(prop(videos[1], 'from'))).toBe(24);
	expect(result.source).not.toContain('interpolate(');
	expect(result.diagnostics).toContainEqual(
		expect.objectContaining({
			code: 'zero-duration-transition',
			severity: 'info',
		}),
	);
});

test.each(['hold', 'black'])(
	'image sequence missing-frame policy %s is explicitly unsupported',
	(policy) => {
		const result = generate(
			timeline([
				track([
					{
						OTIO_SCHEMA: 'Clip.1',
						source_range: range(0, 24),
						media_reference: {
							OTIO_SCHEMA: 'ImageSequenceReference.1',
							target_url_base: 'frames',
							name_prefix: '',
							name_suffix: '.png',
							start_frame: 1,
							frame_step: 1,
							rate: 24,
							frame_zero_padding: 4,
							missing_frame_policy: policy,
							available_range: range(0, 24),
						},
					},
				]),
			]),
		);
		expect(result.source).toBeNull();
		expect(result.diagnostics).toContainEqual(
			expect.objectContaining({
				code: 'unsupported-missing-frame-policy',
				severity: 'error',
			}),
		);
	},
);

test('legacy Sequence and Filler schemas retain cut placement', () => {
	const result = generate(
		timeline([
			{
				...track([
					{OTIO_SCHEMA: 'Filler.1', duration: time(12)},
					clip('After filler', 0, 24),
				]),
				OTIO_SCHEMA: 'Sequence.1',
			},
		]),
	);
	expect(result.metadata?.durationInFrames).toBe(36);
	expect(numeric(prop(elements(result.source, 'Video')[0], 'from'))).toBe(12);
});

test('invalid output settings return diagnostics without attempting code generation', () => {
	const result = generateOpenTimelineComposition({
		timeline: timeline([track([clip('Settings', 0, 24)])]),
		componentName: 'bad-name; execute()',
		fps: 0,
		width: 12.5,
		height: Number.NaN,
	});
	expect(result.source).toBeNull();
	expect(result.metadata).toBeNull();
	expect(
		result.diagnostics
			.filter((diagnostic) => diagnostic.severity === 'error')
			.map((diagnostic) => diagnostic.path),
	).toEqual([
		'$options.componentName',
		'$options.fps',
		'$options.width',
		'$options.height',
	]);
});

test('cyclic input objects are rejected with bounded hierarchy diagnostics', () => {
	const recursive = track([]);
	recursive.children.push(recursive);
	const result = generate(timeline([recursive]));
	expect(result.source).toBeNull();
	expect(result.diagnostics).toContainEqual(
		expect.objectContaining({code: 'invalid-hierarchy', severity: 'error'}),
	);
});

test('negative nested source trims delay child media and preserve transition clocks', () => {
	const result = generate(
		timeline([
			track(
				[
					gap(24),
					{
						...track(
							[
								clip('Outgoing', 240, 48),
								dissolve(12, 6),
								clip('Incoming', 240, 48),
							],
							'Audio',
						),
						name: 'Negative trim',
						source_range: range(-12, 120),
					},
				],
				'Audio',
			),
		]),
	);
	expect(result.metadata?.durationInFrames).toBe(144);
	const sequences = elements(result.source, 'Sequence');
	const trimmed = sequences.find((element) => {
		const name = prop(element, 'name');
		return name?.type === 'StringLiteral' && name.value === 'Negative trim';
	});
	expect(trimmed).toBeDefined();
	expect(numeric(prop(trimmed!, 'trimBefore'))).toBe(0);
	expect(numeric(prop(trimmed!, 'from'))).toBe(24);
	expect(numeric(prop(trimmed!, 'durationInFrames'))).toBe(120);
	expect(
		sequences.some((element) => {
			const from = prop(element, 'from');
			return from !== undefined && numeric(from) === 12;
		}),
	).toBe(true);
	for (const element of sequences) {
		const trim = prop(element, 'trimBefore');
		if (trim !== undefined) expect(numeric(trim)).toBeGreaterThanOrEqual(0);
	}

	const [outgoing, incoming] = elements(result.source, 'Audio');
	expect(evaluateProp(result.source!, prop(outgoing, 'volume')!, 72, 24)).toBe(
		1,
	);
	expect(evaluateProp(result.source!, prop(incoming, 'volume')!, 72, 24)).toBe(
		0,
	);
	expect(
		evaluateProp(result.source!, prop(outgoing, 'volume')!, 81, 24),
	).toBeCloseTo(0.5);
	expect(
		evaluateProp(result.source!, prop(incoming, 'volume')!, 81, 24),
	).toBeCloseTo(0.5);
	expect(evaluateProp(result.source!, prop(outgoing, 'volume')!, 90, 24)).toBe(
		0,
	);
	expect(evaluateProp(result.source!, prop(incoming, 'volume')!, 90, 24)).toBe(
		1,
	);
});

test('media source trims outside safe frame precision fail before emitting code', () => {
	const result = generate(
		timeline([
			track([
				{
					...clip('Unsafe', Number.MAX_SAFE_INTEGER * 4, 1, 1),
					media_reference: {
						OTIO_SCHEMA: 'ExternalReference.1',
						target_url: 'unsafe.mp4',
					},
				},
			]),
		]),
	);
	expect(result.source).toBeNull();
	expect(result.metadata).toBeNull();
	expect(result.diagnostics).toContainEqual(
		expect.objectContaining({
			severity: 'error',
			code: 'unsafe-frame-range',
			path: '$.tracks.children[0].children[0]',
		}),
	);
});

test('an empty image sequence base resolves filenames relative to public without an extra slash', () => {
	const result = generate(
		timeline([
			track([
				{
					OTIO_SCHEMA: 'Clip.1',
					source_range: range(0, 24),
					media_reference: {
						OTIO_SCHEMA: 'ImageSequenceReference.1',
						target_url_base: '',
						name_prefix: 'frame-',
						name_suffix: '.png',
						start_frame: 1001,
						frame_step: 1,
						rate: 24,
						frame_zero_padding: 4,
						available_range: range(0, 24),
					},
				},
			]),
		]),
	);
	expect(result.metadata?.durationInFrames).toBe(24);
	const src = prop(elements(result.source, 'CanvasImage')[0], 'src')!;
	expect(evaluateProp(result.source!, src, 0, 24)).toBe(
		'/public/frame-1001.png',
	);
	expect(evaluateProp(result.source!, src, 23, 24)).toBe(
		'/public/frame-1024.png',
	);
	expect(result.assets).toContainEqual(
		expect.objectContaining({
			kind: 'image-sequence',
			src: '',
			source: 'public',
		}),
	);
});

test('visual dissolves blend both weighted alpha layers within an isolated track', () => {
	const outgoing = clip('Outgoing alpha', 240, 48);
	outgoing.media_reference.target_url = 'outgoing.png';
	const incoming = clip('Incoming alpha', 240, 48);
	incoming.media_reference.target_url = 'incoming.png';
	const result = generate(
		timeline([track([outgoing, dissolve(12, 6), incoming])]),
	);
	const images = elements(result.source, 'CanvasImage');
	expect(images).toHaveLength(2);
	const outgoingStyle = prop(images[0], 'style')!;
	const incomingStyle = prop(images[1], 'style')!;
	expect(evaluateProp(result.source!, outgoingStyle, 36, 24)).toMatchObject({
		opacity: 1,
	});
	expect(evaluateProp(result.source!, incomingStyle, 36, 24)).toMatchObject({
		opacity: 0,
	});
	expect(evaluateProp(result.source!, outgoingStyle, 45, 24)).toMatchObject({
		opacity: 0.5,
		mixBlendMode: 'plus-lighter',
	});
	expect(evaluateProp(result.source!, incomingStyle, 45, 24)).toMatchObject({
		opacity: 0.5,
		mixBlendMode: 'plus-lighter',
	});
	expect(evaluateProp(result.source!, outgoingStyle, 54, 24)).toMatchObject({
		opacity: 0,
	});
	expect(evaluateProp(result.source!, incomingStyle, 54, 24)).toMatchObject({
		opacity: 1,
	});
	const trackElement = elements(result.source, 'Sequence').find((element) => {
		const name = prop(element, 'name');
		return name?.type === 'StringLiteral' && name.value === 'Video track';
	});
	expect(trackElement).toBeDefined();
	expect(
		evaluateProp(result.source!, prop(trackElement!, 'style')!, 45, 24),
	).toMatchObject({isolation: 'isolate'});
});
