import {expect, test} from 'bun:test';
import {makeRenderResourceManager} from '../render-resource-manager';

test('render resources are shared within one render and isolated between renders', () => {
	const firstManager = makeRenderResourceManager();
	const secondManager = makeRenderResourceManager();
	const disposeCounts = {first: 0, second: 0};

	const firstResource = firstManager.getOrCreateResource({
		key: 'resource',
		create: () => ({
			resource: {render: 'first'},
			dispose: () => disposeCounts.first++,
		}),
	});
	const sameFirstResource = firstManager.getOrCreateResource({
		key: 'resource',
		create: () => {
			throw new Error('Resource should only be created once per render');
		},
	});
	const secondResource = secondManager.getOrCreateResource({
		key: 'resource',
		create: () => ({
			resource: {render: 'second'},
			dispose: () => disposeCounts.second++,
		}),
	});

	expect(sameFirstResource).toBe(firstResource);
	expect(secondResource).not.toBe(firstResource);

	firstManager.dispose();
	expect(disposeCounts).toEqual({first: 1, second: 0});

	firstManager.dispose();
	expect(disposeCounts).toEqual({first: 1, second: 0});
	expect(() =>
		firstManager.getOrCreateResource({
			key: 'after-dispose',
			create: () => ({resource: {}, dispose: () => undefined}),
		}),
	).toThrow('Render resource manager has already been disposed');

	secondManager.dispose();
	expect(disposeCounts).toEqual({first: 1, second: 1});
});
