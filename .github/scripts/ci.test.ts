import {describe, expect, test} from 'bun:test';
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
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
	monorepo: 'skipped',
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

	test.each(['build', 'make', 'test'])(
		'uses the full build matrix when a non-docs %s task is affected',
		(task) => {
			const plan = planFor({
				tasks: [{name: task, packageName: 'template-electron'}],
			});
			expect(plan.build).toBe(true);
			expect(plan.build_matrix).toEqual(FULL_BUILD_MATRIX);
		},
	);

	test.each([
		['lambda', 'testlambda'],
		['nextjs', 'testnextjs'],
		['browser', 'testwebcodecs'],
		['browser', 'teste2e'],
		['webrenderer', 'testwebrenderer'],
		['webrenderer', 'testbrowserstudio'],
		['ssr', 'testssr'],
		['monorepo', 'testmonorepo'],
		['templates', 'testtemplates'],
		['bundle_example', 'bundle-testbed'],
	] as const)('maps %s from the %s task', (suite, task) => {
		const plan = planFor({tasks: [{name: task}]});
		expect(plan[suite]).toBe(true);
	});

	test('falls back to full CI after a Turborepo command failure', () => {
		const plan = planFor({detectorError: 'turbo query affected exited 1'});
		expect(plan.full_ci).toBe(true);
		expect(plan.monorepo).toBe(true);
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

describe('Turborepo monorepo test inputs', () => {
	test(
		'selects monorepo tests only for declared external inputs',
		() => {
			const root = path.resolve(__dirname, '..', '..');
			const rootPackageJson = JSON.parse(
				readFileSync(path.join(root, 'package.json'), 'utf8'),
			) as {
				packageManager: string;
				dependencies: {turbo: string};
			};
			const turboConfig = JSON.parse(
				readFileSync(path.join(root, 'turbo.json'), 'utf8'),
			) as {
				$schema: string;
				tasks: Record<string, {dependsOn: string[]; inputs: string[]}>;
			};
			const monorepoTask = turboConfig.tasks['@remotion/it-tests#testmonorepo'];
			if (!monorepoTask) {
				throw new Error('Missing @remotion/it-tests#testmonorepo task');
			}

			const externalChanges = [
				{directory: 'lambda-go', file: 'synthetic-input.txt'},
				{directory: 'lambda-php', file: 'synthetic-input.txt'},
				{directory: 'lambda-php-example', file: 'composer.json'},
				{directory: 'lambda-python', file: 'synthetic-input.txt'},
				{directory: 'lambda-ruby', file: 'synthetic-input.txt'},
			] as const;
			for (const {directory} of externalChanges) {
				expect(monorepoTask.inputs).toContain(
					`$TURBO_ROOT$/packages/${directory}/**`,
				);
			}

			const fixture = mkdtempSync(path.join(tmpdir(), 'remotion-ci-affected-'));
			const turboBin = path.join(root, 'node_modules', 'turbo', 'bin', 'turbo');
			const run = (command: string[], extraEnv: Record<string, string>) => {
				const result = Bun.spawnSync(command, {
					cwd: fixture,
					env: {...process.env, ...extraEnv},
					stdout: 'pipe',
					stderr: 'pipe',
				});
				if (result.exitCode !== 0) {
					throw new Error(
						`${command.join(' ')} failed:\n${new TextDecoder().decode(result.stderr)}`,
					);
				}

				return new TextDecoder().decode(result.stdout).trim();
			};
			const writeJson = (filePath: string, value: unknown) => {
				writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
			};

			try {
				mkdirSync(path.join(fixture, 'packages', 'it-tests'), {
					recursive: true,
				});
				writeJson(path.join(fixture, 'package.json'), {
					private: true,
					packageManager: rootPackageJson.packageManager,
					workspaces: {packages: ['packages/*']},
					dependencies: {turbo: rootPackageJson.dependencies.turbo},
				});
				writeJson(path.join(fixture, 'turbo.json'), {
					$schema: turboConfig.$schema,
					tasks: {'@remotion/it-tests#testmonorepo': monorepoTask},
				});
				writeJson(path.join(fixture, 'packages', 'it-tests', 'package.json'), {
					name: '@remotion/it-tests',
					version: '1.0.0',
					private: true,
					scripts: {testmonorepo: 'echo test'},
				});
				for (const {directory, file} of externalChanges) {
					const sdkDirectory = path.join(fixture, 'packages', directory);
					mkdirSync(sdkDirectory, {recursive: true});
					if (directory !== 'lambda-php-example') {
						writeJson(path.join(sdkDirectory, 'package.json'), {
							name: `@remotion/${directory}`,
							version: '1.0.0',
							private: true,
						});
					}
					writeFileSync(path.join(sdkDirectory, file), 'baseline\n');
				}
				const unrelatedDirectory = path.join(fixture, 'packages', 'unrelated');
				mkdirSync(path.join(unrelatedDirectory, 'src'), {recursive: true});
				writeJson(path.join(unrelatedDirectory, 'package.json'), {
					name: '@remotion/unrelated',
					version: '1.0.0',
					private: true,
				});
				writeFileSync(
					path.join(unrelatedDirectory, 'src', 'unrelated.ts'),
					'baseline\n',
				);
				writeFileSync(path.join(fixture, '.gitignore'), '.turbo\n');

				run(['git', 'init', '--quiet'], {});
				run(['git', 'config', 'user.email', 'ci-test@remotion.dev'], {});
				run(['git', 'config', 'user.name', 'CI Test'], {});
				run(['git', 'add', '.'], {});
				run(['git', 'commit', '--quiet', '-m', 'baseline'], {});
				const base = run(['git', 'rev-parse', 'HEAD'], {});

				const affectedForChange = (relativePath: string) => {
					writeFileSync(path.join(fixture, relativePath), 'changed\n');
					run(['git', 'add', relativePath], {});
					run(['git', 'commit', '--quiet', '-m', `Change ${relativePath}`], {});
					const head = run(['git', 'rev-parse', 'HEAD'], {});
					expect(run(['git', 'diff', '--name-only', base, head], {})).toBe(
						relativePath,
					);
					const affectedJson = run(
						[
							process.execPath,
							turboBin,
							'query',
							'affected',
							'--no-update-notifier',
						],
						{TURBO_SCM_BASE: base, TURBO_SCM_HEAD: head},
					);
					run(['git', 'reset', '--hard', '--quiet', base], {});
					return affectedJson;
				};

				for (const {directory, file} of externalChanges) {
					const affectedJson = affectedForChange(
						`packages/${directory}/${file}`,
					);
					const query = JSON.parse(affectedJson) as {
						data: {affectedTasks: {items: Array<{fullName: string}>}};
					};
					expect(
						query.data.affectedTasks.items.map((task) => task.fullName),
					).toContain('@remotion/it-tests#testmonorepo');
					expect(planFor({affectedJson}).monorepo).toBe(true);
				}

				const unrelatedJson = affectedForChange(
					'packages/unrelated/src/unrelated.ts',
				);
				const unrelatedQuery = JSON.parse(unrelatedJson) as {
					data: {affectedTasks: {items: Array<{fullName: string}>}};
				};
				expect(
					unrelatedQuery.data.affectedTasks.items.map((task) => task.fullName),
				).not.toContain('@remotion/it-tests#testmonorepo');
				expect(planFor({affectedJson: unrelatedJson}).monorepo).toBe(false);
			} finally {
				rmSync(fixture, {force: true, recursive: true});
			}
		},
		{timeout: 30000},
	);
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

	test('requires a selected monorepo job to succeed', () => {
		const plan = planFor({tasks: [{name: 'testmonorepo'}]});
		const results = skippedResults();
		results.monorepo = 'success';
		expect(() => validateRequiredCi(plan, results)).not.toThrow();

		results.monorepo = 'failure';
		expect(() => validateRequiredCi(plan, results)).toThrow(
			'Selected suite monorepo concluded with failure',
		);
	});

	test('requires an unselected monorepo job to be skipped', () => {
		const results = skippedResults();
		results.monorepo = 'success';
		expect(() => validateRequiredCi(planFor(), results)).toThrow(
			'Unselected suite monorepo concluded with success',
		);
	});

	test('rejects an unselected successful build', () => {
		const results = skippedResults();
		results.build_job = 'success';
		expect(() => validateRequiredCi(planFor(), results)).toThrow(
			'Unselected suite build_job concluded with success',
		);
	});
});
