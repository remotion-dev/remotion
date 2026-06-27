import {expect, test} from 'bun:test';
import {parseAndApplyCodemod} from '../codemods/duplicate-composition';

const compositionInRoot = `import {Composition} from 'remotion';
import {NewVideo} from './NewVideo';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="NewVideo"
				component={NewVideo}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="Other"
				component={NewVideo}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
`;

const compositionInOwnFile = `import {Composition} from 'remotion';

const Component = () => null;

export const NewVideoComp = () => {
	return (
		<Composition
			component={Component}
			id="NewVideo"
			durationInFrames={120}
			fps={30}
			width={1280}
			height={720}
		/>
	);
};
`;

const compositionInConciseArrow = `import {Composition} from 'remotion';

const Component = () => null;

export const NewVideoComp = () => (
	<Composition
		component={Component}
		id="NewVideo"
		durationInFrames={120}
		fps={30}
		width={1280}
		height={720}
	/>
);
`;

test('Delete composition that is a child of a Fragment in Root.tsx', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInRoot,
		codeMod: {type: 'delete-composition', idToDelete: 'NewVideo'},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).not.toContain('id="NewVideo"');
	expect(newContents).toContain('id="Other"');
});

test('Delete composition that is the sole return value of a wrapper component', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInOwnFile,
		codeMod: {type: 'delete-composition', idToDelete: 'NewVideo'},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).not.toContain('id="NewVideo"');
});

test('Delete composition that is a concise arrow body', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInConciseArrow,
		codeMod: {type: 'delete-composition', idToDelete: 'NewVideo'},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).not.toContain('id="NewVideo"');
});

test('Rename composition that is the sole return value of a wrapper component', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInOwnFile,
		codeMod: {
			type: 'rename-composition',
			idToRename: 'NewVideo',
			newId: 'Renamed',
		},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).not.toContain('id="NewVideo"');
	expect(newContents).toContain('id="Renamed"');
});

test('Duplicate composition that is the sole return value of a wrapper component', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInOwnFile,
		codeMod: {
			type: 'duplicate-composition',
			idToDuplicate: 'NewVideo',
			newId: 'Duplicated',
			newDurationInFrames: null,
			newFps: null,
			newHeight: null,
			newWidth: null,
			tag: 'Composition',
		},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).toContain('id="NewVideo"');
	expect(newContents).toContain('id="Duplicated"');
});

test('Delete composition leaves a returns-null wrapper that still parses', () => {
	const {newContents} = parseAndApplyCodemod({
		input: compositionInOwnFile,
		codeMod: {type: 'delete-composition', idToDelete: 'NewVideo'},
	});

	expect(newContents).toContain('return null');
	expect(newContents).not.toContain('<Composition');
});

test('Delete unmatched composition leaves the file unchanged', () => {
	expect(() =>
		parseAndApplyCodemod({
			input: compositionInOwnFile,
			codeMod: {type: 'delete-composition', idToDelete: 'DoesNotExist'},
		}),
	).toThrow('Unable to calculate the changes');
});

test('Rename concise-arrow composition keeps the arrow expression body', () => {
	const {newContents} = parseAndApplyCodemod({
		input: compositionInConciseArrow,
		codeMod: {
			type: 'rename-composition',
			idToRename: 'NewVideo',
			newId: 'Renamed',
		},
	});

	expect(newContents).toContain('id="Renamed"');
	expect(newContents).not.toContain('id="NewVideo"');
});

test('Duplicate composition as Still adds Still import', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInOwnFile,
		codeMod: {
			type: 'duplicate-composition',
			idToDuplicate: 'NewVideo',
			newId: 'Duplicated',
			newDurationInFrames: null,
			newFps: null,
			newHeight: null,
			newWidth: null,
			tag: 'Still',
		},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).toContain('id="NewVideo"');
	expect(newContents).toContain('id="Duplicated"');
	expect(newContents).toContain('<Still');
	expect(newContents).toContain('Still');
	expect(newContents).toMatch(
		/import\s*\{[^}]*Still[^}]*\}\s*from\s*['"]remotion['"]/,
	);
});

test('Duplicate composition as Still does not duplicate import if Still already imported', () => {
	const inputWithStill = `import {Composition, Still} from 'remotion';

const Component = () => null;

export const NewVideoComp = () => {
	return (
		<Composition
			component={Component}
			id="NewVideo"
			durationInFrames={120}
			fps={30}
			width={1280}
			height={720}
		/>
	);
};
`;

	const {newContents} = parseAndApplyCodemod({
		input: inputWithStill,
		codeMod: {
			type: 'duplicate-composition',
			idToDuplicate: 'NewVideo',
			newId: 'Duplicated',
			newDurationInFrames: null,
			newFps: null,
			newHeight: null,
			newWidth: null,
			tag: 'Still',
		},
	});

	// Should only have one import of Still, not two
	// Still appears in: import + JSX tag opening
	expect(newContents).toContain('<Still');
	expect(newContents).toMatch(
		/import\s*\{[^}]*Still[^}]*\}\s*from\s*['"]remotion['"]/,
	);
	// Ensure no duplicate import declarations
	const importLines = newContents
		.split('\n')
		.filter((l: string) => l.includes('import') && l.includes('remotion'));
	expect(importLines.length).toBe(1);
});

test('New composition appends to root and adds imports', () => {
	const {newContents, changesMade} = parseAndApplyCodemod({
		input: compositionInRoot,
		codeMod: {
			type: 'new-composition',
			newId: 'FreshVideo',
			componentName: 'FreshVideo',
			componentImportPath: './FreshVideo',
			folderName: null,
			parentName: null,
			newDurationInFrames: 150,
			newFps: 30,
			newHeight: 1080,
			newWidth: 1920,
		},
	});

	expect(changesMade.length).toBeGreaterThan(0);
	expect(newContents).toMatch(
		/import\s*\{[^}]*FreshVideo[^}]*\}\s*from\s*['"].\/FreshVideo['"]/,
	);
	expect(newContents).toMatch(
		/import\s*\{[^}]*Composition[^}]*\}\s*from\s*['"]remotion['"]/,
	);
	expect(newContents).toContain('id="FreshVideo"');
	expect(newContents).toContain('component={FreshVideo}');
	expect(newContents).toContain('durationInFrames={150}');
	expect(newContents).toContain('width={1920}');
});
