import {expect, test} from 'bun:test';
import type {LiteEvent} from 'react-scan/lite';
import {summarizeReactScanEvents, type StoredReactScanEvent} from './summarize';

const makeStoredEvent = (event: LiteEvent): StoredReactScanEvent => ({
	event,
	eventIndex: 0,
	receivedAt: '2026-08-21T12:00:00.000Z',
	sequence: 0,
	sessionId: 'test',
});

test('summarizes commit costs and render causes for an agent', () => {
	const summary = summarizeReactScanEvents([
		makeStoredEvent({
			available: true,
			bundleType: 1,
			kind: 'profiling-hooks-status',
			reactVersion: '19.2.3',
			timestamp: 1,
		}),
		makeStoredEvent({
			kind: 'commit',
			priorityName: 'UserBlocking',
			timestamp: 2,
			tree: [
				{
					actualDuration: 10,
					actualStartTime: 1,
					depth: 0,
					name: 'Root',
					selfBaseDuration: 1,
					tag: 0,
					treeBaseDuration: 10,
				},
				{
					actualDuration: 7,
					actualStartTime: 1,
					changeDescription: {
						context: false,
						hooks: [0],
						isFirstMount: false,
						parent: true,
						props: ['items'],
						state: false,
					},
					depth: 1,
					fiberId: 1,
					name: 'Timeline',
					selfBaseDuration: 4,
					source: {fileName: 'Timeline.tsx', lineNumber: 42},
					tag: 0,
					treeBaseDuration: 7,
				},
				{
					actualDuration: 3,
					actualStartTime: 1,
					depth: 2,
					name: 'TimelineItem',
					selfBaseDuration: 3,
					tag: 0,
					treeBaseDuration: 3,
				},
				{
					actualDuration: 2,
					actualStartTime: 1,
					depth: 1,
					name: 'Controls',
					selfBaseDuration: 2,
					tag: 0,
					treeBaseDuration: 2,
				},
			],
		}),
		makeStoredEvent({
			kind: 'commit',
			priorityName: 'Normal',
			timestamp: 21,
			tree: [
				{
					actualDuration: 2,
					actualStartTime: 20,
					depth: 0,
					name: 'Root',
					selfBaseDuration: 1,
					tag: 0,
					treeBaseDuration: 10,
				},
				{
					actualDuration: 7,
					actualStartTime: 1,
					changeDescription: {
						context: true,
						hooks: [0],
						isFirstMount: false,
						parent: true,
						props: ['items'],
						state: false,
					},
					depth: 1,
					fiberId: 1,
					name: 'Timeline',
					selfBaseDuration: 4,
					source: {fileName: 'Timeline.tsx', lineNumber: 42},
					tag: 0,
					treeBaseDuration: 7,
				},
				{
					actualDuration: 1,
					actualStartTime: 20,
					depth: 2,
					name: 'FreshLeaf',
					selfBaseDuration: 1,
					tag: 0,
					treeBaseDuration: 1,
				},
				{
					actualDuration: 1,
					actualStartTime: 20,
					depth: 1,
					name: 'Controls',
					selfBaseDuration: 1,
					tag: 0,
					treeBaseDuration: 1,
				},
			],
		}),
	]);

	expect(summary.commitCount).toBe(2);
	expect(summary.maxCommitDurationMs).toBe(10);
	expect(summary.profilingHooksStatuses).toEqual([
		{
			available: true,
			bundleType: 1,
			count: 1,
			reactVersion: '19.2.3',
			reason: null,
		},
	]);
	expect(summary.topComponents[0]).toMatchObject({
		changedHooks: {'0': 1},
		changedProps: {items: 1},
		name: 'Timeline',
		parentRenderCount: 1,
		renderCount: 1,
		totalInclusiveDurationMs: 7,
		totalSelfDurationMs: 4,
	});
	expect(summary.slowestCommits).toEqual([
		{
			durationMs: 10,
			priorityName: 'UserBlocking',
			renderedFiberCount: 4,
			timestamp: 2,
		},
		{
			durationMs: 2,
			priorityName: 'Normal',
			renderedFiberCount: 3,
			timestamp: 21,
		},
	]);
	expect(summary.topComponents).toContainEqual(
		expect.objectContaining({
			name: 'Timeline',
			renderCount: 1,
			totalInclusiveDurationMs: 7,
		}),
	);
});
