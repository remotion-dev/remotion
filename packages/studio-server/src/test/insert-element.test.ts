import {expect, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {
	EventSourceEvent,
	InsertElementRequest,
	PrepareElementInstallRequest,
} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {insertElementHandler} from '../preview-server/routes/insert-element';
import {prepareElementInstallHandler} from '../preview-server/routes/prepare-element-install';
import {
	clearUndoStackForTests,
	getUndoStack,
	popUndo,
	popRedo,
} from '../preview-server/undo-stack';

const compositionSource = `import React from 'react';
import {Composition} from 'remotion';

const Target = () => <div>Hello</div>;

export const RemotionRoot = () => (
	<Composition
		id="target"
		component={Target}
		durationInFrames={100}
		fps={30}
		width={1920}
		height={1080}
	/>
);
`;

const incomingElementSource =
	'export const LowerThird = () => <div>Incoming</div>;\n';
const existingElementSource =
	'export const LowerThird = () => <div>Locally changed</div>;\n';

const structuredInitialProps = {
	captions: [
		{
			confidence: null,
			endMs: 1000,
			startMs: 0,
			text: 'First copy',
			timestampMs: 500,
		},
	],
	style: {
		color: 'red',
		opacity: 0.8,
		position: 'relative',
		translate: '1px 2px',
	},
	width: 900,
};

const element: InsertElementRequest['element'] = {
	dependencies: [],
	dimensions: {width: 900, height: 260},
	durationInFrames: 72,
	initialProps: null,
	installationMode: null,
	displayName: 'Lower Third',
	slug: 'overlays/lower-third',
	sourceCode: incomingElementSource,
};

const makeFixture = () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-element-'));
	const outsideRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-element-outside-'),
	);
	const compositionFile = path.join(remotionRoot, 'Root.tsx');
	const elementFile = path.join(remotionRoot, 'lower-third.element.tsx');
	writeFileSync(compositionFile, compositionSource);
	const events: EventSourceEvent[] = [];
	const contentsAtMutation: string[] = [];
	const watcherSkipSequencePropsUpdates: boolean[] = [];

	clearUndoStackForTests();
	const fileWatcherRegistry = createFileWatcherRegistry();
	const cleanupFileWatcher = setFileWatcherRegistry(fileWatcherRegistry);
	const {unwatch} = fileWatcherRegistry.installFileWatcher({
		file: compositionFile,
		existenceOnly: false,
		onChange: (event) => {
			if (event.type === 'changed') {
				watcherSkipSequencePropsUpdates.push(event.skipSequencePropsUpdate);
			}
		},
	});
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: (event) => {
			events.push(event);
			if (event.type === 'sequence-node-paths-remapped') {
				contentsAtMutation.push(readFileSync(compositionFile, 'utf-8'));
			}
		},
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});

	const callHandlerWithInput = (input: InsertElementRequest) => {
		return insertElementHandler({
			binariesDirectory: null,
			configFile: null,
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			entryPoint: compositionFile,
			input,
			logLevel: 'error',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: remotionRoot,
			remotionRoot,
			request: {} as never,
			response: {} as never,
		});
	};

	const callHandler = (
		overwriteExisting: boolean,
		expectedFileState: InsertElementRequest['expectedFileState'] = null,
	) => {
		return callHandlerWithInput({
			installationName: null,
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element,
			expectedFileState,
			from: null,
			overwriteExisting,
			position: null,
		});
	};

	const currentDestination = {
		type: 'current-composition',
		compositionFile: 'Root.tsx',
		compositionId: 'target',
	} as const;
	const prepareInstall = (
		destination: PrepareElementInstallRequest['destination'],
	) => {
		const input: PrepareElementInstallRequest = {
			installationName: null,
			destination,
			element,
		};

		return prepareElementInstallHandler({
			binariesDirectory: null,
			configFile: null,
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			entryPoint: compositionFile,
			input,
			logLevel: 'error',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: remotionRoot,
			remotionRoot,
			request: {} as never,
			response: {} as never,
		});
	};

	const cleanup = () => {
		clearUndoStackForTests();
		unwatch();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {force: true, recursive: true});
		rmSync(outsideRoot, {force: true, recursive: true});
	};

	return {
		callHandler,
		callHandlerWithInput,
		cleanup,
		currentDestination,
		prepareInstall,
		compositionFile,
		contentsAtMutation,
		elementFile,
		events,
		outsideRoot,
		watcherSkipSequencePropsUpdates,
	};
};

test('plans an Element installation without changing the project', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.prepareInstall(fixture.currentDestination);

		expect(response).toEqual({
			success: true,
			plan: {
				compositionFile: fixture.compositionFile,
				expectedFileState: {exists: false},
				filePath: 'lower-third.element.tsx',
			},
		});
		expect(existsSync(fixture.elementFile)).toBe(false);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
			compositionSource,
		);
	} finally {
		fixture.cleanup();
	}
});

test('plans a new-composition install without resolving the selected component', async () => {
	const fixture = makeFixture();
	try {
		writeFileSync(
			fixture.compositionFile,
			compositionSource
				.replace(
					'const Target = () => <div>Hello</div>;',
					'const Comp = () => <div>Hello</div>;\nexport const ThreeDCheck = Comp;',
				)
				.replace('component={Target}', 'component={ThreeDCheck}'),
		);
		const current = await fixture.prepareInstall({
			type: 'current-composition',
			compositionFile: 'Root.tsx',
			compositionId: 'target',
		});
		expect(current).toMatchObject({success: false});

		const srcDirectory = path.join(
			path.dirname(fixture.compositionFile),
			'src',
		);
		mkdirSync(srcDirectory);
		writeFileSync(path.join(srcDirectory, 'Root.tsx'), compositionSource);
		const newComposition = await fixture.prepareInstall({
			type: 'new-composition',
			compositionFile: null,
		});
		expect(newComposition).toEqual({
			success: true,
			plan: {
				compositionFile: path.join(srcDirectory, 'Root.tsx'),
				expectedFileState: {exists: false},
				filePath: 'src/lower-third.element.tsx',
			},
		});
		expect(existsSync(path.join(srcDirectory, 'lower-third.element.tsx'))).toBe(
			false,
		);
	} finally {
		fixture.cleanup();
	}
});

test('creates a new Element file without an overwrite conflict', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.callHandler(false);

		if (!response.success) {
			throw new Error(
				response.type === 'error'
					? response.reason
					: 'Unexpected file conflict',
			);
		}

		expect(
			fixture.events.filter(
				(event) => event.type === 'sequence-node-paths-remapped',
			),
		).toEqual([
			{
				type: 'sequence-node-paths-remapped',
				mutation: response.nodePathMutation,
			},
		]);
		expect(fixture.contentsAtMutation).toEqual([compositionSource]);
		expect(fixture.watcherSkipSequencePropsUpdates).toEqual([true]);
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			incomingElementSource,
		);
		const composition = readFileSync(fixture.compositionFile, 'utf-8');
		expect(composition).toMatch(
			/<Sequence\b(?=[^>]*\bdurationInFrames=\{72\})[^>]*>\s*<LowerThird\s*\/>\s*<\/Sequence>/,
		);
	} finally {
		fixture.cleanup();
	}
});

test('installs structured initial props on a component-owned Sequence', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.callHandlerWithInput({
			installationName: null,
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: {
				...element,
				initialProps: structuredInitialProps,
				installationMode: 'component-owned-sequence',
			},
			expectedFileState: null,
			from: 30,
			overwriteExisting: false,
			position: {x: 120, y: 80},
		});

		if (!response.success) {
			throw new Error(
				response.type === 'error'
					? response.reason
					: 'Unexpected file conflict',
			);
		}

		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			incomingElementSource,
		);
		const composition = readFileSync(fixture.compositionFile, 'utf-8');
		expect(composition).not.toContain('<Sequence');
		expect(composition).toContain('<LowerThird');
		expect(composition).toContain('durationInFrames={72}');
		expect(composition).toContain('from={30}');
		expect(composition).toContain('name="Lower Third"');
		expect(composition).toContain('captions={[');
		expect(composition).toContain('text: "First copy"');
		expect(composition).toContain('width={900}');
		expect(composition).toContain('color: "red"');
		expect(composition).toContain('opacity: 0.8');
		expect(composition).toContain('position: "absolute"');
		expect(composition).toContain('translate: "120px 80px"');
		expect(composition).not.toContain('position: "relative"');
		expect(composition).not.toContain('translate: "1px 2px"');
		expect(composition.match(/\bstyle=/g)).toHaveLength(1);
		expect(composition.match(/text: "First copy"/g)).toHaveLength(1);
		expect(incomingElementSource).not.toContain('First copy');
	} finally {
		fixture.cleanup();
	}
});

test('rejects contradictory component-owned installation props', async () => {
	const invalidInitialProps: Array<
		NonNullable<InsertElementRequest['element']['initialProps']>
	> = [{from: 10}, {style: 'color: red'}];
	for (const initialProps of invalidInitialProps) {
		const fixture = makeFixture();
		try {
			const response = await fixture.callHandlerWithInput({
				installationName: null,
				compositionFile: 'Root.tsx',
				compositionId: 'target',
				element: {
					...element,
					initialProps,
					installationMode: 'component-owned-sequence',
				},
				expectedFileState: null,
				from: 30,
				overwriteExisting: false,
				position: {x: 120, y: 80},
			});
			expect(response).toMatchObject({success: false, type: 'error'});
			expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
				compositionSource,
			);
			expect(existsSync(fixture.elementFile)).toBe(false);
		} finally {
			fixture.cleanup();
		}
	}
});

test('keeps wrapped installation and passes initial props to its child', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.callHandlerWithInput({
			installationName: null,
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: {
				...element,
				initialProps: {label: 'Starter', style: {color: 'blue'}},
			},
			expectedFileState: null,
			from: 12,
			overwriteExisting: false,
			position: {x: 40, y: 50},
		});
		if (!response.success) {
			throw new Error(
				response.type === 'error'
					? response.reason
					: 'Unexpected file conflict',
			);
		}

		const composition = readFileSync(fixture.compositionFile, 'utf-8');
		expect(composition).toContain('<Sequence');
		expect(composition).toContain('from={12}');
		expect(composition).toContain('translate: "40px 50px"');
		expect(composition).toContain('label="Starter"');
		expect(composition).toMatch(/style=\{\{\s*color: "blue"\s*\}\}/);
	} finally {
		fixture.cleanup();
	}
});

test('materializes independent props for two component-owned copies', async () => {
	const fixture = makeFixture();
	try {
		const componentOwnedElement = {
			...element,
			initialProps: structuredInitialProps,
			installationMode: 'component-owned-sequence' as const,
		};
		const first = await fixture.callHandlerWithInput({
			installationName: null,
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: componentOwnedElement,
			expectedFileState: null,
			from: 0,
			overwriteExisting: false,
			position: null,
		});
		expect(first.success).toBe(true);
		const second = await fixture.callHandlerWithInput({
			installationName: 'second-lower-third',
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: componentOwnedElement,
			expectedFileState: {exists: false},
			from: 30,
			overwriteExisting: false,
			position: null,
		});
		expect(second.success).toBe(true);

		const composition = readFileSync(fixture.compositionFile, 'utf-8');
		expect(composition.match(/captions=\{\[/g)).toHaveLength(2);
		expect(composition.match(/text: "First copy"/g)).toHaveLength(2);
		expect(composition).not.toContain('...structuredInitialProps');
	} finally {
		fixture.cleanup();
	}
});

test('installs independent named copies into the same and another composition', async () => {
	const fixture = makeFixture();
	try {
		expect((await fixture.callHandler(false)).success).toBe(true);
		// Even identical source must not be implicitly reused.
		expect(await fixture.callHandler(false)).toMatchObject({
			success: false,
			type: 'file-conflict',
		});
		writeFileSync(fixture.elementFile, existingElementSource);
		const firstComposition = readFileSync(fixture.compositionFile, 'utf-8');
		const root = path.dirname(fixture.compositionFile);
		const secondFile = path.join(root, 'speaker-name.element.tsx');
		const thirdFile = path.join(root, 'guest-name.element.tsx');
		const otherComposition = path.join(root, 'Interview.tsx');
		writeFileSync(
			otherComposition,
			compositionSource.replace('id="target"', 'id="interview"'),
		);

		const input: InsertElementRequest = {
			installationName: 'speaker-name',
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element,
			expectedFileState: {exists: false},
			from: null,
			position: null,
			overwriteExisting: false,
		};
		expect((await fixture.callHandlerWithInput(input)).success).toBe(true);
		const secondComposition = readFileSync(fixture.compositionFile, 'utf-8');
		expect(secondComposition).toContain('LowerThird as LowerThird2');
		expect(secondComposition).toContain('./speaker-name.element');
		expect(secondComposition).toContain('<LowerThird2');
		expect(secondComposition).toContain('<LowerThird ');
		expect(readFileSync(secondFile, 'utf-8')).toBe(incomingElementSource);

		expect(popUndo().success).toBe(true);
		expect(existsSync(secondFile)).toBe(false);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
			firstComposition,
		);
		expect(popRedo().success).toBe(true);
		expect(readFileSync(secondFile, 'utf-8')).toBe(incomingElementSource);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
			secondComposition,
		);

		expect(
			(
				await fixture.callHandlerWithInput({
					...input,
					installationName: 'guest-name',
					compositionFile: 'Interview.tsx',
					compositionId: 'interview',
				})
			).success,
		).toBe(true);
		expect(readFileSync(otherComposition, 'utf-8')).toContain(
			'./guest-name.element',
		);
		expect(readFileSync(thirdFile, 'utf-8')).toBe(incomingElementSource);
		writeFileSync(
			secondFile,
			'export const LowerThird = () => <div>Speaker</div>;',
		);
		expect(readFileSync(thirdFile, 'utf-8')).toBe(incomingElementSource);
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			existingElementSource,
		);
	} finally {
		fixture.cleanup();
	}
});

test('returns a structured conflict without changing the project', async () => {
	const fixture = makeFixture();
	try {
		writeFileSync(fixture.elementFile, existingElementSource);
		const response = await fixture.callHandler(false);

		expect(response).toEqual({
			success: false,
			type: 'file-conflict',
			conflict: {
				filePath: 'lower-third.element.tsx',
				existingSource: existingElementSource,
				incomingSource: incomingElementSource,
			},
		});
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			existingElementSource,
		);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
			compositionSource,
		);
		expect(getUndoStack()).toHaveLength(0);
	} finally {
		fixture.cleanup();
	}
});

test.each([null, incomingElementSource])(
	'does not overwrite a file that changed after planning (previous source: %s)',
	async (previousSource) => {
		const fixture = makeFixture();
		try {
			if (previousSource !== null)
				writeFileSync(fixture.elementFile, previousSource);
			const planned = await fixture.prepareInstall(fixture.currentDestination);
			if (!planned.success) {
				throw new Error(planned.reason);
			}

			writeFileSync(fixture.elementFile, existingElementSource);
			const response = await fixture.callHandler(
				true,
				planned.plan.expectedFileState,
			);

			expect(response).toEqual({
				success: false,
				type: 'file-conflict',
				conflict: {
					filePath: 'lower-third.element.tsx',
					existingSource: existingElementSource,
					incomingSource: incomingElementSource,
				},
			});
			expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
				existingElementSource,
			);
			expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
				compositionSource,
			);
		} finally {
			fixture.cleanup();
		}
	},
);

test.each(['../outside', 'nested/name', 'Uppercase', '', 'name.element.tsx'])(
	'rejects unsafe installation name %s without changing the project',
	async (installationName) => {
		const fixture = makeFixture();
		try {
			expect(
				await fixture.callHandlerWithInput({
					installationName,
					compositionFile: 'Root.tsx',
					compositionId: 'target',
					element,
					expectedFileState: null,
					from: null,
					position: null,
					overwriteExisting: false,
				}),
			).toMatchObject({success: false, type: 'error'});
			expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
				compositionSource,
			);
			expect(existsSync(fixture.elementFile)).toBe(false);
			expect(getUndoStack()).toHaveLength(0);
		} finally {
			fixture.cleanup();
		}
	},
);

test('rejects an Element source symlink that escapes the project', async () => {
	const fixture = makeFixture();
	try {
		const outsideElement = path.join(
			fixture.outsideRoot,
			'lower-third.element.tsx',
		);
		writeFileSync(outsideElement, existingElementSource);
		symlinkSync(outsideElement, fixture.elementFile);

		const response = await fixture.callHandler(true);

		expect(response).toMatchObject({
			success: false,
			type: 'error',
			reason: 'Element source file must not be a symbolic link',
		});
		expect(readFileSync(outsideElement, 'utf-8')).toBe(existingElementSource);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
			compositionSource,
		);
	} finally {
		fixture.cleanup();
	}
});

test('rejects a composition source symlink that escapes the project', async () => {
	const fixture = makeFixture();
	try {
		const outsideComposition = path.join(fixture.outsideRoot, 'Root.tsx');
		writeFileSync(outsideComposition, compositionSource);
		rmSync(fixture.compositionFile);
		symlinkSync(outsideComposition, fixture.compositionFile);

		const response = await fixture.callHandler(false);

		expect(response).toMatchObject({
			success: false,
			type: 'error',
			reason: 'Element installation must stay inside the Remotion project',
		});
		expect(readFileSync(outsideComposition, 'utf-8')).toBe(compositionSource);
	} finally {
		fixture.cleanup();
	}
});

test('overwrites conflicting source and undo restores both files', async () => {
	const fixture = makeFixture();
	try {
		writeFileSync(fixture.elementFile, existingElementSource);
		const response = await fixture.callHandler(true);

		expect(response.success).toBe(true);
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			incomingElementSource,
		);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toContain(
			'<LowerThird',
		);
		expect(getUndoStack()).toHaveLength(1);

		const undoResponse = popUndo();
		expect(undoResponse.success).toBe(true);
		if (!undoResponse.success || undoResponse.nodePathMutation === null) {
			throw new Error('Expected undo to include a node path mutation');
		}

		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			existingElementSource,
		);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toBe(
			compositionSource,
		);
		expect(existsSync(fixture.elementFile)).toBe(true);
	} finally {
		fixture.cleanup();
	}
});
