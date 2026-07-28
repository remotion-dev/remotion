#!/usr/bin/env bun

export {};

type IssueReference = {
	readonly number: number;
	readonly state: 'CLOSED' | 'OPEN';
	readonly title: string;
	readonly url: string;
};

type Issue = IssueReference & {
	readonly parent: IssueReference | null;
	readonly subIssues: {
		readonly nodes: readonly IssueReference[];
		readonly totalCount: number;
	};
};

type TreeNode = {
	readonly depth: number;
	readonly issue: Issue;
	readonly parent: IssueReference | null;
};

type Options = {
	readonly apply: boolean;
	readonly json: boolean;
	readonly root: string;
};

const defaultRoot = 'https://github.com/remotion-dev/remotion/issues/9081';
const concurrency = 8;

const usage = `Recursively remove closed issues from a GitHub masterplan.

Usage:
  bun prune-closed-masterplan-issues.ts [options]

Options:
  --root ISSUE_URL  Root masterplan (default: ${defaultRoot})
  --json            Print the dry-run report as JSON
  --apply           Reparent open children and remove closed issues
  --help            Show this help`;

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
	let apply = false;
	let json = false;
	let root = defaultRoot;

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (arg === '--apply') {
			apply = true;
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

		if (arg === '--root') {
			root = readValue(args, index, arg);
			index++;
			continue;
		}

		fail(`Unknown option: ${arg}\n\n${usage}`);
	}

	if (apply && json) {
		fail('--json cannot be combined with --apply');
	}

	if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/.test(root)) {
		fail(`--root must be a full GitHub issue URL, received: ${root}`);
	}

	return {apply, json, root};
};

const runGh = async (args: readonly string[]): Promise<string> => {
	const command = Bun.spawn(['gh', ...args], {
		stderr: 'pipe',
		stdout: 'pipe',
	});
	const [exitCode, stderr, stdout] = await Promise.all([
		command.exited,
		new Response(command.stderr).text(),
		new Response(command.stdout).text(),
	]);

	if (exitCode !== 0) {
		fail(stderr.trim() || `gh ${args.join(' ')} failed`);
	}

	return stdout;
};

const runGhJson = async <T>(args: readonly string[]): Promise<T> => {
	const output = await runGh(args);
	try {
		return JSON.parse(output) as T;
	} catch {
		fail(`gh returned invalid JSON for: gh ${args.join(' ')}`);
	}
};

const viewIssue = async (url: string): Promise<Issue> => {
	const issue = await runGhJson<Issue>([
		'issue',
		'view',
		url,
		'--json',
		'number,title,state,url,parent,subIssues',
	]);

	if (issue.subIssues.nodes.length !== issue.subIssues.totalCount) {
		fail(
			`GitHub returned only ${issue.subIssues.nodes.length} of ${issue.subIssues.totalCount} sub-issues for ${url}`,
		);
	}

	return issue;
};

const mapWithConcurrency = async <Input, Output>(
	items: readonly Input[],
	mapper: (item: Input) => Promise<Output>,
): Promise<Output[]> => {
	const results: Output[] = new Array(items.length);
	let nextIndex = 0;

	const worker = async (): Promise<void> => {
		while (nextIndex < items.length) {
			const index = nextIndex;
			nextIndex++;
			results[index] = await mapper(items[index]);
		}
	};

	await Promise.all(
		Array.from({length: Math.min(concurrency, items.length)}, () => worker()),
	);
	return results;
};

const discoverTree = async (rootUrl: string): Promise<TreeNode[]> => {
	const root = await viewIssue(rootUrl);
	const nodes: TreeNode[] = [{depth: 0, issue: root, parent: null}];
	const seen = new Set<string>([root.url]);
	let frontier = root.subIssues.nodes.map((issue) => ({
		depth: 1,
		parent: root as IssueReference,
		reference: issue,
	}));

	while (frontier.length > 0) {
		for (const item of frontier) {
			if (seen.has(item.reference.url)) {
				fail(`Duplicate or cyclic sub-issue detected: ${item.reference.url}`);
			}
			seen.add(item.reference.url);
		}

		const current = await mapWithConcurrency(frontier, async (item) => ({
			depth: item.depth,
			issue: await viewIssue(item.reference.url),
			parent: item.parent,
		}));
		nodes.push(...current);
		frontier = current.flatMap((node) =>
			node.issue.subIssues.nodes.map((issue) => ({
				depth: node.depth + 1,
				parent: node.issue as IssueReference,
				reference: issue,
			})),
		);
	}

	return nodes;
};

const verifyParent = async (
	issueUrl: string,
	expectedParentUrl: string | null,
): Promise<void> => {
	const issue = await viewIssue(issueUrl);
	const actualParentUrl = issue.parent?.url ?? null;
	if (actualParentUrl !== expectedParentUrl) {
		fail(
			`Expected ${issueUrl} to have parent ${expectedParentUrl ?? 'none'}, found ${actualParentUrl ?? 'none'}`,
		);
	}
};

const applyRemoval = async (node: TreeNode): Promise<void> => {
	if (node.parent === null) {
		fail(`Refusing to remove the root issue: ${node.issue.url}`);
	}

	const current = await viewIssue(node.issue.url);
	if (current.state !== 'CLOSED') {
		fail(`Issue reopened during cleanup: ${current.url}`);
	}

	if (current.parent?.url !== node.parent.url) {
		fail(
			`Parent changed during cleanup for ${current.url}: expected ${node.parent.url}, found ${current.parent?.url ?? 'none'}`,
		);
	}

	const closedChildren = current.subIssues.nodes.filter(
		(child) => child.state === 'CLOSED',
	);
	if (closedChildren.length > 0) {
		fail(
			`Closed children still remain under ${current.url}: ${closedChildren.map((child) => child.url).join(', ')}`,
		);
	}

	for (const child of current.subIssues.nodes) {
		console.log(`Reparenting open #${child.number} to #${node.parent.number}`);
		await runGh(['issue', 'edit', child.url, '--parent', node.parent.url]);
		await verifyParent(child.url, node.parent.url);
	}

	console.log(`Removing closed #${current.number} from #${node.parent.number}`);
	await runGh(['issue', 'edit', current.url, '--remove-parent']);
	await verifyParent(current.url, null);
};

const options = parseOptions();
const tree = await discoverTree(options.root);
const closedIssues = tree
	.filter((node) => node.depth > 0 && node.issue.state === 'CLOSED')
	.sort((left, right) => right.depth - left.depth);

if (options.json) {
	console.log(
		JSON.stringify(
			closedIssues.map((node) => ({
				depth: node.depth,
				number: node.issue.number,
				openChildren: node.issue.subIssues.nodes
					.filter((child) => child.state === 'OPEN')
					.map((child) => child.number),
				parent: node.parent?.number ?? null,
				title: node.issue.title,
				url: node.issue.url,
			})),
			null,
			2,
		),
	);
} else if (closedIssues.length === 0) {
	console.log(
		options.apply
			? 'Removed 0 closed issue(s) from the masterplan.'
			: `No closed descendants found under ${options.root}.`,
	);
} else if (!options.apply) {
	console.log(
		`Found ${closedIssues.length} closed descendant(s) under ${options.root}:\n`,
	);
	for (const node of closedIssues) {
		console.log(
			`#${node.issue.number}\tdepth ${node.depth}\tparent #${node.parent?.number}\t${node.issue.title}`,
		);
		console.log(`  ${node.issue.url}`);
		const openChildren = node.issue.subIssues.nodes.filter(
			(child) => child.state === 'OPEN',
		);
		if (openChildren.length > 0) {
			console.log(
				`  would reparent open children: ${openChildren.map((child) => `#${child.number}`).join(', ')}`,
			);
		}
	}
	console.log('\nDry run only. Pass --apply to update GitHub.');
} else {
	for (const node of closedIssues) {
		await applyRemoval(node);
	}
	console.log(
		`Removed ${closedIssues.length} closed issue(s) from the masterplan.`,
	);
}
