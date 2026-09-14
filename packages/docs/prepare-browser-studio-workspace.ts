import {rmSync} from 'node:fs';
import {join} from 'node:path';
import {copyBrowserStudioRemotionPackageArtifacts} from '../browser-studio/src/dev/copy-remotion-package-artifacts';
import {getBrowserStudioWorkspaceCommit} from './get-browser-studio-workspace-commit';

const repoDir = join(import.meta.dir, '..', '..');
const workspaceRoot = join(
	import.meta.dir,
	'static',
	'__remotion_browser_studio_workspace__',
);
const commit = getBrowserStudioWorkspaceCommit();
const outputDir = join(workspaceRoot, 'commits', commit);

rmSync(workspaceRoot, {force: true, recursive: true});
const manifest = copyBrowserStudioRemotionPackageArtifacts({
	outputDir,
	repoDir,
	source: {commit, type: 'workspace'},
});

process.stdout.write(
	`Prepared ${Object.keys(manifest.files).length} Browser Studio workspace artifacts for ${commit}.\n`,
);
