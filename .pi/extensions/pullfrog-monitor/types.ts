export const PULLFROG_GRAPHQL_LOGIN = 'pullfrog';
export const PULLFROG_REST_LOGIN = 'pullfrog[bot]';
export const PULLFROG_USER_ID = 226033991;
export const REVIEW_BRANCH_ENTRY = 'pullfrog-review-branch';
export const REVIEW_COMPLETED_ENTRY = 'pullfrog-review-completed';
export const STATE_VERSION = 3;

export type GraphqlActor = {login?: string} | null;
export type RestActor = {login?: string; id?: number} | null;

export type PullfrogReview = {
	id: string;
	body: string;
	authorLogin: string;
	submittedAt: string;
	commitSha: string | null;
	state: string;
	url: string;
};

export type PullfrogIssueComment = {
	id: string;
	body: string;
	authorLogin: string;
	createdAt: string;
	url: string;
};

export type PullfrogInlineComment = {
	id: number;
	body: string;
	authorLogin: string;
	authorId: number | null;
	createdAt: string;
	updatedAt: string;
	url: string;
	commitSha: string | null;
	originalCommitSha: string | null;
	path: string | null;
	line: number | null;
	originalLine: number | null;
	inReplyToId: number | null;
};

export type PullRequestCommit = {
	sha: string;
	committedAt: string;
};

export type PullfrogWorkflowRun = {
	id: number;
	url: string;
	status: string;
	conclusion: string | null;
};

export type PullfrogSnapshot = {
	repository: string;
	prNumber: number;
	prUrl: string;
	title: string;
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	headSha: string;
	reviewSubmittedForHead: boolean;
	workflowRun: PullfrogWorkflowRun | null;
	workflowRunPending: boolean;
	reviews: PullfrogReview[];
	issueComments: PullfrogIssueComment[];
	inlineCommentsAndReplies: PullfrogInlineComment[];
	commits: PullRequestCommit[];
};

export type ReviewStatus = 'watching' | 'ready' | 'reviewed';

export type PullfrogPrState = {
	repository: string;
	prNumber: number;
	prUrl: string;
	title: string;
	headSha: string;
	monitoring: boolean;
	currentFingerprint: string | null;
	reviewedFingerprint: string | null;
	status: ReviewStatus;
	detectedAt: string | null;
	reviewedAt: string | null;
	reviewStartedAt: string | null;
	activeAttemptId: string | null;
	activeAttemptPid: number | null;
	notifiedAt: string | null;
	error: string | null;
};

export type MonitorState = {
	version: typeof STATE_VERSION;
	reviews: Record<string, PullfrogPrState>;
};

export type RepositoryContext = {
	root: string;
	commonGitDir: string;
	repository: string;
};

export type ReviewBranchMetadata = {
	originId: string;
	repository: string;
	prNumber: number;
	fingerprint: string;
	attemptId: string;
};
