import {expect, test} from 'bun:test';
import {
	getVirtualProjectChanges,
	getVirtualProjectFiles,
} from '../virtual-project';

test('source snapshots distinguish added, edited, removed and unchanged virtual files', () => {
	const project = {
		rootDir: '/project',
		entryPoint: '/project/index.ts',
		files: {
			'project/index.ts': "import './Video';",
			'/project/Video.tsx': 'export const Video = () => null;',
			'/project/removed.ts': 'export const unused = true;',
		},
	};
	const previous = getVirtualProjectFiles(project);
	const next = getVirtualProjectFiles({
		...project,
		files: {
			'/project/index.ts': "import './Video';",
			'project/Video.tsx': 'export const Video = () => <div />;',
			'/project/added.ts': 'export const title = "New";',
		},
	});
	expect(getVirtualProjectChanges({previous, next})).toEqual({
		modified: ['/project/Video.tsx', '/project/added.ts'],
		removed: ['/project/removed.ts'],
	});
	expect(getVirtualProjectChanges({previous: next, next})).toEqual({
		modified: [],
		removed: [],
	});
	expect(project.files['project/index.ts']).toBe("import './Video';");
});
