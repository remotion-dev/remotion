import {expect, test} from 'bun:test';
import {
	applyCodemodChanges,
	canPrecomposeJsxNodes,
	getNodeProps,
	getNodes,
	precomposeJsxNodes,
	type CodemodProject,
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

const precomposeSource = (
	source: string,
	select: (node: ReturnType<typeof getNodes>[number]) => boolean,
) => {
	const project = makeProject(source);
	const nodes = getNodes({project, filePath}).filter(select);
	const result = precomposeJsxNodes({
		project,
		nodes,
		compositionFile,
		compositionId: 'Main',
		metadata,
		existingCompositionIds: ['Main'],
	});
	return {
		project,
		nodes,
		result,
		after: applyCodemodChanges(project, result.changes),
	};
};

test('precomposes an Interactive.Div title card with children into a named style-forwarding component', () => {
	const input = `import {AbsoluteFill, Interactive} from 'remotion';

export const Video = () => (
  <AbsoluteFill>
    <Interactive.Div
      name="Title card"
      from={60}
      durationInFrames={120}
      style={{position: 'absolute', left: 100, top: 100, width: 800, padding: 40, color: 'white'}}
    >
      <h1>Welcome to the launch</h1>
      <p>Meet the next generation of our product.</p>
    </Interactive.Div>
    <Interactive.P name="Footer" style={{position: 'absolute', bottom: 40}}>remotion.dev</Interactive.P>
  </AbsoluteFill>
);
`;
	const {project, nodes, result, after} = precomposeSource(
		input,
		(node) => node.tagName === 'Interactive.Div',
	);
	expect(after.files[filePath])
		.toBe(`import {AbsoluteFill, Interactive} from 'remotion';

export const Video = () => (
  <AbsoluteFill>
    <TitleCard name="Title card" from={60} durationInFrames={120} premountFor={30} />
    <Interactive.P name="Footer" style={{position: 'absolute', bottom: 40}}>remotion.dev</Interactive.P>
  </AbsoluteFill>
);

function TitleCardContent({style: precomposeStyle}: {style?: import('react').CSSProperties}) {
  return (
    <Interactive.Div
      style={{
        position: 'absolute',
        left: 100,
        top: 100,
        width: 800,
        padding: 40,
        color: 'white',
        ...precomposeStyle
      }}
    >
      <h1>Welcome to the launch</h1>
      <p>Meet the next generation of our product.</p>
    </Interactive.Div>
  );
}

export const TitleCard = Interactive.withSchema({
  Component: TitleCardContent,
  componentName: "<TitleCard>",
  schema: {},
  wrapInSequence: true,
});
`);
	expect(after.files[compositionFile]).toContain(
		"import {Video, TitleCard} from './Video';",
	);
	expect(after.files[compositionFile]).toContain('component={TitleCard}');
	expect(after.files[compositionFile]).toContain('durationInFrames={120}');
	const replacement = result.nodePathRemappings.find(
		(entry) =>
			JSON.stringify(entry.oldNodePath) === JSON.stringify(nodes[0].nodePath),
	);
	expect(
		getNodes({project: after, filePath}).find(
			(node) =>
				JSON.stringify(node.nodePath) ===
				JSON.stringify(replacement?.newNodePath),
		)?.tagName,
	).toBe('TitleCard');
	expect(project.files[filePath]).toBe(input);
});

for (const {imports, tag, wrapper} of [
	{
		imports: "import {AbsoluteFill, Interactive as UI} from 'remotion';",
		tag: 'UI.Div',
		wrapper: 'UI',
	},
	{
		imports: "import {AbsoluteFill} from 'remotion';",
		tag: 'AbsoluteFill',
		wrapper: 'Interactive',
	},
	{
		imports: "import {AbsoluteFill} from 'remotion';",
		tag: 'div',
		wrapper: 'Interactive',
	},
]) {
	test(`forwards group styles into the ${tag} root with an existing style expression`, () => {
		const input = `${imports}
const compact = false;
export const Video = () => (
  <AbsoluteFill>
    <${tag} style={compact ? {padding: 24} : {padding: 48}} className="speaker-card">
      <h2>Alex Morgan</h2>
      <p>Product designer</p>
    </${tag}>
  </AbsoluteFill>
);
`;
		const {after} = precomposeSource(
			input,
			(node) => node.tagName === tag && node.parentNodePath !== null,
		);
		expect(after.files[filePath]).toContain(
			'<Precomposition name={"Precomposition"} premountFor={30} />',
		);
		expect(after.files[filePath])
			.toContain(`function PrecompositionContent({style: precomposeStyle}: {style?: import('react').CSSProperties}) {
  return (
    <${tag}
      style={{
        ...(compact ? {
          padding: 24
        } : {
          padding: 48
        }),

        ...precomposeStyle
      }}
      className="speaker-card"
    >
      <h2>Alex Morgan</h2>
      <p>Product designer</p>
    </${tag}>
  );
}`);
		expect(after.files[filePath])
			.toContain(`export const Precomposition = ${wrapper}.withSchema({
  Component: PrecompositionContent,
  componentName: "<Precomposition>",
  schema: {},
  wrapInSequence: true,
});`);
		if (wrapper === 'Interactive') {
			expect(after.files[filePath]).toContain(
				"import {AbsoluteFill, Interactive} from 'remotion';",
			);
		}
	});
}

test('retains a trimmed Series.Sequence and premounts its single visual root', () => {
	const input = `import {Interactive, Series} from 'remotion';
export const Video = () => (
  <Series>
    <Series.Sequence name="Product reveal" durationInFrames={120} trimBefore={10} offset={-5}>
      <Interactive.Div style={{backgroundColor: '#101010', padding: 64}}>
        <h1>Introducing Studio</h1>
        <p>Make every frame your own.</p>
      </Interactive.Div>
    </Series.Sequence>
  </Series>
);
`;
	const {after} = precomposeSource(
		input,
		(node) => node.tagName === 'Series.Sequence',
	);
	const sequence = getNodes({project: after, filePath}).find(
		(node) => node.tagName === 'Series.Sequence',
	)!;
	const {props} = getNodeProps({
		project: after,
		node: sequence,
		keys: ['durationInFrames', 'trimBefore', 'offset', 'premountFor'],
	});
	for (const [key, value] of Object.entries({
		durationInFrames: 120,
		trimBefore: 10,
		offset: -5,
		premountFor: 30,
	})) {
		expect(props[key]).toMatchObject({status: 'static', codeValue: value});
	}

	expect(after.files[filePath]).toContain(
		'<ProductReveal name={"Product reveal"} premountFor={30} />',
	);
	expect(after.files[filePath])
		.toContain(`function ProductRevealContent({style: precomposeStyle}: {style?: import('react').CSSProperties}) {
  return (
    <Interactive.Div
      style={{
        backgroundColor: '#101010',
        padding: 64,
        ...precomposeStyle
      }}
    >
      <h1>Introducing Studio</h1>
      <p>Make every frame your own.</p>
    </Interactive.Div>
  );
}`);
	expect(after.files[compositionFile]).toContain('component={ProductReveal}');
	expect(after.files[compositionFile]).toContain('durationInFrames={130}');
});

test('preserves disabled premounting, postmount styling, and the trimmed duration', () => {
	const input = `import {AbsoluteFill, Interactive} from 'remotion';
export const Video = () => (
  <AbsoluteFill>
    <Interactive.Div name="Closing card" from={600} durationInFrames={90} trimBefore={12} premountFor={0} postmountFor={15} styleWhilePostmounted={{opacity: 0.25}}>
      <h1>Thanks for watching!</h1>
    </Interactive.Div>
  </AbsoluteFill>
);
`;
	const {after} = precomposeSource(
		input,
		(node) => node.tagName === 'Interactive.Div',
	);
	expect(after.files[filePath]).toContain(
		'<ClosingCard name="Closing card" from={600} durationInFrames={90} trimBefore={12} premountFor={0} postmountFor={15} styleWhilePostmounted={{opacity: 0.25}} />',
	);
	expect(after.files[filePath])
		.toContain(`function ClosingCardContent({style: precomposeStyle}: {style?: import('react').CSSProperties}) {
  return (
    <Interactive.Div
      style={{
        ...precomposeStyle
      }}
    >
      <h1>Thanks for watching!</h1>
    </Interactive.Div>
  );
}`);
	expect(after.files[compositionFile]).toContain('durationInFrames={102}');
});

test('keeps an fps-based premount setting in the parent without capturing an unused fps prop', () => {
	const input = `import {AbsoluteFill, Interactive, useVideoConfig} from 'remotion';
export const Video = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Interactive.Div name="Speaker intro" from={90} durationInFrames={150} premountFor={fps} style={{padding: 48}}>
        <h1>Meet the team</h1>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
`;
	const {after} = precomposeSource(
		input,
		(node) => node.tagName === 'Interactive.Div',
	);
	expect(after.files[filePath]).toContain('const {fps} = useVideoConfig();');
	expect(after.files[filePath]).toContain(
		'<SpeakerIntro name="Speaker intro" from={90} durationInFrames={150} premountFor={fps} />',
	);
	expect(after.files[filePath])
		.toContain(`function SpeakerIntroContent({style: precomposeStyle}: {style?: import('react').CSSProperties}) {
  return (
    <Interactive.Div
      style={{
        padding: 48,
        ...precomposeStyle
      }}
    >
      <h1>Meet the team</h1>
    </Interactive.Div>
  );
}`);
});

test('keeps a Sequence layout="none" fallback for multiple selected visual roots', () => {
	const input = `import {AbsoluteFill, Interactive} from 'remotion';
export const Video = () => (
  <AbsoluteFill>
    <Interactive.Div name="Heading" from={30} durationInFrames={90} style={{top: 80}}><h1>The launch</h1></Interactive.Div>
    <Interactive.P name="Subtitle" from={45} durationInFrames={75} style={{top: 160}}>A new way to create.</Interactive.P>
  </AbsoluteFill>
);
`;
	const {after} = precomposeSource(input, (node) =>
		['Interactive.Div', 'Interactive.P'].includes(node.tagName),
	);
	expect(after.files[filePath])
		.toBe(`import {AbsoluteFill, Interactive, Sequence} from 'remotion';
export const Video = () => (
  <AbsoluteFill>
    <Sequence layout="none" name={"Precomposition"}>
      <Precomposition />
    </Sequence>
  </AbsoluteFill>
);

export function Precomposition() {
  return (
    <>
      <Interactive.Div name="Heading" from={30} durationInFrames={90} style={{top: 80}}><h1>The launch</h1></Interactive.Div>
      <Interactive.P name="Subtitle" from={45} durationInFrames={75} style={{top: 160}}>A new way to create.</Interactive.P>
    </>
  );
}
`);
});

test('does not rewrite a custom component just because its call site passes a style', () => {
	const input = `import {AbsoluteFill} from 'remotion';
import {SpeakerCard} from './SpeakerCard';
export const Video = () => (
  <AbsoluteFill>
    <SpeakerCard name="Speaker" style={{left: 120, top: 80}}>
      <h2>Alex Morgan</h2>
      <p>Product designer</p>
    </SpeakerCard>
  </AbsoluteFill>
);
`;
	const {after} = precomposeSource(
		input,
		(node) => node.tagName === 'SpeakerCard',
	);
	expect(after.files[filePath])
		.toBe(`import {AbsoluteFill, Sequence} from 'remotion';
import {SpeakerCard} from './SpeakerCard';
export const Video = () => (
  <AbsoluteFill>
    <Sequence layout="none" name={"Speaker"}>
      <Speaker />
    </Sequence>
  </AbsoluteFill>
);

export function Speaker() {
  return (
    <>
      <SpeakerCard name="Speaker" style={{left: 120, top: 80}}>
        <h2>Alex Morgan</h2>
        <p>Product designer</p>
      </SpeakerCard>
    </>
  );
}
`);
});

test('retains a containerless parent Sequence without adding an invalid premount prop', () => {
	const input = `import {Interactive, Sequence} from 'remotion';
export const Video = () => (
  <Sequence layout={'none'} name="Inline caption" from={60} durationInFrames={90}>
    <Interactive.Span style={{color: 'white'}}>Design in motion</Interactive.Span>
  </Sequence>
);
`;
	const {after} = precomposeSource(
		input,
		(node) => node.tagName === 'Sequence',
	);
	expect(after.files[filePath])
		.toBe(`import {Interactive, Sequence} from 'remotion';
export const Video = () => (
  <Sequence layout={'none'} name="Inline caption" from={60} durationInFrames={90}>
    <InlineCaption />
  </Sequence>
);

export function InlineCaption() {
  return (
    <>
      <Interactive.Span style={{color: 'white'}}>Design in motion</Interactive.Span>
    </>
  );
}
`);
});

test('keeps a dynamically timed title card on the Sequence fallback', () => {
	const input = `import {AbsoluteFill, Interactive} from 'remotion';
const introStart = 60;
export const Video = () => (
  <AbsoluteFill>
    <Interactive.Div name="Intro" from={introStart} durationInFrames={120} style={{padding: 40}}>
      <h1>Welcome to the launch</h1>
    </Interactive.Div>
  </AbsoluteFill>
);
`;
	const {after} = precomposeSource(
		input,
		(node) => node.tagName === 'Interactive.Div',
	);
	expect(after.files[filePath])
		.toBe(`import {AbsoluteFill, Interactive, Sequence} from 'remotion';
const introStart = 60;
export const Video = () => (
  <AbsoluteFill>
    <Sequence layout="none" name={"Intro"}>
      <Intro />
    </Sequence>
  </AbsoluteFill>
);

export function Intro() {
  return (
    <>
      <Interactive.Div name="Intro" from={introStart} durationInFrames={120} style={{padding: 40}}>
        <h1>Welcome to the launch</h1>
      </Interactive.Div>
    </>
  );
}
`);
});

test('reports an unsafe style capture so the caller can use the agent-assisted fallback', () => {
	const input = `import {AbsoluteFill, Interactive} from 'remotion';
const cardStyle: import('react').CSSProperties = {position: 'absolute', left: 120, top: 80, padding: 32};
export const Video = () => (
  <AbsoluteFill>
    <Interactive.Div name="Speaker" style={cardStyle}>
      <h2>Alex Morgan</h2>
      <p>Product designer</p>
    </Interactive.Div>
  </AbsoluteFill>
);
`;
	const project = makeProject(input);
	expect(
		canPrecomposeJsxNodes({
			project,
			nodes: getNodes({project, filePath}).filter(
				(node) => node.tagName === 'Interactive.Div',
			),
			compositionFile,
			compositionId: 'Main',
			metadata,
			existingCompositionIds: ['Main'],
		}),
	).toEqual({
		canPrecompose: false,
		reason: 'The selected JSX reads cardStyle from an unstable scope',
	});
	expect(project.files[filePath]).toBe(input);
});
