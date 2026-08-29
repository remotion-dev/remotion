import {expect, test} from 'bun:test';
import {shouldSubscribeToSourceFile} from '../components/Timeline/should-subscribe-to-source-file';

test('only subscribes to project-owned source files', () => {
	for (const source of [
		'./src/Composition.tsx',
		'src/Composition.tsx',
		'packages/video/src/Composition.tsx',
	]) {
		expect(shouldSubscribeToSourceFile(source)).toBe(true);
	}

	for (const source of [
		'..',
		'../light-leaks/dist/esm/index.mjs',
		'..\\light-leaks\\dist\\esm\\index.mjs',
		'./node_modules/@remotion/starburst/dist/esm/index.mjs',
		'C:\\project\\node_modules\\@remotion\\starburst\\dist\\index.mjs',
	]) {
		expect(shouldSubscribeToSourceFile(source)).toBe(false);
	}
});
