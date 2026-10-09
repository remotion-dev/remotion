import {expect, test} from 'bun:test';
import type {VirtualProject} from '../types';
import {
	getVirtualProjectChanges,
	getVirtualProjectFiles,
} from '../virtual-project';

test('source snapshots distinguish added, edited, removed and unchanged virtual files', () => {
	const project: VirtualProject = {
		entryPoint: 'src/index.ts',
		files: {
			'src/index.ts': "import './Video';",
			'/src/Video.tsx': 'export const Video = () => null;',
			'/src/removed.ts': 'export const unused = true;',
		},
	};
	const previous = getVirtualProjectFiles(project);
	const next = getVirtualProjectFiles({
		...project,
		files: {
			'/src/index.ts': "import './Video';",
			'src/Video.tsx': 'export const Video = () => <div />;',
			'/src/added.ts': 'export const title = "New";',
		},
	});
	expect(getVirtualProjectChanges({previous, next})).toEqual({
		modified: ['/src/Video.tsx', '/src/added.ts'],
		removed: ['/src/removed.ts'],
	});
	expect(getVirtualProjectChanges({previous: next, next})).toEqual({
		modified: [],
		removed: [],
	});
	expect(project.files['src/index.ts']).toBe("import './Video';");
});
