import {expect, test} from 'bun:test';
import {deleteNestedKey} from '../delete-nested-key';

test('removes parent object when it becomes empty', () => {
	const obj = {
		from: 0,
		durationInFrames: 6,
		style: {opacity: 0.6},
		stack:
			'Error\n    at Object.apply (http://localhost:3001/bundle.js:35234:18)\n    at http://localhost:3001/src_Root_tsx.bundle.js:3772:86\n    at Array.map (<anonymous>)\n    at SlicedVideo (http://localhost:3001/src_Root_tsx.bundle.js:3770:47)\n    at Object.react_stack_bottom_frame (http://localhost:3001/bundle.js:25913:20)\n    at renderWithHooks (http://localhost:3001/bundle.js:7671:22)\n    at updateFunctionComponent (http://localhost:3001/bundle.js:10175:19)\n    at beginWork (http://localhost:3001/bundle.js:11787:18)\n    at runWithFiberInDEV (http://localhost:3001/bundle.js:881:30)\n    at performUnitOfWork (http://localhost:3001/bundle.js:17650:22)\n    at workLoopSync (http://localhost:3001/bundle.js:17478:41)\n    at renderRootSync (http://localhost:3001/bundle.js:17459:11)\n    at performWorkOnRoot (http://localhost:3001/bundle.js:16513:11)\n    at performWorkOnRootViaSchedulerTask (http://localhost:3001/bundle.js:18966:7)\n    at MessagePort.performWorkUntilDeadline (http://localhost:3001/bundle.js:31124:48)',
		layout: 'none',
	};

	const result = deleteNestedKey(
		obj as unknown as Record<string, unknown>,
		new Set(['style.opacity', 'style.rotate']),
	);

	expect(result).toEqual({
		from: 0,
		durationInFrames: 6,
		stack: obj.stack,
		layout: 'none',
	} as unknown as typeof result);
	expect('style' in result).toBe(false);
});
