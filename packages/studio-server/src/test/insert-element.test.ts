import {expect, test} from 'bun:test';
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {
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

const element: InsertElementRequest['element'] = {
	dependencies: [],
	dimensions: {width: 900, height: 260},
	durationInFrames: 72,
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

	clearUndoStackForTests();
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
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element,
			expectedFileState,
			from: null,
			overwriteExisting,
			position: null,
		});
	};

	const prepareInstall = () => {
		const input: PrepareElementInstallRequest = {
			compositionFile: 'Root.tsx',
			compositionId: 'target',
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
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {force: true, recursive: true});
		rmSync(outsideRoot, {force: true, recursive: true});
	};

	return {
		callHandler,
		callHandlerWithInput,
		cleanup,
		prepareInstall,
		compositionFile,
		elementFile,
		outsideRoot,
	};
};

test('plans an Element installation without changing the project', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.prepareInstall();

		expect(response).toEqual({
			success: true,
			plan: {
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

test('creates a new Element file without an overwrite conflict', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.callHandler(false);

		expect(response).toEqual({success: true});
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

test('installs an Element with a component-owned Sequence', async () => {
	const fixture = makeFixture();
	try {
		const response = await fixture.callHandlerWithInput({
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: {...element, installationMode: 'component-owned-sequence'},
			expectedFileState: null,
			from: 30,
			overwriteExisting: false,
			position: {x: 120, y: 80},
		});

		expect(response).toEqual({success: true});
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			incomingElementSource,
		);
		const composition = readFileSync(fixture.compositionFile, 'utf-8');
		expect(composition).not.toContain('<Sequence');
		expect(composition).toContain('<LowerThird');
		expect(composition).toContain('durationInFrames={72}');
		expect(composition).toContain('from={30}');
		expect(composition).toContain('name="Lower Third"');
		expect(composition).toContain("position: 'absolute'");
		expect(composition).toContain("translate: '120px 80px'");
	} finally {
		fixture.cleanup();
	}
});

test('reuses an identical Element file without an overwrite conflict', async () => {
	const fixture = makeFixture();
	try {
		writeFileSync(fixture.elementFile, incomingElementSource);
		const response = await fixture.callHandler(false);

		expect(response).toEqual({success: true});
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			incomingElementSource,
		);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toContain(
			'<LowerThird',
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

test('does not overwrite a file that changed after planning', async () => {
	const fixture = makeFixture();
	try {
		const planned = await fixture.prepareInstall();
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
});

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

		expect(response).toEqual({success: true});
		expect(readFileSync(fixture.elementFile, 'utf-8')).toBe(
			incomingElementSource,
		);
		expect(readFileSync(fixture.compositionFile, 'utf-8')).toContain(
			'<LowerThird',
		);
		expect(getUndoStack()).toHaveLength(1);

		expect(popUndo()).toEqual({success: true});
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
