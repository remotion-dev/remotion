import {expect, test} from 'bun:test';
import path from 'node:path';
import {resolveCompositionComponent} from '../helpers/resolve-composition-component';

const remotionRoot = path.join(__dirname, '..', '..', '..', 'example');

test('resolves a statically imported composition component', async () => {
	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile: 'src/E2eTestRoot.tsx',
		compositionId: 'schema-test',
	});

	expect(location.source).toBe(path.join('src', 'SchemaTest', 'index.tsx'));
	expect(location.line).toBe(142);
});

test('resolves a lazy imported composition component', async () => {
	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile: 'src/Root.tsx',
		compositionId: 'looped',
	});

	expect(location.source).toBe(path.join('src', 'LoopedVideo', 'index.tsx'));
	expect(location.line).toBe(4);
});

test('resolves a same-file composition component', async () => {
	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile: 'src/NewVideo.tsx',
		compositionId: 'NewVideo',
	});

	expect(location.source).toBe(path.join('src', 'NewVideo.tsx'));
	expect(location.line).toBe(21);
});
