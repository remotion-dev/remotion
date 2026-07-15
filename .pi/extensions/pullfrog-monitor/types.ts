export const PULLFROG_GRAPHQL_LOGIN = 'pullfrog';
export const PULLFROG_REST_LOGIN = 'pullfrog[bot]';
export const PULLFROG_USER_ID = 226033991;
export const REVIEW_BRANCH_ENTRY = 'pullfrog-review-branch';
export const STATE_VERSION = 2;

export type FindingVerdict =
	| 'agree'
	| 'disagree'
	| 'already-addressed'
	| 'uncertain';
export type FindingSeverity = 'critical' | 'important' | 'minor';
export type ReviewStatus =
	| 'watching'
	| 'waiting'
	| 'checking'
	| 'ready'
	| 'complete'
	| 'failed';

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

export type PullfrogSnapshot = {
	repository: string;
	prNumber: number;
	prUrl: string;
	title: string;
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	headSha: string;
	reviews: PullfrogReview[];
	issueComments: PullfrogIssueComment[];
	inlineCommentsAndReplies: PullfrogInlineComment[];
	commits: PullRequestCommit[];
};

export type FindingEvidence = {
	path: string;
	line: number | null;
	explanation: string;
};

export type PullfrogFindingVerdict = {
	sourceId: string;
	sourceUrl: string;
	verdict: FindingVerdict;
	severity: FindingSeverity;
	confidence: number;
	title: string;
	rationale: string;
	evidence: FindingEvidence[];
	suggestedDirection: string;
	suggestedValidation: string[];
};

export type SanityResult = {
	fingerprint: string;
	repository: string;
	prNumber: number;
	prUrl: string;
	reviewedHead: string;
	summary: string;
	findings: PullfrogFindingVerdict[];
};

export type PullfrogPrState = {
	repository: string;
	prNumber: number;
	prUrl: string;
	title: string;
	headSha: string;
	monitoring: boolean;
	currentFingerprint: string | null;
	checkedFingerprint: string | null;
	settleAfter: string | null;
	status: ReviewStatus;
	result: SanityResult | null;
	viewed: boolean;
	error: string | null;
	detectedAt: string | null;
	checkedAt: string | null;
	notifiedAt: string | null;
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
	result: SanityResult;
};
