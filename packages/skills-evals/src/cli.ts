import {scenarios} from '../scenarios';
import {runSkillEvalComparison} from './compare';
import {maxParallelSkillEvalRuns, validateSkillEvalRunCount} from './run-count';
import {runSkillEval} from './run-skill-eval';
import {runWithConcurrency} from './run-with-concurrency';

const serverUrl = 'http://localhost:4321';

const getScenario = (id: string | undefined) => {
	if (!id) {
		if (scenarios.length === 1) {
			return scenarios[0];
		}

		throw new Error('Pass a scenario id.');
	}

	const scenario = scenarios.find((candidate) => candidate.id === id);

	if (!scenario) {
		throw new Error(`Unknown scenario "${id}". Run "bun run eval list".`);
	}

	return scenario;
};

const parseRunCount = (args: string[]) => {
	let runCount = 1;

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];

		if (arg === '--runs') {
			const value = args[index + 1];

			if (!value) {
				throw new Error('Pass a value after --runs.');
			}

			runCount = Number(value);
			index++;
		} else if (arg.startsWith('--runs=')) {
			runCount = Number(arg.slice('--runs='.length));
		} else {
			throw new Error(`Unknown option "${arg}".`);
		}
	}

	return validateSkillEvalRunCount(runCount, '--runs');
};

const parseCompareOptions = (args: string[]) => {
	let beforeGitRef: string | undefined;
	const runCountArgs: string[] = [];

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];

		if (arg === '--runs') {
			const value = args[index + 1];

			if (!value) {
				throw new Error('Pass a value after --runs.');
			}

			runCountArgs.push(arg, value);
			index++;
		} else if (arg.startsWith('--runs=')) {
			runCountArgs.push(arg);
		} else if (!beforeGitRef) {
			beforeGitRef = arg;
		} else {
			throw new Error(`Unknown option "${arg}".`);
		}
	}

	return {
		beforeGitRef,
		runCount: parseRunCount(runCountArgs),
	};
};

const main = async () => {
	const command = process.argv[2];

	if (command === 'dev') {
		await import('./server');
	} else if (command === 'compare') {
		const scenario = getScenario(process.argv[3]);
		const {beforeGitRef, runCount} = parseCompareOptions(process.argv.slice(4));
		process.stdout.write(
			`Comparing ${scenario.id} with ${scenario.model}${
				beforeGitRef ? ` against ${beforeGitRef}` : ''
			} (${runCount} ${runCount === 1 ? 'run' : 'runs'})\n`,
		);
		const result = await runSkillEvalComparison(scenario, {
			beforeGitRef,
			onLog: (chunk) => process.stdout.write(chunk),
			runCount,
		});

		if (result.skipped) {
			process.stdout.write(`${result.reason}\n`);
			return;
		}

		process.stdout.write(
			result.comparison.runs
				?.map(
					(run) =>
						`${scenario.id} #${run.index}: ${run.before.hash} -> ${run.after.hash}\n`,
				)
				.join('') ??
				`${scenario.id}: ${result.comparison.before.hash} -> ${result.comparison.after.hash}\n`,
		);
		process.stdout.write(`Preview: ${serverUrl}\n`);
	} else if (command === 'list') {
		for (const scenario of scenarios) {
			process.stdout.write(`${scenario.id}\t${scenario.model}\n`);
		}
	} else if (command === 'run') {
		const scenarioId = process.argv[3];
		if (!scenarioId) {
			throw new Error('Pass a scenario id or --all.');
		}

		const scenariosToRun =
			scenarioId === '--all' ? scenarios : [getScenario(scenarioId)];
		const runCount = parseRunCount(process.argv.slice(4));

		for (const scenario of scenariosToRun) {
			process.stdout.write(
				`Running ${scenario.id} with ${scenario.model} (${runCount} ${
					runCount === 1 ? 'run' : 'runs'
				})\n`,
			);
			const runIndexes = Array.from(
				{length: runCount},
				(_, index) => index + 1,
			);
			const results = await runWithConcurrency({
				inputs: runIndexes,
				limit: maxParallelSkillEvalRuns,
				worker: async (runIndex) => {
					const result = await runSkillEval({
						...scenario,
						runLabel:
							runCount === 1
								? undefined
								: `run-${String(runIndex).padStart(2, '0')}`,
						skillSnapshot: {
							isWorkingTree: true,
							label: 'after',
						},
					});
					process.stdout.write(
						`Wrote run #${runIndex}: ${result.manifestPath}\n`,
					);
					return result;
				},
			});

			process.stdout.write(
				`Completed ${results.length} ${results.length === 1 ? 'run' : 'runs'} for ${scenario.id}\n`,
			);
		}
	} else {
		process.stdout.write(
			'Usage: bun run eval <list|run|compare|dev> [scenario-id|--all] [base-ref] [--runs 1-4]\n',
		);
		process.exit(command ? 1 : 0);
	}
};

main();
