export type Submission = {
	id: string;
	createdAt: string;
	title: string;
	slug: string;
	muxPlaybackId: string;
	prompt: string;
	githubUsername: string | null;
	xUsername: string | null;
	customAvatarUrl: string | null;
	likeCount: number;
	toolUsed?: string | null;
	modelUsed?: string | null;
};
