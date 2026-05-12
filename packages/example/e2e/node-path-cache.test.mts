import assert from 'node:assert';
import fs from 'fs';
import {expect, test} from '@playwright/test';
import {Internals} from 'remotion';
import {apiCall} from './api-call.mts';
import {newVideoFile} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.describe('node-path cache for stale source maps', () => {
	let originalContent: string;

	test.beforeEach(async () => {
		originalContent = fs.readFileSync(newVideoFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		fs.writeFileSync(newVideoFile, originalContent);
		await stopStudio();
	});

	// Regression test for the following scenario:
	//
	// 1. NewVideo.tsx has <Video> on line 22:
	//
	//      export const Component = () => {
	//        return <Video src={src} />;      // line 22
	//      };
	//
	// 2. The studio updates a prop via the API (suppressing the webpack rebuild).
	//    Prettier then wraps the return in parentheses, shifting <Video> to line 23:
	//
	//      export const Component = () => {
	//        return (
	//          <Video src={src} style={{}} />  // now line 23
	//        );
	//      };
	//
	// 3. On reload, the stale source map still resolves to line 22, but the tag
	//    is now on line 23. Without the node-path cache, subscribe-to-sequence-props
	//    would fail because lineColumnToNodePath(ast, 22) finds nothing.
	//
	// The cache stores (fileName, line, column) → AST nodePath on first successful
	// resolution. When the same stale coordinates are sent again, the cached
	// nodePath is reused (and verified against the current AST).

	test('subscribe-to-sequence-props succeeds with stale line number after file reformatting', async () => {
		const content = fs.readFileSync(newVideoFile, 'utf-8');
		const lines = content.split('\n');
		const videoLineIndex = lines.findIndex((l) => l.includes('<Video'));
		expect(videoLineIndex).toBeGreaterThan(-1);
		const videoLine = videoLineIndex + 1; // 1-indexed

		// 1. Initial subscription → resolves line to AST nodePath and caches it
		const result1 = await apiCall('/api/subscribe-to-sequence-props', {
			fileName: 'src/NewVideo.tsx',
			line: videoLine,
			column: 0,
			schema: Internals.sequenceSchema,
			clientId: 'e2e-cache-test-1',
		});
		expect(result1.success).toBe(true);
		assert(result1.success);
		expect(result1.data.canUpdate).toBe(true);
		assert(result1.data.canUpdate);
		expect(result1.data.nodePath).toBeTruthy();

		// 2. Simulate prettier wrapping the return in parentheses,
		//    shifting <Video> down by one line.
		const editedContent = content.replace(
			'return <Video src={src} debugOverlay />;',
			'return (\n\t\t<Video src={src} debugOverlay />\n\t);',
		);
		expect(editedContent).not.toBe(content);
		fs.writeFileSync(newVideoFile, editedContent);

		// Verify the tag actually moved
		const editedLines = editedContent.split('\n');
		const newVideoLineIndex = editedLines.findIndex((l) =>
			l.includes('<Video'),
		);
		expect(newVideoLineIndex + 1).toBe(videoLine + 1);

		// 3. Subscribe again with the ORIGINAL (stale) line number.
		//    Without the cache, this would fail because the tag is no longer on this line.
		//    With the cache, the previously resolved nodePath is reused.
		const result2 = await apiCall('/api/subscribe-to-sequence-props', {
			fileName: 'src/NewVideo.tsx',
			line: videoLine, // stale line number
			column: 0,
			schema: Internals.sequenceSchema,
			clientId: 'e2e-cache-test-2',
		});
		expect(result2.success).toBe(true);
		assert(result2.success);
		expect(result2.data.canUpdate).toBe(true);
		assert(result2.data.canUpdate);
		expect(result2.data.nodePath).toBeTruthy();

		// The nodePath should be the same — both refer to the same <Video> element
		expect(result2.data.nodePath).toEqual(result1.data.nodePath);
	});
});
