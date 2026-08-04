import {describe, expect, test} from 'bun:test';
import {
	createCiPlan,
	FULL_BUILD_MATRIX,
	MINIMAL_BUILD_MATRIX,
	validateCiPlan,
	validateRequiredCi,
	type CiPlan,
	type RequiredCiResults,
} from './ci';

const affected = (
	tasks: Array<{
		name: string;
		packageName?: string;
	}>,
) =>
	JSON.stringify({
		data: {
			affectedTasks: {
				items: tasks.map(({name, packageName = '@remotion/core'}) => ({
					name,
					fullName: `${packageName}#${name}`,
					package: {name: packageName},
					reason: {__typename: 'FileChanged'},
				})),
			},
		},
	});

const planFor = ({
	tasks = [],
	affectedJson,
	detectorError = null,
}: {
	tasks?: Array<{name: string; packageName?: string}>;
	affectedJson?: string | null;
	detectorError?: string | null;
} = {}) =>
	createCiPlan({
		full_ci: false,
		affected_json: affectedJson === undefined ? affected(tasks) : affectedJson,
		detector_error: detectorError,
	});

const skippedResults = (): RequiredCiResults => ({
	detector: 'success',
	lint: 'success',
	lambda: 'skipped',
	nextjs: 'skipped',
	browser: 'skipped',
	webrenderer: 'skipped',
	ssr: 'skipped',
	templates: 'skipped',
	build_job: 'skipped',
});

describe('CI plan generation', () => {
	test('selects only the minimal build matrix for docs tasks', () => {
		const plan = planFor({
			tasks: [
				{name: 'make', packageName: 'docs'},
				{name: 'test', packageName: 'docs'},
			],
		});

		expect(plan.full_ci).toBe(false);
		expect(plan.build).toBe(true);
		expect(plan.build_matrix).toEqual(MINIMAL_BUILD_MATRIX);
		expect(plan.lambda).toBe(false);
	});

	test('allows no build or specialized tasks to be affected', () => {
		const plan = planFor();
		expect(plan.build).toBe(false);
		expect(plan.build_matrix).toEqual(MINIMAL_BUILD_MATRIX);
	});

	test('uses the full build matrix for a package source change', () => {
		const plan = planFor({tasks: [{name: 'make'}, {name: 'test'}]});
		expect(plan.build).toBe(true);
		expect(plan.build_matrix).toEqual(FULL_BUILD_MATRIX);
	});

	test.each([
		['lambda', 'testlambda'],
		['nextjs', 'testnextjs'],
		['browser', 'testwebcodecs'],
		['browser', 'teste2e'],
		['webrenderer', 'testwebrenderer'],
		['webrenderer', 'testbrowserstudio'],
		['ssr', 'testssr'],
		['templates', 'testtemplates'],
		['bundle_example', 'bundle-testbed'],
	] as const)('maps %s from the %s task', (suite, task) => {
		const plan = planFor({tasks: [{name: task}]});
		expect(plan[suite]).toBe(true);
	});

	test('falls back to full CI after a Turborepo command failure', () => {
		const plan = planFor({detectorError: 'turbo query affected exited 1'});
		expect(plan.full_ci).toBe(true);
		expect(plan.fallback_reason).toBe('turbo query affected exited 1');
	});

	test.each(['{"data":', '{"data":{}}'])(
		'falls back after invalid Turborepo JSON',
		(affectedJson) => {
			const plan = planFor({affectedJson});
			expect(plan.full_ci).toBe(true);
			expect(plan.fallback_reason).not.toBeNull();
		},
	);

	test('rejects a missing boolean output', () => {
		const plan = planFor() as CiPlan & {lambda?: boolean};
		delete plan.lambda;
		expect(() => validateCiPlan(plan)).toThrow(
			'CI plan value lambda must be a boolean',
		);
	});

	test('rejects full CI that omits a suite', () => {
		const plan = createCiPlan({
			full_ci: true,
			affected_json: null,
			detector_error: null,
		});
		plan.templates = false;
		expect(() => validateCiPlan(plan)).toThrow(
			'Full CI must select every suite',
		);
	});
});

describe('Required CI result validation', () => {
	const lambdaPlan = () => planFor({tasks: [{name: 'testlambda'}]});

	test('accepts a selected successful job and unselected skipped jobs', () => {
		const results = skippedResults();
		results.lambda = 'success';
		expect(() => validateRequiredCi(lambdaPlan(), results)).not.toThrow();
	});

	test.each(['failure', 'cancelled', 'skipped'])(
		'rejects a selected job that is %s',
		(result) => {
			const results = skippedResults();
			results.lambda = result;
			expect(() => validateRequiredCi(lambdaPlan(), results)).toThrow(
				`Selected suite lambda concluded with ${result}`,
			);
		},
	);

	test('accepts an unselected skipped job', () => {
		expect(() => validateRequiredCi(planFor(), skippedResults())).not.toThrow();
	});

	test.each(['success', 'failure', 'cancelled'])(
		'rejects an unselected job that concludes with %s',
		(result) => {
			const results = skippedResults();
			results.browser = result;
			expect(() => validateRequiredCi(planFor(), results)).toThrow(
				`Unselected suite browser concluded with ${result}`,
			);
		},
	);

	test('rejects an unselected successful build', () => {
		const results = skippedResults();
		results.build_job = 'success';
		expect(() => validateRequiredCi(planFor(), results)).toThrow(
			'Unselected suite build_job concluded with success',
		);
	});
});
