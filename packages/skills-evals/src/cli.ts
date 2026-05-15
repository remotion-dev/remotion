import {scenarios} from '../scenarios';
import {runSkillEvalComparison} from './compare';
import {runSkillEval} from './run-skill-eval';

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

const main = async () => {
	const command = process.argv[2];

	if (command === 'dev') {
		await import('./server');
	} else if (command === 'compare') {
		const scenario = getScenario(process.argv[3]);
		const beforeGitRef = process.argv[4];
		process.stdout.write(
			`Comparing ${scenario.id} with ${scenario.model}${
				beforeGitRef ? ` against ${beforeGitRef}` : ''
			}\n`,
		);
		const result = await runSkillEvalComparison(scenario, {
			beforeGitRef,
			onLog: (chunk) => process.stdout.write(chunk),
		});

		if (result.skipped) {
			process.stdout.write(`${result.reason}\n`);
			return;
		}

		process.stdout.write(
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

		for (const scenario of scenariosToRun) {
			process.stdout.write(`Running ${scenario.id} with ${scenario.model}\n`);
			const result = await runSkillEval(scenario);
			process.stdout.write(`Wrote ${result.manifestPath}\n`);
		}
	} else {
		process.stdout.write(
			'Usage: bun run eval <list|run|compare|dev> [scenario-id|--all] [base-ref]\n',
		);
		process.exit(command ? 1 : 0);
	}
};

main();
