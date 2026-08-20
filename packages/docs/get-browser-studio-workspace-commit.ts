import {execFileSync} from 'node:child_process';

export const getBrowserStudioWorkspaceCommit = () => {
	let commit = process.env.REMOTION_BROWSER_STUDIO_WORKSPACE_COMMIT;
	if (!commit) {
		try {
			commit = execFileSync('git', ['rev-parse', 'HEAD'], {
				encoding: 'utf-8',
			}).trim();
		} catch {
			commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
		}
	}

	if (!commit || !/^[a-f0-9]{40}$/.test(commit)) {
		throw new Error(`Invalid Browser Studio workspace commit: ${commit}`);
	}

	return commit;
};
