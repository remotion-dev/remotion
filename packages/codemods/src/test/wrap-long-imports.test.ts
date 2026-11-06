import {expect, test} from 'bun:test';
import {
	addElement,
	applyCodemodChanges,
	createElement,
	staticFileValue,
} from '../index';

const insertIntoComposition = ({
	element,
	input,
	prettierConfigOverride,
}: {
	element: ReturnType<typeof createElement>;
	input: string;
	prettierConfigOverride: Record<string, unknown>;
}) => {
	const project = {rootDir: '/', files: {'src/Root.tsx': input}};
	const result = addElement({
		project,
		element,
		target: {
			type: 'composition',
			compositionFile: 'src/Root.tsx',
			compositionId: 'MyComp',
		},
		prettierConfigOverride,
	});
	return applyCodemodChanges(project, result.changes).files['src/Root.tsx'];
};

test('wraps an extended import that exceeds printWidth like Prettier', () => {
	const output = insertIntoComposition({
		element: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 30},
		}).withChild(
			createElement({
				component: 'Img',
				importPath: 'remotion',
				props: {src: staticFileValue('logo.png')},
			}),
		),
		prettierConfigOverride: {
			bracketSpacing: false,
			singleQuote: true,
			useTabs: true,
		},
		input: `import {AbsoluteFill, Composition, interpolate, useCurrentFrame} from 'remotion';

export const MyComposition: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{opacity: interpolate(frame, [0, 30], [0, 1])}} />
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MyComp"
			component={MyComposition}
			durationInFrames={150}
			fps={30}
			width={1920}
			height={1080}
		/>
	);
};
`,
	});

	expect(output).toBe(`import {
	AbsoluteFill,
	Composition,
	interpolate,
	useCurrentFrame,
	Sequence,
	Img,
	staticFile,
} from 'remotion';

export const MyComposition: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<AbsoluteFill style={{opacity: interpolate(frame, [0, 30], [0, 1])}} />
			<Sequence from={30}>
				<Img src={staticFile('logo.png')} />
			</Sequence>
		</>
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MyComp"
			component={MyComposition}
			durationInFrames={150}
			fps={30}
			width={1920}
			height={1080}
		/>
	);
};
`);
});

test('adds specifiers to an already wrapped import on their own lines', () => {
	const output = insertIntoComposition({
		element: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 30},
		}),
		prettierConfigOverride: {trailingComma: 'none'},
		input: `import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps});
  return (
    <AbsoluteFill
      style={{opacity: interpolate(frame, [0, 30], [0, 1]), scale}}
    />
  );
};

export const RemotionRoot: React.FC = () => {
  return <Composition id="MyComp" component={MyComposition} />;
};
`,
	});

	expect(output).toBe(`import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence
} from "remotion";

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps});
  return (
    <>
      <AbsoluteFill
        style={{opacity: interpolate(frame, [0, 30], [0, 1]), scale}}
      />
      <Sequence from={30} />
    </>
  );
};

export const RemotionRoot: React.FC = () => {
  return <Composition id="MyComp" component={MyComposition} />;
};
`);
});

test('counts a trailing block comment towards printWidth like Prettier', () => {
	const output = insertIntoComposition({
		element: createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {from: 30},
		}),
		prettierConfigOverride: {},
		input: `import { AbsoluteFill, Composition } from "remotion"; /* layout components */

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <h1>Hello</h1>
    </AbsoluteFill>
  );
};
export const Root = () => <Composition id="MyComp" component={MyComposition} />;
`,
	});

	expect(output).toBe(`import {
  AbsoluteFill,
  Composition,
  Sequence,
} from "remotion"; /* layout components */

export const MyComposition = () => {
  return (
    <>
      <AbsoluteFill>
        <h1>Hello</h1>
      </AbsoluteFill>
      <Sequence from={30} />
    </>
  );
};
export const Root = () => <Composition id="MyComp" component={MyComposition} />;
`);
});
