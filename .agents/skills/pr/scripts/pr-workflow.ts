#!/usr/bin/env bun

import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {relative, resolve, sep} from 'node:path';
import {performance} from 'node:perf_hooks';

const root = resolve(import.meta.dir, '../../../..');
const started = performance.now();
const phase = process.argv[2];
const files: string[] = [];
const format: string[] = [];
let title: string | null = null;
let bodyFile: string | null = null;
let reviewed: string | null = null;

const usage = () => {
	console.log(`Usage:
  bun .agents/skills/pr/scripts/pr-workflow.ts prepare --file <path>... [--format <path>...]
  bun .agents/skills/pr/scripts/pr-workflow.ts publish --file <path>... --reviewed <sha256> --title <title> --body-file <path>

Pass every changed repository file with --file. Pass only Oxfmt-supported files with --format.
Review the full diff after prepare, then pass its REVIEWED_DIFF value to publish.`);
};

const fail = (message: string): never => {
	throw new Error(message);
};

const repositoryPath = (value: string) => {
	const absolute = resolve(root, value);
	const path = relative(root, absolute);
	if (!path || path === '..' || path.startsWith(`..${sep}`)) {
		fail(`Expected a file path inside the repository: ${value}`);
	}

	return path;
};

const command = (label: string, executable: string, args: string[]) => {
	const before = performance.now();
	const result = spawnSync(executable, args, {cwd: root, stdio: 'inherit'});
	console.log(
		`[pr] ${label}: ${((performance.now() - before) / 1000).toFixed(2)}s`,
	);
	if (result.error) {
		fail(`${label}: ${result.error.message}`);
	}

	if (result.status !== 0) {
		fail(`${label} exited with ${result.signal ?? `status ${result.status}`}`);
	}
};

const capture = (executable: string, args: string[]) => {
	const result = spawnSync(executable, args, {
		cwd: root,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
		maxBuffer: 64 * 1024 * 1024,
	});
	if (result.error) {
		fail(`${executable}: ${result.error.message}`);
	}

	return result;
};

const git = (args: string[]) => {
	const result = capture('git', ['-c', 'core.fsmonitor=false', ...args]);
	if (result.status !== 0) {
		fail(`git ${args[0]}: ${result.stderr.trim()}`);
	}

	return result.stdout;
};

const changedFiles = () => {
	const tracked = git(['diff', 'HEAD', '--name-only', '-z']).split('\0');
	const untracked = git([
		'ls-files',
		'--others',
		'--exclude-standard',
		'-z',
	]).split('\0');
	return [...new Set([...tracked, ...untracked].filter(Boolean))].sort();
};

const assertFiles = () => {
	const actual = changedFiles();
	const expected = [...new Set(files)].sort();
	if (actual.join('\0') !== expected.join('\0')) {
		fail(
			`Changed files differ from --file arguments.\nExpected: ${expected.join(', ') || '(none)'}\nActual: ${actual.join(', ') || '(none)'}`,
		);
	}
};

const reviewDigest = () => {
	const hash = createHash('sha256');
	hash.update(git(['rev-parse', 'HEAD']));
	hash.update(git(['symbolic-ref', '--short', 'HEAD']));
	hash.update(git(['diff', 'HEAD', '--binary', '--no-ext-diff']));
	for (const file of files.sort()) {
		hash.update(file);
		const path = resolve(root, file);
		if (existsSync(path)) {
			hash.update(readFileSync(path));
		} else {
			hash.update('<deleted>');
		}
	}

	return hash.digest('hex');
};

try {
	if (phase === '--help' || phase === undefined) {
		usage();
		process.exit(phase === '--help' ? 0 : 1);
	}

	if (phase !== 'prepare' && phase !== 'publish') {
		fail(`Unknown phase: ${phase}`);
	}

	for (let i = 3; i < process.argv.length; i += 2) {
		const flag = process.argv[i];
		const value = process.argv[i + 1];
		if (!value || value.startsWith('--')) {
			fail(`Missing value for ${flag}`);
		}

		switch (flag) {
			case '--file':
				files.push(repositoryPath(value));
				break;
			case '--format':
				format.push(repositoryPath(value));
				break;
			case '--title':
				title = value;
				break;
			case '--body-file':
				bodyFile = resolve(root, value);
				break;
			case '--reviewed':
				reviewed = value;
				break;
			default:
				fail(`Unknown argument: ${flag}`);
		}
	}

	if (files.length === 0 || files.length !== new Set(files).size) {
		fail('Pass each changed file exactly once with --file.');
	}

	const branch = git(['symbolic-ref', '--short', 'HEAD']).trim();
	if (branch === 'main' || branch === 'master') {
		fail('Create a feature branch before running the PR workflow.');
	}

	assertFiles();

	if (phase === 'prepare') {
		if (title !== null || bodyFile !== null || reviewed !== null) {
			fail('Title, body file, and reviewed digest belong to publish.');
		}

		if (format.some((file) => !files.includes(file))) {
			fail('Every --format path must also be passed with --file.');
		}

		if (format.length > 0) {
			command('format', 'bunx', ['oxfmt', ...format, '--write']);
		}

		assertFiles();
		command('build', 'bun', ['run', 'build']);
		command('stylecheck', 'bun', ['run', 'stylecheck']);
		git(['diff', 'HEAD', '--check']);
		assertFiles();
		console.log(`REVIEWED_DIFF=${reviewDigest()}`);
	} else {
		if (format.length > 0) {
			fail('Formatting belongs to prepare.');
		}

		if (!title || !bodyFile || !reviewed || !existsSync(bodyFile)) {
			fail(
				'Publish requires --title, an existing --body-file, and --reviewed.',
			);
		}

		if (reviewDigest() !== reviewed) {
			fail('The diff changed after prepare. Run prepare and review it again.');
		}

		const existing = capture('gh', [
			'pr',
			'view',
			'--json',
			'url',
			'--jq',
			'.url',
		]);
		if (
			existing.status !== 0 &&
			!existing.stderr.includes('no pull requests found')
		) {
			fail(`Could not check for an existing PR: ${existing.stderr.trim()}`);
		}

		command('stage', 'git', ['add', '--', ...files]);
		if (git(['diff', '--cached', '--name-only']).trim() === '') {
			fail('No staged changes to commit.');
		}

		command('commit', 'git', ['commit', '-m', title]);
		if (changedFiles().length > 0) {
			fail(
				'The commit hook left uncommitted changes. Review them before pushing.',
			);
		}

		command('push', 'git', ['push', '-u', 'origin', 'HEAD']);
		if (existing.status === 0) {
			console.log(`PR_URL=${existing.stdout.trim()}`);
		} else {
			const before = performance.now();
			const created = capture('gh', [
				'pr',
				'create',
				'--title',
				title,
				'--body-file',
				bodyFile,
			]);
			console.log(
				`[pr] create: ${((performance.now() - before) / 1000).toFixed(2)}s`,
			);
			if (created.status !== 0) {
				fail(`Could not create PR: ${created.stderr.trim()}`);
			}

			console.log(`PR_URL=${created.stdout.trim()}`);
		}
	}

	console.log(
		`[pr] total: ${((performance.now() - started) / 1000).toFixed(2)}s`,
	);
} catch (error) {
	console.error(
		`[pr] ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
}
