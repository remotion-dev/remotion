import {appendFileSync, readFileSync} from 'node:fs';

export const CI_PLAN_SCHEMA_VERSION = 1;

export type BuildMatrix = {
	include: Array<{
		os: 'ubuntu-latest' | 'windows-latest' | 'macos-latest';
		node_version: 16 | 25;
		run_build: boolean;
	}>;
};

export const FULL_BUILD_MATRIX: BuildMatrix = {
	include: [
		{os: 'ubuntu-latest', node_version: 16, run_build: true},
		{os: 'windows-latest', node_version: 16, run_build: true},
		{os: 'macos-latest', node_version: 25, run_build: true},
	],
};

export const MINIMAL_BUILD_MATRIX: BuildMatrix = {
	include: [{os: 'ubuntu-latest', node_version: 16, run_build: true}],
};

const TASKS_BY_SUITE = {
	lambda: ['testlambda'],
	nextjs: ['testnextjs'],
	browser: ['testwebcodecs', 'teste2e'],
	webrenderer: ['testwebrenderer', 'testbrowserstudio'],
	ssr: ['testssr'],
	templates: ['testtemplates'],
	build: ['make', 'test'],
	bundle_example: ['bundle-testbed'],
} as const;

const BOOLEAN_PLAN_KEYS = [
	'full_ci',
	'lambda',
	'nextjs',
	'browser',
	'webrenderer',
	'ssr',
	'templates',
	'build',
	'bundle_example',
] as const;

export type CiPlan = {
	schema_version: 1;
	full_ci: boolean;
	lambda: boolean;
	nextjs: boolean;
	browser: boolean;
	webrenderer: boolean;
	ssr: boolean;
	templates: boolean;
	build: boolean;
	bundle_example: boolean;
	build_matrix: BuildMatrix;
	fallback_reason: string | null;
	affected_reasons: string[];
};

type PlannerInput = {
	full_ci: boolean;
	affected_json: string | null;
	detector_error: string | null;
};

type AffectedTask = {
	name: string;
	fullName: string;
	package: {name: string};
	reason: {__typename: string};
};

const fullPlan = (
	fallbackReason: string | null,
	affectedReasons: string[],
): CiPlan => ({
	schema_version: CI_PLAN_SCHEMA_VERSION,
	full_ci: true,
	lambda: true,
	nextjs: true,
	browser: true,
	webrenderer: true,
	ssr: true,
	templates: true,
	build: true,
	bundle_example: true,
	build_matrix: FULL_BUILD_MATRIX,
	fallback_reason: fallbackReason,
	affected_reasons: affectedReasons,
});

const readAffectedTasks = (affectedJson: string): AffectedTask[] => {
	const parsed = JSON.parse(affectedJson) as {
		data?: {affectedTasks?: {items?: unknown}};
	};
	const items = parsed.data?.affectedTasks?.items;
	if (!Array.isArray(items)) {
		throw new Error('Turborepo output has no affected task list');
	}

	for (const item of items) {
		const task = item as Partial<AffectedTask>;
		if (
			typeof task.name !== 'string' ||
			typeof task.fullName !== 'string' ||
			typeof task.package?.name !== 'string' ||
			typeof task.reason?.__typename !== 'string'
		) {
			throw new Error('Turborepo output contains an invalid affected task');
		}
	}

	return items as AffectedTask[];
};

export const validateCiPlan = (value: unknown): CiPlan => {
	if (!value || typeof value !== 'object') {
		throw new Error('CI plan must be an object');
	}

	const plan = value as CiPlan;
	if (plan.schema_version !== CI_PLAN_SCHEMA_VERSION) {
		throw new Error(`Unsupported CI plan schema: ${plan.schema_version}`);
	}
	for (const key of BOOLEAN_PLAN_KEYS) {
		if (typeof plan[key] !== 'boolean') {
			throw new Error(`CI plan value ${key} must be a boolean`);
		}
	}
	if (
		plan.fallback_reason !== null &&
		typeof plan.fallback_reason !== 'string'
	) {
		throw new Error('CI plan fallback_reason must be a string or null');
	}
	if (
		!Array.isArray(plan.affected_reasons) ||
		plan.affected_reasons.some((reason) => typeof reason !== 'string')
	) {
		throw new Error('CI plan affected_reasons must be a string array');
	}

	const matrix = plan.build_matrix;
	if (
		!matrix ||
		!Array.isArray(matrix.include) ||
		matrix.include.length === 0
	) {
		throw new Error('CI plan build_matrix must contain entries');
	}
	for (const entry of matrix.include) {
		if (
			!['ubuntu-latest', 'windows-latest', 'macos-latest'].includes(entry.os) ||
			![16, 25].includes(entry.node_version) ||
			typeof entry.run_build !== 'boolean'
		) {
			throw new Error('CI plan contains an invalid build matrix entry');
		}
	}

	if (plan.full_ci) {
		if (BOOLEAN_PLAN_KEYS.slice(1).some((key) => !plan[key])) {
			throw new Error('Full CI must select every suite');
		}
		if (JSON.stringify(matrix) !== JSON.stringify(FULL_BUILD_MATRIX)) {
			throw new Error('Full CI must use the full build matrix');
		}
	} else {
		if (plan.fallback_reason !== null) {
			throw new Error('A fallback plan must select full CI');
		}
		const validAffectedMatrices = [
			FULL_BUILD_MATRIX,
			MINIMAL_BUILD_MATRIX,
		].some((candidate) => JSON.stringify(matrix) === JSON.stringify(candidate));
		if (!validAffectedMatrices) {
			throw new Error('Affected CI has an unrecognized build matrix');
		}
	}

	return plan;
};

export const createCiPlan = (input: PlannerInput): CiPlan => {
	const reasons: string[] = [];
	if (input.detector_error !== null) {
		return validateCiPlan(fullPlan(input.detector_error, reasons));
	}
	if (input.full_ci) {
		return validateCiPlan(fullPlan(null, reasons));
	}
	if (input.affected_json === null) {
		return validateCiPlan(
			fullPlan('Turborepo output was not provided', reasons),
		);
	}

	try {
		const tasks = readAffectedTasks(input.affected_json);
		for (const task of tasks) {
			reasons.push(`${task.fullName} (${task.reason.__typename})`);
		}
		const names = new Set(tasks.map((task) => task.name));
		const selected = (suite: keyof typeof TASKS_BY_SUITE) =>
			TASKS_BY_SUITE[suite].some((task) => names.has(task));
		const build = selected('build');
		const bundleExample = selected('bundle_example');
		const hasNonDocsBuild = tasks.some(
			(task) =>
				(task.name === 'make' || task.name === 'test') &&
				task.package.name !== 'docs',
		);

		return validateCiPlan({
			schema_version: CI_PLAN_SCHEMA_VERSION,
			full_ci: false,
			lambda: selected('lambda'),
			nextjs: selected('nextjs'),
			browser: selected('browser'),
			webrenderer: selected('webrenderer'),
			ssr: selected('ssr'),
			templates: selected('templates'),
			build,
			bundle_example: bundleExample,
			build_matrix: hasNonDocsBuild ? FULL_BUILD_MATRIX : MINIMAL_BUILD_MATRIX,
			fallback_reason: null,
			affected_reasons: reasons,
		});
	} catch (error) {
		return validateCiPlan(
			fullPlan(error instanceof Error ? error.message : String(error), reasons),
		);
	}
};

const getSelectedSuites = (plan: CiPlan) => ({
	lambda: plan.lambda,
	nextjs: plan.nextjs,
	browser: plan.browser,
	webrenderer: plan.webrenderer,
	ssr: plan.ssr,
	templates: plan.templates,
	build_job: plan.build || plan.bundle_example,
});

type SuiteKey = keyof ReturnType<typeof getSelectedSuites>;

export type RequiredCiResults = {
	detector: string;
	lint: string;
	lambda: string;
	nextjs: string;
	browser: string;
	webrenderer: string;
	ssr: string;
	templates: string;
	build_job: string;
};

export const validateRequiredCi = (
	planValue: unknown,
	results: RequiredCiResults,
) => {
	const plan = validateCiPlan(planValue);
	if (results.detector !== 'success') {
		throw new Error(`Detector concluded with ${results.detector}`);
	}
	if (results.lint !== 'success') {
		throw new Error(`Lint concluded with ${results.lint}`);
	}

	const selectedSuites = getSelectedSuites(plan);
	for (const suite of Object.keys(selectedSuites) as SuiteKey[]) {
		const selected = selectedSuites[suite];
		const result = results[suite];
		if (selected && result !== 'success') {
			throw new Error(`Selected suite ${suite} concluded with ${result}`);
		}
		if (!selected && result !== 'skipped') {
			throw new Error(`Unselected suite ${suite} concluded with ${result}`);
		}
	}
};

const commandSucceeded = (command: string[]) => {
	return (
		Bun.spawnSync(command, {stdout: 'ignore', stderr: 'inherit'}).exitCode === 0
	);
};

const commandOutput = (command: string[]) => {
	const result = Bun.spawnSync(command, {stdout: 'pipe', stderr: 'inherit'});
	if (result.exitCode !== 0) {
		return null;
	}

	return new TextDecoder().decode(result.stdout).trim();
};

const appendPlanOutputs = (
	plan: CiPlan,
	scmBase: string | null,
	scmHead: string | null,
) => {
	const githubOutput = process.env.GITHUB_OUTPUT;
	if (!githubOutput) {
		throw new Error('GITHUB_OUTPUT is not set');
	}

	appendFileSync(
		githubOutput,
		[
			`plan=${JSON.stringify(plan)}`,
			`full_ci=${plan.full_ci}`,
			`scm_base=${scmBase ?? ''}`,
			`scm_head=${scmHead ?? ''}`,
			`lambda=${plan.lambda}`,
			`nextjs=${plan.nextjs}`,
			`browser=${plan.browser}`,
			`webrenderer=${plan.webrenderer}`,
			`ssr=${plan.ssr}`,
			`templates=${plan.templates}`,
			`build=${plan.build}`,
			`bundle_example=${plan.bundle_example}`,
			`build_matrix=${JSON.stringify(plan.build_matrix)}`,
			'',
		].join('\n'),
	);
};

const appendPlanSummary = (
	plan: CiPlan,
	scmBase: string | null,
	scmHead: string | null,
) => {
	const githubStepSummary = process.env.GITHUB_STEP_SUMMARY;
	if (!githubStepSummary) {
		throw new Error('GITHUB_STEP_SUMMARY is not set');
	}

	const suites = getSelectedSuites(plan);
	const selected = Object.entries(suites)
		.filter(([, isSelected]) => isSelected)
		.map(([suite]) => suite);
	const skipped = Object.entries(suites)
		.filter(([, isSelected]) => !isSelected)
		.map(([suite]) => suite);
	appendFileSync(
		githubStepSummary,
		[
			'### Required CI plan',
			'',
			`- Full CI: ${plan.full_ci}`,
			...(scmBase && scmHead
				? [`- Compared commits: \`${scmBase}\` → \`${scmHead}\``]
				: []),
			`- Selected suites: ${selected.length ? selected.map((suite) => `\`${suite}\``).join(', ') : 'none'}`,
			`- Skipped suites: ${skipped.length ? skipped.map((suite) => `\`${suite}\``).join(', ') : 'none'}`,
			...(plan.fallback_reason
				? [`- Fallback reason: ${plan.fallback_reason}`]
				: []),
			'',
			'#### Affected Turborepo tasks',
			...plan.affected_reasons.map((reason) => `- \`${reason}\``),
			'',
		].join('\n'),
	);
};

const createPlanFromEnvironment = (): {
	plan: CiPlan;
	scmBase: string | null;
	scmHead: string | null;
} => {
	const eventName = process.env.GITHUB_EVENT_NAME;
	const ref = process.env.GITHUB_REF;
	if (!eventName || !ref) {
		return {
			plan: createCiPlan({
				full_ci: false,
				affected_json: null,
				detector_error: 'GitHub event metadata is missing',
			}),
			scmBase: null,
			scmHead: null,
		};
	}
	if (eventName === 'push' && ref === 'refs/heads/main') {
		return {
			plan: createCiPlan({
				full_ci: true,
				affected_json: null,
				detector_error: null,
			}),
			scmBase: null,
			scmHead: null,
		};
	}

	const head = process.env.GITHUB_SHA;
	const base = head ? commandOutput(['git', 'rev-parse', `${head}^1`]) : null;
	if (
		!base ||
		!head ||
		!commandSucceeded(['git', 'cat-file', '-e', `${head}^2`]) ||
		!commandSucceeded(['git', 'merge-base', '--is-ancestor', base, head])
	) {
		return {
			plan: createCiPlan({
				full_ci: false,
				affected_json: null,
				detector_error: 'GitHub PR merge commit resolution was unsafe',
			}),
			scmBase: null,
			scmHead: null,
		};
	}

	try {
		const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
			dependencies?: {turbo?: string};
		};
		const turboVersion = packageJson.dependencies?.turbo;
		if (!turboVersion) {
			throw new Error('Could not determine the Turborepo version');
		}
		const query = Bun.spawnSync(
			['bunx', `turbo@${turboVersion}`, 'query', 'affected'],
			{
				stdout: 'pipe',
				stderr: 'inherit',
				env: {...process.env, TURBO_SCM_BASE: base, TURBO_SCM_HEAD: head},
			},
		);
		if (query.exitCode !== 0) {
			throw new Error('turbo query affected failed');
		}

		return {
			plan: createCiPlan({
				full_ci: false,
				affected_json: new TextDecoder().decode(query.stdout),
				detector_error: null,
			}),
			scmBase: base,
			scmHead: head,
		};
	} catch (error) {
		return {
			plan: createCiPlan({
				full_ci: false,
				affected_json: null,
				detector_error: error instanceof Error ? error.message : String(error),
			}),
			scmBase: base,
			scmHead: head,
		};
	}
};

if (import.meta.main) {
	const command = process.argv[2];
	if (command === 'plan') {
		const {plan, scmBase, scmHead} = createPlanFromEnvironment();
		appendPlanOutputs(plan, scmBase, scmHead);
		appendPlanSummary(plan, scmBase, scmHead);
		console.log(JSON.stringify(plan, null, 2));
	} else if (command === 'validate') {
		const planJson = process.env.CI_PLAN;
		const resultsJson = process.env.CI_RESULTS;
		if (!planJson || !resultsJson) {
			throw new Error('CI_PLAN and CI_RESULTS must be set');
		}
		validateRequiredCi(JSON.parse(planJson), JSON.parse(resultsJson));
		console.log('Every selected required CI suite succeeded.');
	} else {
		throw new Error('Usage: ci.ts <plan|validate>');
	}
}
