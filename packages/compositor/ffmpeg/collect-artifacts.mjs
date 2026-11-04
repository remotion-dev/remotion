#!/usr/bin/env node

import {execFileSync} from 'node:child_process';
import {
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';

const githubRepo = 'remotion-dev/remotion';
const circleProject = 'gh/remotion-dev/remotion';
const githubArchives = ['aarch64-apple-darwin.gz', 'x86_64-apple-darwin.gz'];
const circleJobs = new Map([
	['build-linux-arm-gnu', 'aarch64-unknown-linux-gnu.gz'],
	['build-linux-arm-musl', 'aarch64-unknown-linux-musl.gz'],
	['build-linux-x64-gnu', 'x86_64-unknown-linux-gnu.gz'],
	['build-linux-x64-musl', 'x86_64-unknown-linux-musl.gz'],
	['build-windows', 'x86_64-pc-windows-gnu.gz'],
]);
const allArchives = [...githubArchives, ...circleJobs.values()].sort();

const run = (command, args, options = {}) =>
	execFileSync(command, args, {
		cwd: options.cwd ?? process.cwd(),
		encoding: 'utf8',
		maxBuffer: 20 * 1024 * 1024,
		stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
	});

const parseArgs = () => {
	const result = {sha: null, output: null, checkOnly: false};
	for (let index = 2; index < process.argv.length; index++) {
		const argument = process.argv[index];
		if (argument === '--check-only') {
			result.checkOnly = true;
			continue;
		}
		if (argument === '--sha' || argument === '--output') {
			const value = process.argv[index + 1];
			if (!value) {
				throw new Error(`Missing value for ${argument}`);
			}
			result[argument.slice(2)] = value;
			index++;
			continue;
		}
		if (argument.startsWith('--sha=')) {
			result.sha = argument.slice('--sha='.length);
			continue;
		}
		if (argument.startsWith('--output=')) {
			result.output = argument.slice('--output='.length);
			continue;
		}
		throw new Error(`Unknown argument: ${argument}`);
	}
	return result;
};

const circleHeaders = () => {
	const headers = {'user-agent': 'remotion-ffmpeg-artifact-downloader'};
	if (process.env.CIRCLE_TOKEN) {
		headers['Circle-Token'] = process.env.CIRCLE_TOKEN;
	}
	return headers;
};

const fetchJson = async (url) => {
	const response = await fetch(url, {headers: circleHeaders()});
	if (!response.ok) {
		throw new Error(`Request failed (${response.status}) for ${url}`);
	}
	return response.json();
};

const fetchCirclePages = async (initialUrl, maxPages = 50) => {
	const items = [];
	let url = initialUrl;
	for (let page = 0; page < maxPages && url; page++) {
		const payload = await fetchJson(url);
		items.push(...(payload.items ?? []));
		url = payload.next_page_token
			? `${initialUrl}${initialUrl.includes('?') ? '&' : '?'}page-token=${encodeURIComponent(payload.next_page_token)}`
			: null;
	}
	return items;
};

const findFiles = (directory) => {
	const files = [];
	for (const entry of readdirSync(directory, {withFileTypes: true})) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...findFiles(path));
		} else if (entry.isFile()) {
			files.push(path);
		}
	}
	return files;
};

const selectGithubRun = (sha) => {
	const runs = JSON.parse(
		run('gh', [
			'run',
			'list',
			'--repo',
			githubRepo,
			'--commit',
			sha,
			'--limit',
			'100',
			'--json',
			'databaseId,headSha,status,conclusion,event,workflowName,createdAt,url',
		]),
	);
	const exactRuns = runs.filter(
		(item) => item.headSha === sha && item.workflowName === 'Build FFmpeg',
	);
	const successful = exactRuns
		.filter(
			(item) => item.status === 'completed' && item.conclusion === 'success',
		)
		.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
	if (successful.length === 0) {
		const statuses = exactRuns
			.map(
				(item) => `${item.url}: ${item.status}/${item.conclusion || 'pending'}`,
			)
			.join('\n');
		throw new Error(
			`No successful GitHub Actions run exists for ${sha}.${statuses ? `\n${statuses}` : ''}`,
		);
	}
	return successful[0];
};

const selectCircleWorkflow = async (sha) => {
	const pipelines = await fetchCirclePages(
		`https://circleci.com/api/v2/project/${circleProject}/pipeline`,
	);
	const exactPipelines = pipelines
		.filter((item) => item.vcs?.revision === sha)
		.sort((left, right) => right.created_at.localeCompare(left.created_at));
	const statuses = [];
	for (const pipeline of exactPipelines) {
		const workflows = await fetchCirclePages(
			`https://circleci.com/api/v2/pipeline/${pipeline.id}/workflow`,
		);
		for (const workflow of workflows.filter(
			(item) => item.name === 'build_ffmpeg',
		)) {
			statuses.push(`${pipeline.id}/${workflow.id}: ${workflow.status}`);
			if (workflow.status === 'success') {
				return {pipeline, workflow};
			}
		}
	}
	throw new Error(
		`No successful CircleCI build_ffmpeg workflow exists for ${sha}.${statuses.length ? `\n${statuses.join('\n')}` : ''}`,
	);
};

const verifyArchive = (path, archive) => {
	if (statSync(path).size < 1_000_000) {
		throw new Error(`${archive} is unexpectedly small`);
	}
	run('tar', ['-tzf', path, 'bindings.rs']);
	run('tar', [
		'-tzf',
		path,
		archive === 'x86_64-pc-windows-gnu.gz'
			? 'remotion/bin/ffmpeg.exe'
			: 'remotion/bin/ffmpeg',
	]);
};

const sha256 = (path) =>
	run('shasum', ['-a', '256', path]).trim().split(/\s+/)[0];

const main = async () => {
	const args = parseArgs();
	const root = run('git', ['rev-parse', '--show-toplevel']).trim();
	const origin = run('git', ['remote', 'get-url', 'origin']).trim();
	if (!origin.includes('remotion-dev/remotion')) {
		throw new Error(`Unexpected origin remote: ${origin}`);
	}
	const requestedSha = args.sha ?? 'HEAD';
	const sha = run('git', ['rev-parse', `${requestedSha}^{commit}`], {
		cwd: root,
	}).trim();
	if (!/^[0-9a-f]{40}$/.test(sha)) {
		throw new Error(`Could not resolve a full commit SHA from ${requestedSha}`);
	}

	const githubRun = selectGithubRun(sha);
	const githubArtifactPayload = JSON.parse(
		run('gh', [
			'api',
			`repos/${githubRepo}/actions/runs/${githubRun.databaseId}/artifacts`,
		]),
	);
	const githubArtifacts = githubArchives.map((name) => {
		const artifact = githubArtifactPayload.artifacts.find(
			(item) => item.name === name,
		);
		if (!artifact || artifact.expired) {
			throw new Error(
				`GitHub Actions artifact ${name} is ${artifact ? 'expired' : 'missing'}`,
			);
		}
		return artifact;
	});

	const {pipeline, workflow} = await selectCircleWorkflow(sha);
	const circleJobItems = await fetchCirclePages(
		`https://circleci.com/api/v2/workflow/${workflow.id}/job`,
	);
	const selectedCircleJobs = [...circleJobs.entries()].map(
		([jobName, archive]) => {
			const job = circleJobItems.find((item) => item.name === jobName);
			if (!job || job.status !== 'success') {
				throw new Error(
					`CircleCI job ${jobName} is ${job?.status ?? 'missing'}; refusing partial artifacts`,
				);
			}
			return {job, archive};
		},
	);

	const defaultOutput = join(tmpdir(), 'remotion-ffmpeg-artifacts', sha);
	const output = resolve(args.output ?? defaultOutput);
	const plan = {
		sourceSha: sha,
		output,
		githubActions: {
			runId: githubRun.databaseId,
			url: githubRun.url,
			artifacts: githubArtifacts.map((item) => item.name),
		},
		circleCI: {
			pipelineId: pipeline.id,
			pipelineNumber: pipeline.number,
			workflowId: workflow.id,
			artifacts: selectedCircleJobs.map((item) => item.archive),
		},
	};
	if (args.checkOnly) {
		process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
		return;
	}
	if (existsSync(output)) {
		throw new Error(`Output already exists: ${output}`);
	}

	const stagingRoot = mkdtempSync(join(tmpdir(), 'ffmpeg-artifacts-'));
	const bundle = join(stagingRoot, 'bundle');
	mkdirSync(bundle);
	try {
		for (const artifact of githubArtifacts) {
			const downloadDirectory = join(stagingRoot, `github-${artifact.id}`);
			mkdirSync(downloadDirectory);
			run('gh', [
				'run',
				'download',
				String(githubRun.databaseId),
				'--repo',
				githubRepo,
				'--name',
				artifact.name,
				'--dir',
				downloadDirectory,
			]);
			const downloaded = findFiles(downloadDirectory);
			if (downloaded.length !== 1) {
				throw new Error(
					`Expected one file inside GitHub artifact ${artifact.name}, found ${downloaded.length}`,
				);
			}
			copyFileSync(downloaded[0], join(bundle, artifact.name));
		}

		for (const {job, archive} of selectedCircleJobs) {
			const artifacts = await fetchCirclePages(
				`https://circleci.com/api/v2/project/${circleProject}/${job.job_number}/artifacts`,
			);
			const artifact = artifacts.find((item) => item.path === archive);
			if (!artifact) {
				throw new Error(`CircleCI job ${job.name} does not contain ${archive}`);
			}
			const response = await fetch(artifact.url, {headers: circleHeaders()});
			if (!response.ok) {
				throw new Error(
					`Downloading ${archive} failed with HTTP ${response.status}`,
				);
			}
			writeFileSync(
				join(bundle, archive),
				Buffer.from(await response.arrayBuffer()),
			);
		}

		const manifestArchives = {};
		for (const archive of allArchives) {
			const path = join(bundle, archive);
			if (!existsSync(path)) {
				throw new Error(`Missing downloaded archive: ${archive}`);
			}
			verifyArchive(path, archive);
			manifestArchives[archive] = {
				bytes: statSync(path).size,
				sha256: sha256(path),
			};
		}
		writeFileSync(
			join(bundle, 'SHA256SUMS'),
			`${allArchives
				.map((archive) => `${manifestArchives[archive].sha256}  ${archive}`)
				.join('\n')}\n`,
		);
		writeFileSync(
			join(bundle, 'MANIFEST.json'),
			`${JSON.stringify({...plan, archives: manifestArchives}, null, 2)}\n`,
		);
		mkdirSync(dirname(output), {recursive: true});
		try {
			renameSync(bundle, output);
		} catch (error) {
			if (error.code !== 'EXDEV') {
				throw error;
			}
			cpSync(bundle, output, {recursive: true, errorOnExist: true});
		}
	} finally {
		rmSync(stagingRoot, {recursive: true, force: true});
	}

	process.stdout.write(
		`${JSON.stringify({...plan, verified: true}, null, 2)}\n`,
	);
};

main().catch((error) => {
	process.stderr.write(`${error.stack ?? error.message}\n`);
	process.exitCode = 1;
});
