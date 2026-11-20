import {afterEach, beforeEach, expect, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {ArtifactProgress} from '@remotion/studio-shared';
import {handleOnArtifact} from '../on-artifact';

let projectRoot: string;
let previousCwd: string;

const probeLink = (createLink: (directory: string) => void) => {
	const directory = mkdtempSync(
		path.join(tmpdir(), 'remotion-artifact-symlink-'),
	);
	try {
		createLink(directory);
		return true;
	} catch {
		return false;
	} finally {
		rmSync(directory, {recursive: true, force: true});
	}
};

const canCreateFileSymlinks = probeLink((directory) => {
	const target = path.join(directory, 'target');
	writeFileSync(target, 'x');
	symlinkSync(target, path.join(directory, 'link'));
});

// Windows allows directory junctions without elevation, file symlinks without.
const canCreateDirectoryLinks = probeLink((directory) => {
	const target = path.join(directory, 'target');
	mkdirSync(target);
	symlinkSync(
		target,
		path.join(directory, 'link'),
		process.platform === 'win32' ? 'junction' : 'dir',
	);
});

beforeEach(() => {
	projectRoot = mkdtempSync(path.join(tmpdir(), 'remotion-artifact-'));
	previousCwd = process.cwd();
	process.chdir(projectRoot);
});

afterEach(() => {
	process.chdir(previousCwd);
	rmSync(projectRoot, {recursive: true, force: true});
});

const writeArtifact = (filename: string, content = 'hello') => {
	const artifactState: ArtifactProgress = {received: []};
	const {onArtifact} = handleOnArtifact({
		artifactState,
		onProgress: () => undefined,
		compositionId: 'Comp',
	});
	onArtifact({filename, content, frame: 0, downloadBehavior: null});
	return artifactState;
};

test('writes nested filenames inside out/', () => {
	writeArtifact('captions/this-week.srt', 'subtitle');

	expect(
		readFileSync(
			path.join(projectRoot, 'out', 'Comp', 'captions', 'this-week.srt'),
			'utf8',
		),
	).toBe('subtitle');
});

test('rejects parent directory segments', () => {
	expect(() => writeArtifact('../escape.txt')).toThrow();
	expect(existsSync(path.join(projectRoot, 'escape.txt'))).toBe(false);
});

test('rejects nested parent directory segments', () => {
	expect(() => writeArtifact('captions/../../escape.txt')).toThrow();
	expect(existsSync(path.join(projectRoot, 'escape.txt'))).toBe(false);
});

test.skipIf(!canCreateFileSymlinks)(
	'rejects writing through a dangling symlink',
	() => {
		const outputDirectory = path.join(projectRoot, 'out', 'Comp');
		mkdirSync(outputDirectory, {recursive: true});
		const outside = path.join(projectRoot, 'outside.txt');
		symlinkSync(outside, path.join(outputDirectory, 'dangling.txt'));

		expect(() => writeArtifact('dangling.txt', 'escaped')).toThrow();
		expect(existsSync(outside)).toBe(false);
	},
);

test.skipIf(!canCreateDirectoryLinks)(
	'rejects writing into a symlinked directory',
	() => {
		const outputDirectory = path.join(projectRoot, 'out', 'Comp');
		const outsideDirectory = path.join(projectRoot, 'outside');
		mkdirSync(outputDirectory, {recursive: true});
		mkdirSync(outsideDirectory, {recursive: true});
		symlinkSync(
			outsideDirectory,
			path.join(outputDirectory, 'link'),
			process.platform === 'win32' ? 'junction' : 'dir',
		);

		expect(() => writeArtifact('link/escaped.txt', 'escaped')).toThrow();
		expect(existsSync(path.join(outsideDirectory, 'escaped.txt'))).toBe(false);
	},
);

test.skipIf(!canCreateDirectoryLinks)(
	'rejects a symlinked destination path',
	() => {
		const outputDirectory = path.join(projectRoot, 'out', 'Comp');
		const outsideDirectory = path.join(projectRoot, 'outside');
		mkdirSync(outputDirectory, {recursive: true});
		mkdirSync(outsideDirectory, {recursive: true});
		symlinkSync(
			outsideDirectory,
			path.join(outputDirectory, 'destination.txt'),
			process.platform === 'win32' ? 'junction' : 'dir',
		);

		expect(() => writeArtifact('destination.txt', 'escaped')).toThrow();
		expect(readdirSync(outsideDirectory).length).toBe(0);
	},
);

test('reports whether the artifact already existed', () => {
	const first = writeArtifact('info.txt', 'one');
	const second = writeArtifact('info.txt', 'two');

	expect(first.received[0]?.alreadyExisted).toBe(false);
	expect(second.received[0]?.alreadyExisted).toBe(true);
});
