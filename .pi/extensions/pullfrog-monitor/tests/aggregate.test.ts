import {describe, expect, test} from 'bun:test';
import {
	fingerprintSnapshot,
	formatSnapshotFeedback,
	hasSubstantiveFeedback,
	isProgressComment,
} from '../aggregate';
import type {PullfrogSnapshot} from '../types';

const snapshot = (
	overrides: Partial<PullfrogSnapshot> = {},
): PullfrogSnapshot => ({
	repository: 'owner/repo',
	prNumber: 123,
	prUrl: 'https://github.com/owner/repo/pull/123',
	title: 'Test PR',
	state: 'OPEN',
	headSha: 'a'.repeat(40),
	workflowRun: {
		id: 123,
		url: 'https://github.com/owner/repo/actions/runs/123',
		status: 'completed',
		conclusion: 'success',
		createdAt: '2026-01-01T00:00:00Z',
		updatedAt: '2026-01-01T00:05:00Z',
	},
	workflowRunPending: false,
	reviews: [],
	issueComments: [],
	inlineCommentsAndReplies: [],
	...overrides,
});

describe('Pullfrog snapshots', () => {
	test('recognizes inline findings and includes developer replies as context', () => {
		const value = snapshot({
			inlineCommentsAndReplies: [
				{
					id: 1,
					body: 'This fails for null values.',
					authorLogin: 'pullfrog[bot]',
					authorId: 226033991,
					createdAt: '2026-01-01T00:00:00Z',
					updatedAt: '2026-01-01T00:00:00Z',
					url: 'https://github.com/owner/repo/pull/123#discussion_r1',
					commitSha: 'a'.repeat(40),
					originalCommitSha: 'a'.repeat(40),
					path: 'src/example.ts',
					line: 12,
					originalLine: 12,
					inReplyToId: null,
				},
				{
					id: 2,
					body: 'Fixed in the next commit.',
					authorLogin: 'developer',
					authorId: 42,
					createdAt: '2026-01-01T00:01:00Z',
					updatedAt: '2026-01-01T00:01:00Z',
					url: 'https://github.com/owner/repo/pull/123#discussion_r2',
					commitSha: 'b'.repeat(40),
					originalCommitSha: 'a'.repeat(40),
					path: 'src/example.ts',
					line: 12,
					originalLine: 12,
					inReplyToId: 1,
				},
			],
		});
		expect(hasSubstantiveFeedback(value)).toBe(true);
		const formatted = formatSnapshotFeedback(value);
		expect(formatted).toContain('### inline-comment:1');
		expect(formatted).toContain('Reply to inline-comment:1');
		expect(formatted).toContain('Fixed in the next commit.');
	});

	test('detects issue-comment-only feedback', () => {
		expect(
			hasSubstantiveFeedback(
				snapshot({
					issueComments: [
						{
							id: 'IC_1',
							body: 'Two issues should be addressed.',
							authorLogin: 'pullfrog',
							createdAt: '2026-01-01T00:00:00Z',
							url: 'https://github.com/owner/repo/pull/123#issuecomment-1',
						},
					],
				}),
			),
		).toBe(true);
	});

	test('ignores progress and no-issue-only reviews', () => {
		expect(
			isProgressComment(
				'- [ ] <img src="https://uploads.pullfrog.com/Progress%20Indicator.gif" /> Checkout PR',
			),
		).toBe(true);
		expect(
			hasSubstantiveFeedback(
				snapshot({
					reviews: [
						{
							id: 'PRR_1',
							body: 'No new issues found.',
							authorLogin: 'pullfrog',
							submittedAt: '2026-01-01T00:00:00Z',
							state: 'COMMENTED',
							url: 'https://github.com/owner/repo/pull/123',
						},
					],
				}),
			),
		).toBe(false);
	});

	test('waits for the workflow to complete before exposing findings', () => {
		const inProgress = snapshot({
			workflowRun: null,
			inlineCommentsAndReplies: [
				{
					id: 1,
					body: 'Potential issue discovered while reviewing.',
					authorLogin: 'pullfrog[bot]',
					authorId: 226033991,
					createdAt: '2026-01-01T00:00:00Z',
					updatedAt: '2026-01-01T00:00:00Z',
					url: 'https://github.com/owner/repo/pull/123#discussion_r1',
					commitSha: 'a'.repeat(40),
					originalCommitSha: 'a'.repeat(40),
					path: 'src/example.ts',
					line: 12,
					originalLine: 12,
					inReplyToId: null,
				},
			],
		});
		expect(hasSubstantiveFeedback(inProgress)).toBe(false);
		expect(
			hasSubstantiveFeedback({
				...inProgress,
				workflowRunPending: true,
			}),
		).toBe(false);
		expect(
			hasSubstantiveFeedback({
				...inProgress,
				workflowRun: {
					id: 123,
					url: 'https://github.com/owner/repo/actions/runs/123',
					status: 'in_progress',
					conclusion: null,
					createdAt: '2026-01-01T00:00:00Z',
					updatedAt: '2026-01-01T00:01:00Z',
				},
			}),
		).toBe(false);
		expect(
			hasSubstantiveFeedback({
				...inProgress,
				workflowRun: {
					id: 123,
					url: 'https://github.com/owner/repo/actions/runs/123',
					status: 'completed',
					conclusion: 'success',
					createdAt: '2026-01-01T00:00:00Z',
					updatedAt: '2026-01-01T00:05:00Z',
				},
			}),
		).toBe(true);
	});

	test('fingerprint follows the workflow feedback rather than the PR head', () => {
		const one = snapshot();
		expect(fingerprintSnapshot({...one, headSha: 'c'.repeat(40)})).toBe(
			fingerprintSnapshot(one),
		);
		expect(
			fingerprintSnapshot({
				...one,
				workflowRun: one.workflowRun
					? {...one.workflowRun, id: one.workflowRun.id + 1}
					: null,
			}),
		).not.toBe(fingerprintSnapshot(one));
	});
});
