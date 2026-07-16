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
	reviewSubmittedForHead: false,
	workflowRun: null,
	reviews: [],
	issueComments: [],
	inlineCommentsAndReplies: [],
	commits: [],
	...overrides,
});

describe('Pullfrog snapshots', () => {
	test('recognizes inline findings and includes developer replies as context', () => {
		const value = snapshot({
			reviewSubmittedForHead: true,
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
					reviewSubmittedForHead: true,
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
					reviewSubmittedForHead: true,
					reviews: [
						{
							id: 'PRR_1',
							body: 'No new issues found.',
							authorLogin: 'pullfrog',
							submittedAt: '2026-01-01T00:00:00Z',
							commitSha: 'a'.repeat(40),
							state: 'COMMENTED',
							url: 'https://github.com/owner/repo/pull/123',
						},
					],
				}),
			),
		).toBe(false);
	});

	test('waits for the workflow and submitted review before exposing findings', () => {
		const inProgress = snapshot({
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
		const reviewSubmitted = {...inProgress, reviewSubmittedForHead: true};
		expect(
			hasSubstantiveFeedback({
				...reviewSubmitted,
				workflowRun: {
					id: 123,
					url: 'https://github.com/owner/repo/actions/runs/123',
					status: 'in_progress',
					conclusion: null,
				},
			}),
		).toBe(false);
		expect(
			hasSubstantiveFeedback({
				...reviewSubmitted,
				workflowRun: {
					id: 123,
					url: 'https://github.com/owner/repo/actions/runs/123',
					status: 'completed',
					conclusion: 'success',
				},
			}),
		).toBe(true);
	});

	test('fingerprint is order-independent and changes with the head', () => {
		const one = snapshot({
			commits: [
				{sha: 'b', committedAt: '2026-01-02T00:00:00Z'},
				{sha: 'a', committedAt: '2026-01-01T00:00:00Z'},
			],
		});
		const two = snapshot({commits: [...one.commits].reverse()});
		expect(fingerprintSnapshot(one)).toBe(fingerprintSnapshot(two));
		expect(fingerprintSnapshot({...one, headSha: 'c'.repeat(40)})).not.toBe(
			fingerprintSnapshot(one),
		);
	});
});
