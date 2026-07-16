import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {isNoIssueSummary, isProgressComment} from './aggregate';
import {
	PULLFROG_GRAPHQL_LOGIN,
	PULLFROG_REST_LOGIN,
	PULLFROG_USER_ID,
	type GraphqlActor,
	type PullfrogInlineComment,
	type PullfrogSnapshot,
	type RestActor,
} from './types';

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 50 * 1024 * 1024;

const runGh = async (args: string[], cwd: string, signal?: AbortSignal) => {
	const result = await execFileAsync('gh', args, {
		cwd,
		encoding: 'utf8',
		maxBuffer: MAX_BUFFER,
		timeout: 60_000,
		signal,
		env: {...process.env, GH_PAGER: 'cat', NO_COLOR: '1'},
	});
	return result.stdout.trim();
};

const getCurrentBranch = async (cwd: string) => {
	try {
		const result = await execFileAsync(
			'git',
			['symbolic-ref', '--quiet', '--short', 'HEAD'],
			{cwd, encoding: 'utf8'},
		);
		return result.stdout.trim() || null;
	} catch (error) {
		if ((error as {code?: number}).code === 1) {
			return null;
		}
		throw error;
	}
};

const isNoPullRequestError = (error: unknown) => {
	const processError = error as {message?: string; stderr?: string};
	const details = `${processError.message ?? ''}\n${processError.stderr ?? ''}`;
	return /no pull requests? found|no pull request found|could not resolve to a pull request/i.test(
		details,
	);
};

export const getCurrentPullRequest = async ({
	repository,
	cwd,
	signal,
}: {
	repository: string;
	cwd: string;
	signal?: AbortSignal;
}): Promise<{number: number; state: 'OPEN' | 'CLOSED' | 'MERGED'} | null> => {
	const branch = await getCurrentBranch(cwd);
	if (!branch) {
		return null;
	}
	try {
		return JSON.parse(
			await runGh(
				['pr', 'view', branch, '--repo', repository, '--json', 'number,state'],
				cwd,
				signal,
			),
		) as {number: number; state: 'OPEN' | 'CLOSED' | 'MERGED'};
	} catch (error) {
		if (isNoPullRequestError(error)) {
			return null;
		}
		throw error;
	}
};

const isPullfrogGraphqlActor = (actor: GraphqlActor) =>
	actor?.login?.toLowerCase() === PULLFROG_GRAPHQL_LOGIN;

const isPullfrogRestActor = (actor: RestActor) =>
	actor?.id === PULLFROG_USER_ID ||
	actor?.login?.toLowerCase() === PULLFROG_REST_LOGIN;

type ViewResponse = {
	number: number;
	url: string;
	title: string;
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	headRefOid: string;
	reviews: Array<{
		id: string;
		body?: string;
		author?: GraphqlActor;
		submittedAt?: string;
		state?: string;
		commit?: {oid?: string} | null;
	}>;
	comments: Array<{
		id: string;
		body?: string;
		author?: GraphqlActor;
		createdAt?: string;
		url?: string;
	}>;
	commits: Array<{
		oid: string;
		committedDate?: string;
		authoredDate?: string;
	}>;
};

type InlineResponse = {
	id: number;
	body?: string;
	html_url?: string;
	user?: RestActor;
	created_at?: string;
	updated_at?: string;
	commit_id?: string;
	original_commit_id?: string;
	path?: string;
	line?: number | null;
	original_line?: number | null;
	in_reply_to_id?: number | null;
};

const parsePages = <T>(source: string): T[] => {
	const pages = JSON.parse(source || '[]') as unknown[];
	return pages.flatMap((page) => (Array.isArray(page) ? (page as T[]) : []));
};

const fields = [
	'number',
	'url',
	'title',
	'state',
	'headRefOid',
	'reviews',
	'comments',
	'commits',
].join(',');

export const collectPullfrogSnapshot = async ({
	repository,
	cwd,
	prNumber,
	signal,
}: {
	repository: string;
	cwd: string;
	prNumber?: number;
	signal?: AbortSignal;
}): Promise<PullfrogSnapshot> => {
	const viewArgs = ['pr', 'view'];
	if (prNumber !== undefined) {
		viewArgs.push(String(prNumber), '--repo', repository);
	}
	viewArgs.push('--json', fields);
	const view = JSON.parse(await runGh(viewArgs, cwd, signal)) as ViewResponse;
	const inlineSource = await runGh(
		[
			'api',
			'--paginate',
			'--slurp',
			`repos/${repository}/pulls/${view.number}/comments`,
		],
		cwd,
		signal,
	);
	const allInline = parsePages<InlineResponse>(inlineSource);
	const pullfrogRoots = new Set(
		allInline
			.filter((comment) => isPullfrogRestActor(comment.user ?? null))
			.map((comment) => comment.id),
	);
	const inlineCommentsAndReplies: PullfrogInlineComment[] = allInline
		.filter(
			(comment) =>
				pullfrogRoots.has(comment.id) ||
				(comment.in_reply_to_id !== undefined &&
					comment.in_reply_to_id !== null &&
					pullfrogRoots.has(comment.in_reply_to_id)),
		)
		.map((comment) => ({
			id: comment.id,
			body: comment.body ?? '',
			authorLogin: comment.user?.login ?? '',
			authorId: typeof comment.user?.id === 'number' ? comment.user.id : null,
			createdAt: comment.created_at ?? new Date(0).toISOString(),
			updatedAt:
				comment.updated_at ?? comment.created_at ?? new Date(0).toISOString(),
			url: comment.html_url ?? view.url,
			commitSha: comment.commit_id ?? null,
			originalCommitSha: comment.original_commit_id ?? null,
			path: comment.path ?? null,
			line: comment.line ?? null,
			originalLine: comment.original_line ?? null,
			inReplyToId: comment.in_reply_to_id ?? null,
		}));

	const submittedPullfrogReviews = view.reviews.filter((review) =>
		isPullfrogGraphqlActor(review.author ?? null),
	);
	const reviews = submittedPullfrogReviews
		.filter((review) => !isProgressComment(review.body ?? ''))
		.map((review) => ({
			id: review.id,
			body: review.body ?? '',
			authorLogin: review.author?.login ?? '',
			submittedAt: review.submittedAt ?? new Date(0).toISOString(),
			commitSha: review.commit?.oid ?? null,
			state: review.state ?? '',
			url: view.url,
		}));
	const hasInlineFindings = inlineCommentsAndReplies.some(
		(comment) => comment.inReplyToId === null,
	);

	return {
		repository,
		prNumber: view.number,
		prUrl: view.url,
		title: view.title,
		state: view.state,
		headSha: view.headRefOid,
		reviewSubmittedForHead: submittedPullfrogReviews.some(
			(review) => review.commit?.oid === view.headRefOid,
		),
		reviews: hasInlineFindings
			? reviews
			: reviews.filter((review) => !isNoIssueSummary(review.body)),
		issueComments: view.comments
			.filter((comment) => isPullfrogGraphqlActor(comment.author ?? null))
			.filter(
				(comment) =>
					!isProgressComment(comment.body ?? '') &&
					!isNoIssueSummary(comment.body ?? '') &&
					(comment.body ?? '').trim().length > 0,
			)
			.map((comment) => ({
				id: comment.id,
				body: comment.body ?? '',
				authorLogin: comment.author?.login ?? '',
				createdAt: comment.createdAt ?? new Date(0).toISOString(),
				url: comment.url ?? view.url,
			})),
		inlineCommentsAndReplies,
		commits: view.commits.map((commit) => ({
			sha: commit.oid,
			committedAt:
				commit.committedDate ??
				commit.authoredDate ??
				new Date(0).toISOString(),
		})),
	};
};
