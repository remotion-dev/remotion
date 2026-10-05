import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {
	applyCodemodChanges,
	canPrecomposeJsxNodes,
	getNodeProps,
	getNodes,
	precomposeJsxNodes,
	type CodemodProject,
	type NodeReference,
} from '../index';

const filePath = 'src/Video.tsx';
const compositionFile = 'src/Root.tsx';
const metadata = {
	width: 1920,
	height: 1080,
	fps: 30,
	durationInFrames: 900,
};

const makeProject = (source: string): CodemodProject => ({
	rootDir: '/',
	files: {
		[filePath]: source,
		[compositionFile]: `import {Composition} from 'remotion';
import {Video} from './Video';
export const Root = () => <Composition id="Main" component={Video} width={1920} height={1080} fps={30} durationInFrames={900} />;
`,
	},
});

const getStaticPropValue = (
	project: CodemodProject,
	node: NodeReference,
	key: string,
) => {
	const prop = getNodeProps({project, node, keys: [key]}).props[key];
	if (prop.status !== 'static') {
		throw new Error(`Expected ${key} to be static, got ${prop.status}`);
	}

	return prop.codeValue;
};

test('precomposes the roller-skis presenter and captions without changing their timing', () => {
	const input = readFileSync(
		new URL(
			'../../../jonnys-videos/src/roller-skis/Composition.tsx',
			import.meta.url,
		),
		'utf8',
	);
	const project = {rootDir: '/', files: {[filePath]: input}};
	const originalNodes = getNodes({project, filePath});
	const selected = originalNodes.find(
		(node) =>
			node.tagName === 'Series.Sequence' &&
			getStaticPropValue(project, node, 'name') ===
				'Presenter introduction (2)',
	)!;
	const captions = originalNodes.find(
		(node) =>
			node.tagName === 'BasicCaptions' &&
			getStaticPropValue(project, node, 'name') ===
				'Presenter introduction (2) captions',
	)!;
	const request = {
		project,
		nodes: [selected],
		compositionFile: filePath,
		compositionId: 'RollerSkiRoughCut',
		metadata: {...metadata, durationInFrames: 12377},
		existingCompositionIds: ['RollerSkiRoughCut'],
	};
	expect(canPrecomposeJsxNodes(request)).toEqual({
		canPrecompose: true,
		reason: null,
	});
	const result = precomposeJsxNodes(request);
	const after = applyCodemodChanges(project, result.changes);
	const afterNodes = getNodes({project: after, filePath});
	const wrapperRemapping = result.nodePathRemappings.find(
		(entry) =>
			JSON.stringify(entry.oldNodePath) === JSON.stringify(selected.nodePath),
	)!;
	const wrapper = afterNodes.find(
		(node) =>
			JSON.stringify(node.nodePath) ===
			JSON.stringify(wrapperRemapping.newNodePath),
	)!;
	expect(wrapper.tagName).toBe('Series.Sequence');
	expect(
		getNodeProps({
			project: after,
			node: wrapper,
			keys: ['name', 'durationInFrames', 'trimBefore', 'premountFor'],
		}).props,
	).toEqual(
		getNodeProps({
			project,
			node: selected,
			keys: ['name', 'durationInFrames', 'trimBefore', 'premountFor'],
		}).props,
	);
	expect(
		afterNodes
			.filter(
				(node) =>
					JSON.stringify(node.parentNodePath) ===
					JSON.stringify(wrapper.nodePath),
			)
			.map((node) => node.tagName),
	).toEqual([result.newCompositionId]);
	expect(after.files[filePath]).toContain(`<${result.newCompositionId} />`);
	expect(after.files[filePath]).toContain(
		`export function ${result.newCompositionId}()`,
	);
	const registration = afterNodes.find(
		(node) =>
			node.tagName === 'Composition' &&
			getStaticPropValue(after, node, 'id') === result.newCompositionId,
	)!;
	expect(getStaticPropValue(after, registration, 'durationInFrames')).toBe(496);
	for (const key of ['width', 'height', 'fps'] as const) {
		expect(getStaticPropValue(after, registration, key)).toBe(metadata[key]);
	}

	expect(after.files[filePath]).toContain(
		`component={${result.newCompositionId}}`,
	);
	const captionsRemapping = result.nodePathRemappings.find(
		(entry) =>
			JSON.stringify(entry.oldNodePath) === JSON.stringify(captions.nodePath),
	)!;
	const movedCaptions = afterNodes.find(
		(node) =>
			JSON.stringify(node.nodePath) ===
			JSON.stringify(captionsRemapping.newNodePath),
	)!;
	const captionKeys = [
		'captions',
		'width',
		'style.position',
		'style.left',
		'style.bottom',
		'combineTokensWithinMilliseconds',
	];
	for (const key of captionKeys) {
		expect(getStaticPropValue(after, movedCaptions, key)).toEqual(
			getStaticPropValue(project, captions, key),
		);
	}

	for (const original of originalNodes) {
		const remapping = result.nodePathRemappings.find(
			(entry) =>
				JSON.stringify(entry.oldNodePath) === JSON.stringify(original.nodePath),
		)!;
		expect(
			afterNodes.find(
				(node) =>
					JSON.stringify(node.nodePath) ===
					JSON.stringify(remapping.newNodePath),
			)?.tagName,
		).toBe(original.tagName);
	}

	expect(project.files[filePath]).toBe(input);
});

for (const {imports, parentTag, sequenceTag, extraProps} of [
	{
		imports: "import {Series, useVideoConfig} from 'remotion';",
		parentTag: 'Series',
		sequenceTag: 'Series.Sequence',
		extraProps: 'offset={-3}',
	},
	{
		imports: "import {Series as Scenes, useVideoConfig} from 'remotion';",
		parentTag: 'Scenes',
		sequenceTag: 'Scenes.Sequence',
		extraProps: '',
	},
	{
		imports: "import * as Remotion from 'remotion';",
		parentTag: 'Remotion.Series',
		sequenceTag: 'Remotion.Series.Sequence',
		extraProps: '',
	},
	{
		imports: "import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';",
		parentTag: 'AbsoluteFill',
		sequenceTag: 'Sequence',
		extraProps: 'from={30}',
	},
]) {
	test(`extracts a trimmed ${sequenceTag} with a separate registration file`, () => {
		const hook = parentTag.startsWith('Remotion.')
			? 'Remotion.useVideoConfig'
			: 'useVideoConfig';
		const input = `${imports}
import {PresenterZoom} from './PresenterZoom';
import {BasicCaptions} from './BasicCaptions';
export const Video = () => {
  const {fps} = ${hook}();
  return (
    <${parentTag}>
      <${sequenceTag} name="Before" durationInFrames={30}><div>Before</div></${sequenceTag}>
      <${sequenceTag} name="Presenter" durationInFrames={147} trimBefore={369} premountFor={fps} ${extraProps}>
        <PresenterZoom />
        <BasicCaptions captions={[{text: ' I', startMs: 13300, endMs: 13520, timestampMs: 13410, confidence: null}]} />
      </${sequenceTag}>
      <${sequenceTag} name="After" durationInFrames={60}><div>After</div></${sequenceTag}>
    </${parentTag}>
  );
};
`;
		const project = makeProject(input);
		const selected = getNodes({project, filePath}).find(
			(node) =>
				node.tagName === sequenceTag &&
				getStaticPropValue(project, node, 'name') === 'Presenter',
		)!;
		const result = precomposeJsxNodes({
			project,
			nodes: [selected],
			compositionFile,
			compositionId: 'Main',
			metadata,
			existingCompositionIds: ['Main'],
		});
		const after = applyCodemodChanges(project, result.changes);
		expect(after.files[filePath]).toContain(
			`<${sequenceTag} name="Presenter" durationInFrames={147} trimBefore={369} premountFor={fps} ${extraProps}>\n        <Presenter />\n      </${sequenceTag}>`,
		);
		expect(after.files[filePath]).toContain('export function Presenter()');
		expect(after.files[filePath]).toContain(
			`<${sequenceTag} name="After" durationInFrames={60}><div>After</div></${sequenceTag}>`,
		);
		expect(after.files[compositionFile]).toContain('durationInFrames={516}');
		expect(after.files[compositionFile]).toContain('component={Presenter}');
		expect(after.files[compositionFile]).toContain(
			"import {Video, Presenter} from './Video';",
		);
	});
}

test('keeps safety checks for Series children, timing and captured parent frames', () => {
	for (const {source, selectAll, reason} of [
		{
			source: `import {Series} from 'remotion';
export const Video = () => <Series><Series.Sequence durationInFrames={30}><div>A</div></Series.Sequence><Series.Sequence durationInFrames={60}><div>B</div></Series.Sequence></Series>;`,
			selectAll: true,
			reason: 'The JSX parent may depend on its direct children',
		},
		{
			source: `import {Series} from 'remotion';
const trim = () => 369;
export const Video = () => <Series><Series.Sequence durationInFrames={147} trimBefore={trim()}><div>A</div></Series.Sequence></Series>;`,
			selectAll: false,
			reason: 'The selected sequence timing is not static',
		},
		{
			source: `import {Sequence, useCurrentFrame} from 'remotion';
export const Video = () => {const frame = useCurrentFrame(); return <Sequence durationInFrames={147} trimBefore={369}><div style={{opacity: frame}} /></Sequence>;};`,
			selectAll: false,
			reason: 'The selected sequence captures a frame before its start',
		},
		{
			source: `import {Series, useCurrentFrame} from 'remotion';
export const Video = () => {const frame = useCurrentFrame(); return <Series><Series.Sequence durationInFrames={147}><div style={{opacity: frame}} /></Series.Sequence></Series>;};`,
			selectAll: false,
			reason: 'The selected markup captures a frame across a timing boundary',
		},
	]) {
		const project = makeProject(source);
		const nodes = getNodes({project, filePath}).filter((node) =>
			['Series.Sequence', 'Sequence'].includes(node.tagName),
		);
		expect(
			canPrecomposeJsxNodes({
				project,
				nodes: selectAll ? nodes : nodes.slice(0, 1),
				compositionFile,
				compositionId: 'Main',
				metadata,
				existingCompositionIds: ['Main'],
			}),
		).toEqual({canPrecompose: false, reason});
		expect(project.files[filePath]).toBe(source);
	}
});
