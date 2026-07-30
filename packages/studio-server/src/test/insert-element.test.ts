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
import type {InsertElementRequest} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {insertElementHandler} from '../preview-server/routes/insert-element';
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

const element = {
	dependencies: [],
	dimensions: {width: 900, height: 260},
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

	const callHandler = (overwriteExisting: boolean) => {
		const input: InsertElementRequest = {
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element,
			from: null,
			overwriteExisting,
			position: null,
		};

		return insertElementHandler({
			binariesDirectory: null,
			configFile: null,
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
		cleanup,
		compositionFile,
		elementFile,
		outsideRoot,
	};
};

test('creates a new Element file without an overwrite conflict', async () => {
	const fixture = makeFixture();
	try {
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
