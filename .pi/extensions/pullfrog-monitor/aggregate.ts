import {createHash} from 'node:crypto';
import type {PullfrogInlineComment, PullfrogSnapshot} from './types';

export const isProgressComment = (body: string) => {
	const normalized = body.toLowerCase();
	return (
		(normalized.includes('progress%20indicator.gif') ||
			normalized.includes('uploads.pullfrog.com/progress')) &&
		(normalized.includes('- [ ]') || normalized.includes('checkout pr'))
	);
};

export const isNoIssueSummary = (body: string) => {
	const normalized = body.toLowerCase();
	return (
		normalized.includes('no new issues found') ||
		normalized.includes('no issues found') ||
		normalized.includes('no actionable issues')
	);
};

export const hasSubstantiveFeedback = (snapshot: PullfrogSnapshot) => {
	if (snapshot.workflowRunPending) {
		return false;
	}
	if (snapshot.workflowRun && snapshot.workflowRun.status !== 'completed') {
		return false;
	}
	if (!snapshot.reviewSubmittedForHead) {
		return false;
	}
	if (
		snapshot.inlineCommentsAndReplies.some(
			(comment) => !comment.inReplyToId && comment.body.trim().length > 0,
		)
	) {
		return true;
	}
	if (snapshot.issueComments.length > 0) {
		return true;
	}
	return snapshot.reviews.some(
		(review) => review.body.trim().length > 0 && !isNoIssueSummary(review.body),
	);
};

const canonical = (snapshot: PullfrogSnapshot) => ({
	repository: snapshot.repository,
	prNumber: snapshot.prNumber,
	prUrl: snapshot.prUrl,
	title: snapshot.title,
	state: snapshot.state,
	headSha: snapshot.headSha,
	reviewSubmittedForHead: snapshot.reviewSubmittedForHead,
	workflowRun: snapshot.workflowRun,
	workflowRunPending: snapshot.workflowRunPending,
	reviews: [...snapshot.reviews].sort((a, b) => a.id.localeCompare(b.id)),
	issueComments: [...snapshot.issueComments].sort((a, b) =>
		a.id.localeCompare(b.id),
	),
	inlineCommentsAndReplies: [...snapshot.inlineCommentsAndReplies].sort(
		(a, b) => a.id - b.id,
	),
	commits: [...snapshot.commits].sort((a, b) => a.sha.localeCompare(b.sha)),
});

export const fingerprintSnapshot = (snapshot: PullfrogSnapshot) =>
	createHash('sha256')
		.update(JSON.stringify(canonical(snapshot)))
		.digest('hex');

const formatInline = (comment: PullfrogInlineComment) => {
	const location = comment.path
		? `\nLocation: ${comment.path}${comment.line ? `:${comment.line}` : ''}`
		: '';
	const relation = comment.inReplyToId
		? `\nReply to inline-comment:${comment.inReplyToId}`
		: '';
	return [
		`### inline-comment:${comment.id}`,
		`Author: ${comment.authorLogin || 'unknown'}`,
		`URL: ${comment.url}${location}${relation}`,
		'',
		comment.body.trim() || '(empty body)',
	].join('\n');
};

export const formatSnapshotFeedback = (snapshot: PullfrogSnapshot) =>
	[
		...snapshot.reviews.map((review) =>
			[
				`### review:${review.id}`,
				`Author: ${review.authorLogin}`,
				`URL: ${review.url}`,
				`Reviewed commit: ${review.commitSha ?? 'unknown'}`,
				'',
				review.body.trim() || '(empty body)',
			].join('\n'),
		),
		...snapshot.issueComments.map((comment) =>
			[
				`### issue-comment:${comment.id}`,
				`Author: ${comment.authorLogin}`,
				`URL: ${comment.url}`,
				'',
				comment.body.trim() || '(empty body)',
			].join('\n'),
		),
		...snapshot.inlineCommentsAndReplies.map(formatInline),
	].join('\n\n---\n\n');

export const getSourceIds = (snapshot: PullfrogSnapshot) =>
	new Set([
		...snapshot.reviews.map((review) => `review:${review.id}`),
		...snapshot.issueComments.map((comment) => `issue-comment:${comment.id}`),
		...snapshot.inlineCommentsAndReplies.map(
			(comment) => `inline-comment:${comment.id}`,
		),
	]);
