export type GitSource = {
	type: 'github';
	org: string;
	name: string;
	ref: string;
	relativeFromGitRoot: string;
};
