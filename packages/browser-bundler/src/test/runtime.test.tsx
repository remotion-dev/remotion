// organize-imports-ignore
// React DOM and Testing Library inspect the DOM when they are imported.
import './runtime-dom.js';
import {afterEach, expect, test} from 'bun:test';
import {Player, type PlayerRef} from '@remotion/player';
import {act, cleanup, render, screen} from '@testing-library/react';
import React, {createRef, useEffect} from 'react';
import {Composition, Internals} from 'remotion';
import {
	getBrowserComposition,
	loadBrowserBundle,
	type BrowserComposition,
} from '../runtime.js';

afterEach(() => {
	cleanup();
});

const bundle = {
	warnings: [],
	code: `
const React = require('react');
const {jsx, jsxs} = require('react/jsx-runtime');
const {Composition, Folder, registerRoot, useCurrentFrame, useVideoConfig} = require('remotion');
require('react-dom');
require('react-dom/client');
require('react/jsx-dev-runtime');
require('remotion/no-react');
require('remotion/version');

const Video = ({title, suffix}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  return jsx('p', {children: title + ' / ' + suffix + ' / frame ' + frame + ' / ' + width + 'x' + height + ' / ' + durationInFrames});
};
const Root = () => {
  const [enabled] = React.useState(true);
  return jsx(React.StrictMode, {children: jsx(Folder, {
    name: 'Nested',
    children: jsxs(React.Fragment, {children: [
      jsx(Composition, {
        id: 'Other', component: () => null,
        width: 320, height: 180, fps: 30, durationInFrames: 90,
      }),
      enabled ? jsx(Composition, {
        id: 'BrowserDemo',
        lazyComponent: () => Promise.resolve({default: Video}),
        width: 320, height: 180, fps: 30, durationInFrames: 90,
        defaultProps: {title: 'Default', suffix: 'from defaults'},
        calculateMetadata: async ({props}) => ({
          width: 960, height: 540, fps: 24, durationInFrames: 48,
          props: {...props, title: props.title + '!'},
        }),
      }) : null,
    ]}),
  })});
};
registerRoot(React.lazy(() => Promise.resolve({default: Root})));
`,
};

test('isolated registerRoot bundles resolve real compositions and play their calculated props and frames', async () => {
	const hostRoot = Internals.getRoot();
	const hostCompositions = Internals.compositionsRef.current;
	const seenIds = window.remotion_seenCompositionIds;
	const roots = [loadBrowserBundle({bundle}), loadBrowserBundle({bundle})];
	expect(roots[0]).not.toBe(roots[1]);
	expect(Internals.getRoot()).toBe(hostRoot);
	expect(window.remotion_seenCompositionIds).toBe(seenIds);

	render(<p>Host application</p>);
	const hostContainers = document.body.childElementCount;
	let pending: Promise<BrowserComposition>[] = [];
	await act(async () => {
		pending = roots.map((root, index) =>
			getBrowserComposition({
				root,
				compositionId: 'BrowserDemo',
				inputProps: {title: index === 0 ? 'First' : 'Recompiled'},
			}),
		);
		await Promise.resolve();
	});
	const [first, second] = await Promise.all(pending);

	expect(first.defaultProps).toEqual({
		title: 'Default',
		suffix: 'from defaults',
	});
	expect(first.props).toEqual({
		title: 'First!',
		suffix: 'from defaults',
	});
	expect(first.fps).toBe(24);
	expect(Internals.getRoot()).toBe(hostRoot);
	expect(Internals.compositionsRef.current).toBe(hostCompositions);
	expect(document.body.childElementCount).toBe(hostContainers);
	expect(screen.getByText('Host application')).toBeTruthy();

	const playerRef = createRef<PlayerRef>();
	const player = render(
		<Player
			ref={playerRef}
			component={first.component}
			inputProps={first.props}
			compositionWidth={first.width}
			compositionHeight={first.height}
			durationInFrames={first.durationInFrames}
			fps={first.fps}
			initialFrame={7}
			numberOfSharedAudioTags={0}
			acknowledgeRemotionLicense
		/>,
	);
	await screen.findByText('First! / from defaults / frame 7 / 960x540 / 48');
	act(() => {
		playerRef.current?.seekTo(12);
	});
	await screen.findByText('First! / from defaults / frame 12 / 960x540 / 48');

	player.rerender(
		<Player
			key="recompiled"
			component={second.component}
			inputProps={second.props}
			compositionWidth={second.width}
			compositionHeight={second.height}
			durationInFrames={second.durationInFrames}
			fps={second.fps}
			initialFrame={3}
			numberOfSharedAudioTags={0}
			acknowledgeRemotionLicense
		/>,
	);
	await screen.findByText(
		'Recompiled! / from defaults / frame 3 / 960x540 / 48',
	);
});

test.each([
	{
		name: 'missing registration',
		code: 'const Component = () => null;',
		error: 'did not call registerRoot()',
	},
	{
		name: 'duplicate registration',
		code: `const {registerRoot} = require('remotion');
registerRoot(() => null);
registerRoot(() => null);`,
		error: 'called more than once',
	},
	{
		name: 'an unavailable shared module',
		code: "require('unknown-shared-module');",
		error: 'unavailable shared module: "unknown-shared-module"',
	},
	{
		name: 'an invalid root',
		code: "require('remotion').registerRoot(null);",
		error: 'must receive a React component',
	},
	{
		name: 'a runtime error',
		code: "throw new Error('entry failed');",
		error: 'Could not evaluate the browser bundle: entry failed',
	},
	{
		name: 'invalid JavaScript',
		code: 'const = ;',
		error: 'Could not evaluate the browser bundle:',
	},
])('rejects $name without registering a global root', ({code, error}) => {
	const hostRoot = Internals.getRoot();
	expect(() => loadBrowserBundle({bundle: {code, warnings: []}})).toThrow(
		error,
	);
	expect(Internals.getRoot()).toBe(hostRoot);
});

const compositionProps = {
	id: 'Demo',
	component: () => null,
	width: 320,
	height: 180,
	fps: 30,
	durationInFrames: 90,
};

const EffectErrorRoot = () => {
	useEffect(() => {
		throw new Error('Root effect failed');
	}, []);
	return <Composition {...compositionProps} />;
};

test.each([
	{
		name: 'missing composition IDs',
		root: () => <Composition {...compositionProps} id="Other" />,
		error: 'No composition with ID "Demo" was registered. Available IDs: Other',
	},
	{
		name: 'duplicate composition IDs',
		root: () => (
			<>
				<Composition {...compositionProps} />
				<Composition {...compositionProps} />
			</>
		),
		error: 'ID "Demo" was registered more than once',
	},
	{
		name: 'registration validation failures',
		root: () => <Composition {...compositionProps} id="not/valid" />,
		error: 'Composition id can only contain',
	},
	{
		name: 'Root render errors',
		root: () => {
			throw new Error('Root render failed');
		},
		error: 'Root render failed',
	},
	{
		name: 'Root effect errors',
		root: EffectErrorRoot,
		error: 'Root effect failed',
	},
	{
		name: 'rejected lazy roots',
		root: React.lazy(() => Promise.reject(new Error('Lazy Root failed'))),
		error: 'Lazy Root failed',
	},
	{
		name: 'invalid calculated metadata',
		root: () => (
			<Composition {...compositionProps} calculateMetadata={() => ({fps: 0})} />
		),
		error: 'fps',
	},
	{
		name: 'rejected calculateMetadata',
		root: () => (
			<Composition
				{...compositionProps}
				calculateMetadata={() => Promise.reject(new Error('Metadata failed'))}
			/>
		),
		error: 'Metadata failed',
	},
])('rejects $name and removes its React root', async ({root, error}) => {
	const hostContainers = document.body.childElementCount;
	let result: Promise<unknown> = Promise.resolve();
	await act(async () => {
		result = getBrowserComposition({
			root,
			compositionId: 'Demo',
			inputProps: {},
		}).catch((reason: unknown) => reason);
		await Promise.resolve();
	});
	const caught = await result;
	expect(caught).toBeInstanceOf(Error);
	expect((caught as Error).message).toContain(error);
	expect(document.body.childElementCount).toBe(hostContainers);
});

test('aborting suspended roots and pending metadata cleans up and permits another selection', async () => {
	const hostContainers = document.body.childElementCount;
	const alreadyAborted = new AbortController();
	alreadyAborted.abort();
	await expect(
		getBrowserComposition({
			root: () => null,
			compositionId: 'Demo',
			inputProps: {},
			signal: alreadyAborted.signal,
		}),
	).rejects.toMatchObject({name: 'AbortError'});

	const lazyController = new AbortController();
	let lazyResult: Promise<unknown> = Promise.resolve();
	await act(async () => {
		lazyResult = getBrowserComposition({
			root: React.lazy(() => new Promise(() => undefined)),
			compositionId: 'Demo',
			inputProps: {},
			signal: lazyController.signal,
		}).catch((error: unknown) => error);
		await Promise.resolve();
	});
	await act(async () => {
		lazyController.abort();
		await lazyResult;
	});
	expect(await lazyResult).toMatchObject({name: 'AbortError'});
	expect(document.body.childElementCount).toBe(hostContainers);

	let unmounts = 0;
	let metadataSignal: AbortSignal | null = null;
	let finishMetadata: () => void = () => undefined;
	const metadataGate = new Promise<void>((resolve) => {
		finishMetadata = resolve;
	});
	const MetadataRoot = () => {
		useEffect(
			() => () => {
				unmounts++;
			},
			[],
		);

		return (
			<Composition
				{...compositionProps}
				calculateMetadata={async ({abortSignal}) => {
					metadataSignal = abortSignal;
					await metadataGate;
					return {width: 640};
				}}
			/>
		);
	};

	const metadataController = new AbortController();
	let metadataResult: Promise<unknown> = Promise.resolve();

	await act(async () => {
		metadataResult = getBrowserComposition({
			root: MetadataRoot,
			compositionId: 'Demo',
			inputProps: {},
			signal: metadataController.signal,
		}).catch((error: unknown) => error);
		await Promise.resolve();
	});
	expect(metadataSignal).not.toBeNull();
	await act(async () => {
		metadataController.abort();
		await metadataResult;
	});
	expect(await metadataResult).toMatchObject({name: 'AbortError'});
	expect((metadataSignal as AbortSignal | null)?.aborted).toBe(true);
	expect(unmounts).toBe(1);
	expect(document.body.childElementCount).toBe(hostContainers);

	await act(async () => {
		finishMetadata();
		await metadataGate;
	});
	let recovery: Promise<BrowserComposition> | null = null;
	await act(async () => {
		recovery = getBrowserComposition({
			root: () => <Composition {...compositionProps} />,
			compositionId: 'Demo',
			inputProps: {title: 'Recovered'},
		});
		await Promise.resolve();
	});
	expect(await recovery).toMatchObject({
		id: 'Demo',
		width: 320,
		props: {title: 'Recovered'},
	});
	expect(document.body.childElementCount).toBe(hostContainers);
});
