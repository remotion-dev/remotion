import {expect, test} from 'bun:test';
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
	writeFileAndNotifyFileWatchers,
} from '../file-watcher';
import {
	subscribeToDefaultPropsWatchers,
	unsubscribeClientDefaultPropsWatchers,
} from '../preview-server/default-props-watchers';
import {setLiveEventsListener} from '../preview-server/live-events';
import {computeCanUpdateDefaultProps} from '../preview-server/routes/can-update-default-props';
import {undoHandler} from '../preview-server/routes/undo';
import {updateDefaultPropsHandler} from '../preview-server/routes/update-default-props';
import {getRedoStack, getUndoStack} from '../preview-server/undo-stack';

// Showcase is imported through a path alias, which only the client-provided
// registration location can point to.
const rootContents = `import {Composition} from 'remotion';
import {ShowcaseCompositions} from '@/Showcase';
import {OtherCompositions} from './nested/Other';

const Component = () => null;

export const RemotionRoot = () => (
	<>
		<Composition id="InRoot" component={Component} defaultProps={{title: 'Root'}} />
		<ShowcaseCompositions />
		<OtherCompositions />
	</>
);
`;

const showcaseContents = `import {Composition} from 'remotion';

const Component = () => null;

export const ShowcaseCompositions = () => (
	<Composition
		id="TitlePanel"
		component={Component}
		defaultProps={{children: 'Left Trim', style: null}}
	/>
);
`;

const otherContents = `import {Composition} from 'remotion';

const Component = () => null;
const makeProps = () => ({children: 'Computed'});

export const OtherCompositions = () => (
	<>
		<Composition id="OtherPanel" component={Component} defaultProps={{children: 'Other'}} />
		<Composition id="Computed" component={Component} defaultProps={makeProps()} />
	</>
);
`;

const stackFor = (originalFileName: string): SymbolicatedStackFrame => ({
	originalFileName,
	originalLineNumber: 1,
	originalColumnNumber: 0,
	originalFunctionName: null,
	originalScriptCode: null,
});

const makeProject = () => {
	const remotionRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-default-props-'),
	);
	mkdirSync(path.join(remotionRoot, 'src', 'nested'), {recursive: true});
	const files = {
		root: path.join(remotionRoot, 'src', 'Root.tsx'),
		showcase: path.join(remotionRoot, 'src', 'Showcase.tsx'),
		other: path.join(remotionRoot, 'src', 'nested', 'Other.tsx'),
	};
	writeFileSync(files.root, rootContents);
	writeFileSync(files.showcase, showcaseContents);
	writeFileSync(files.other, otherContents);
	return {
		remotionRoot,
		entryPoint: path.join(remotionRoot, 'src', 'index.ts'),
		files,
	};
};

test('resolves default props from the registration file the client sends', async () => {
	const {remotionRoot, entryPoint, files} = makeProject();
	try {
		const check = (compositionId: string, file: string | null) =>
			computeCanUpdateDefaultProps({
				compositionId,
				symbolicatedStack: file === null ? null : stackFor(file),
				remotionRoot,
				entryPoint,
			});

		expect(await check('TitlePanel', 'src/Showcase.tsx')).toEqual({
			result: {
				canUpdate: true,
				currentDefaultProps: {children: 'Left Trim', style: null},
			},
			compositionFile: files.showcase,
		});
		expect(await check('OtherPanel', 'src/nested/Other.tsx')).toEqual({
			result: {canUpdate: true, currentDefaultProps: {children: 'Other'}},
			compositionFile: files.other,
		});
		expect(await check('Computed', 'src/nested/Other.tsx')).toEqual({
			result: {
				canUpdate: false,
				reason:
					'Could not find or extract defaultProps for composition "Computed"',
			},
			compositionFile: files.other,
		});

		// Without a location, fall back to the root file
		expect(await check('InRoot', null)).toEqual({
			result: {canUpdate: true, currentDefaultProps: {title: 'Root'}},
			compositionFile: files.root,
		});
		expect(await check('TitlePanel', null)).toEqual({
			result: {
				canUpdate: false,
				reason:
					'Could not determine which file registers this composition, checked the root file: Could not find or extract defaultProps for composition "TitlePanel"',
			},
			compositionFile: files.root,
		});

		const outside = await check('TitlePanel', '../outside.tsx');
		expect(outside.compositionFile).toBeNull();
		expect(outside.result.canUpdate).toBe(false);
		expect(outside.result.canUpdate ? null : outside.result.reason).toStartWith(
			'Cannot update default props in a file outside the project',
		);
	} finally {
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('saving default props only writes and undoes the registering file', async () => {
	const {remotionRoot, entryPoint, files} = makeProject();
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});
	const handlerOptions = <T>(input: T) => ({
		input,
		entryPoint,
		remotionRoot,
		request: {} as never,
		response: {} as never,
		logLevel: 'error' as const,
		methods: {
			removeJob: () => undefined,
			cancelJob: () => undefined,
			addJob: () => undefined,
		},
		publicDir: remotionRoot,
		binariesDirectory: null,
		configFile: null,
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => null,
	});

	try {
		(getUndoStack() as unknown as unknown[]).length = 0;
		(getRedoStack() as unknown as unknown[]).length = 0;

		const response = await updateDefaultPropsHandler(
			handlerOptions({
				compositionId: 'TitlePanel',
				defaultProps: JSON.stringify({children: 'Saved', style: null}),
				enumPaths: [],
				symbolicatedStack: stackFor('src/Showcase.tsx'),
			}),
		);
		expect(response.success).toBe(true);
		expect(readFileSync(files.showcase, 'utf-8')).toContain(
			"children: 'Saved'",
		);
		expect(readFileSync(files.root, 'utf-8')).toBe(rootContents);
		expect(readFileSync(files.other, 'utf-8')).toBe(otherContents);

		const undoResponse = await undoHandler(handlerOptions({}));
		expect(undoResponse.success).toBe(true);
		expect(readFileSync(files.showcase, 'utf-8')).toBe(showcaseContents);
		expect(readFileSync(files.root, 'utf-8')).toBe(rootContents);
	} finally {
		(getUndoStack() as unknown as unknown[]).length = 0;
		(getRedoStack() as unknown as unknown[]).length = 0;
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('keeps each client subscribed to its own default-props file', async () => {
	const {remotionRoot, entryPoint, files} = makeProject();
	const events: unknown[] = [];
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: (clientId, event) => {
			events.push({clientId, event});
			return true;
		},
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});

	try {
		await subscribeToDefaultPropsWatchers({
			compositionId: 'TitlePanel',
			clientId: 'client',
			symbolicatedStack: stackFor('src/Showcase.tsx'),
			remotionRoot,
			entryPoint,
		});
		await subscribeToDefaultPropsWatchers({
			compositionId: 'TitlePanel',
			clientId: 'fallback-client',
			symbolicatedStack: null,
			remotionRoot,
			entryPoint,
		});
		await subscribeToDefaultPropsWatchers({
			compositionId: 'TitlePanel',
			clientId: 'wrong-file-client',
			symbolicatedStack: stackFor('src/nested/Other.tsx'),
			remotionRoot,
			entryPoint,
		});

		writeFileAndNotifyFileWatchers({
			file: files.root,
			content: rootContents.replace("'Root'", "'Changed'"),
			originatorClientId: undefined,
			metadata: null,
		});
		await Promise.resolve();
		expect(events).toEqual([
			{
				clientId: 'fallback-client',
				event: {
					type: 'default-props-updatable-changed',
					compositionId: 'TitlePanel',
					result: {
						canUpdate: false,
						reason:
							'Could not find or extract defaultProps for composition "TitlePanel"',
					},
				},
			},
		]);
		events.length = 0;
		writeFileAndNotifyFileWatchers({
			file: files.showcase,
			content: showcaseContents.replace("'Left Trim'", "'Right Trim'"),
			originatorClientId: undefined,
			metadata: null,
		});
		await Promise.resolve();

		expect(events).toEqual([
			{
				clientId: 'client',
				event: {
					type: 'default-props-updatable-changed',
					compositionId: 'TitlePanel',
					result: {
						canUpdate: true,
						currentDefaultProps: {children: 'Right Trim', style: null},
					},
				},
			},
		]);

		// Resolving the fallback client's stack moves only that client's subscription.
		await subscribeToDefaultPropsWatchers({
			compositionId: 'TitlePanel',
			clientId: 'fallback-client',
			symbolicatedStack: stackFor('src/Showcase.tsx'),
			remotionRoot,
			entryPoint,
		});
		unsubscribeClientDefaultPropsWatchers('client');
		events.length = 0;
		writeFileAndNotifyFileWatchers({
			file: files.root,
			content: rootContents,
			originatorClientId: undefined,
			metadata: null,
		});
		writeFileAndNotifyFileWatchers({
			file: files.showcase,
			content: showcaseContents,
			originatorClientId: undefined,
			metadata: null,
		});
		await Promise.resolve();
		expect(events).toEqual([
			{
				clientId: 'fallback-client',
				event: {
					type: 'default-props-updatable-changed',
					compositionId: 'TitlePanel',
					result: {
						canUpdate: true,
						currentDefaultProps: {children: 'Left Trim', style: null},
					},
				},
			},
		]);
	} finally {
		unsubscribeClientDefaultPropsWatchers('client');
		unsubscribeClientDefaultPropsWatchers('fallback-client');
		unsubscribeClientDefaultPropsWatchers('wrong-file-client');
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
