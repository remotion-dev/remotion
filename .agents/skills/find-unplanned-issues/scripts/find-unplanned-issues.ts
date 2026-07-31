#!/usr/bin/env bun

type IssueReference = {
	readonly number: number;
	readonly state: string;
	readonly title: string;
	readonly url: string;
};

type Issue = IssueReference & {
	readonly parent: IssueReference | null;
};

type Finding = {
	readonly number: number;
	readonly parentChain: readonly IssueReference[];
	readonly reason: 'no parent' | 'no masterplan ancestor';
	readonly title: string;
	readonly url: string;
};

type Options = {
	readonly check: boolean;
	readonly json: boolean;
	readonly limit: number;
	readonly repo: string | null;
};

const decoder = new TextDecoder();
const exemptIssueUrls = new Set([
	// This long-running CI flake tracker intentionally stands on its own.
	'https://github.com/remotion-dev/remotion/issues/8375',
]);

const usage = `Find open issues that are not connected to a masterplan.

Usage:
  bun find-unplanned-issues.ts [options]

Options:
  --repo OWNER/REPO  Inspect another GitHub repository
  --limit NUMBER     Maximum open issues to inspect (default: 10000)
  --json             Print findings as JSON
  --check            Exit 1 when findings exist
  --help             Show this help`;

const fail = (message: string): never => {
	console.error(message);
	process.exit(2);
};

const readValue = (
	args: readonly string[],
	index: number,
	flag: string,
): string => {
	const value = args[index + 1];
	if (!value || value.startsWith('--')) {
		fail(`${flag} requires a value`);
	}

	return value;
};

const parseOptions = (): Options => {
	const args = Bun.argv.slice(2);
	let check = false;
	let json = false;
	let limit = 10000;
	let repo: string | null = null;

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (arg === '--check') {
			check = true;
			continue;
		}

		if (arg === '--json') {
			json = true;
			continue;
		}

		if (arg === '--help') {
			console.log(usage);
			process.exit(0);
		}

		if (arg === '--repo') {
			repo = readValue(args, index, arg);
			index++;
			continue;
		}

		if (arg === '--limit') {
			const rawLimit = readValue(args, index, arg);
			limit = Number(rawLimit);
			if (!Number.isInteger(limit) || limit < 1) {
				fail(`--limit must be a positive integer, received: ${rawLimit}`);
			}

			index++;
			continue;
		}

		fail(`Unknown option: ${arg}\n\n${usage}`);
	}

	return {check, json, limit, repo};
};

const runGhJson = <T>(args: readonly string[]): T => {
	const command = Bun.spawnSync(['gh', ...args], {
		stderr: 'pipe',
		stdout: 'pipe',
	});

	if (command.exitCode !== 0) {
		const error = decoder.decode(command.stderr).trim();
		fail(error || `gh ${args.join(' ')} failed`);
	}

	const output = decoder.decode(command.stdout);
	try {
		return JSON.parse(output) as T;
	} catch {
		fail(`gh returned invalid JSON for: gh ${args.join(' ')}`);
	}
};

const isMasterplan = (issue: IssueReference): boolean =>
	/masterplan/i.test(issue.title);

const isExempt = (issue: IssueReference): boolean =>
	exemptIssueUrls.has(issue.url);

const options = parseOptions();
const repoArgs = options.repo === null ? [] : ['--repo', options.repo];
const issues = runGhJson<Issue[]>([
	'issue',
	'list',
	...repoArgs,
	'--state',
	'open',
	'--limit',
	String(options.limit),
	'--json',
	'number,title,parent,state,url',
]);

const issuesByUrl = new Map<string, Issue>(
	issues.map((issue) => [issue.url, issue]),
);

const hydrateIssue = (reference: IssueReference): Issue => {
	const cached = issuesByUrl.get(reference.url);
	if (cached) {
		return cached;
	}

	const issue = runGhJson<Issue>([
		'issue',
		'view',
		reference.url,
		'--json',
		'number,title,parent,state,url',
	]);
	issuesByUrl.set(issue.url, issue);
	return issue;
};

const findParentChain = (issue: Issue): readonly IssueReference[] | null => {
	const chain: IssueReference[] = [];
	const seen = new Set<string>([issue.url]);
	let parent = issue.parent;

	while (parent !== null) {
		if (seen.has(parent.url)) {
			fail(`Parent cycle detected while inspecting ${issue.url}`);
		}

		seen.add(parent.url);
		chain.push(parent);
		if (isMasterplan(parent)) {
			return null;
		}

		parent = hydrateIssue(parent).parent;
	}

	return chain;
};

const findings: Finding[] = [];

for (const issue of issues) {
	if (isMasterplan(issue) || isExempt(issue)) {
		continue;
	}

	const parentChain = findParentChain(issue);
	if (parentChain === null) {
		continue;
	}

	findings.push({
		number: issue.number,
		parentChain,
		reason: issue.parent === null ? 'no parent' : 'no masterplan ancestor',
		title: issue.title,
		url: issue.url,
	});
}

findings.sort((left, right) => right.number - left.number);

if (options.json) {
	console.log(JSON.stringify(findings, null, 2));
} else if (findings.length === 0) {
	console.log('Every non-exempt open issue is connected to a masterplan.');
} else {
	console.log(
		`Found ${findings.length} open issue(s) outside every masterplan:\n`,
	);
	for (const finding of findings) {
		console.log(`#${finding.number}\t${finding.reason}\t${finding.title}`);
		console.log(`  ${finding.url}`);
		if (finding.parentChain.length > 0) {
			const chain = finding.parentChain
				.map((parent) => `#${parent.number} ${parent.title}`)
				.join(' -> ');
			console.log(`  parent chain: ${chain}`);
		}
	}
}

process.exit(options.check && findings.length > 0 ? 1 : 0);
