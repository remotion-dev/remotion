import {afterEach, expect, test} from 'bun:test';
import type {DuplicateJsxNodeRequest} from '@remotion/studio-shared';
import {duplicateJsxNode} from '../components/duplicate-jsx-node-api';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('routes JSX duplication through Browser Studio', async () => {
	const nodePath = ['program', 'body', 1];
	const receivedRequests: DuplicateJsxNodeRequest[] = [];
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({
				duplicateJsxNode: (request) => {
					receivedRequests.push(request);
					return Promise.resolve({
						success: true,
						nodePathMutation: {files: [], mutationId: 'test-mutation'},
					});
				},
			}),
		},
	});

	const result = await duplicateJsxNode({
		nodes: [
			{
				fileName: '/project/src/Composition.tsx',
				nodePath,
			},
		],
	});

	expect(result.success).toBe(true);
	expect(receivedRequests).toEqual([
		{
			nodes: [
				{
					fileName: '/project/src/Composition.tsx',
					nodePath,
				},
			],
		},
	]);
});
