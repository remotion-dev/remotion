import {generateGallery} from './gallery';
import {runSkillEval} from './run-skill-eval';
import {scenarios} from './scenarios';

const getScenario = (id: string) => {
	const scenario = scenarios.find((candidate) => candidate.id === id);

	if (!scenario) {
		throw new Error(`Unknown scenario "${id}". Run "bun run eval list".`);
	}

	return scenario;
};

const main = async () => {
	const command = process.argv[2];

	if (command === 'gallery') {
		const outputFile = await generateGallery();
		process.stdout.write(`Generated gallery at ${outputFile}\n`);
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

		const outputFile = await generateGallery();
		process.stdout.write(`Generated gallery at ${outputFile}\n`);
	} else {
		process.stdout.write(
			'Usage: bun run eval <list|run|gallery> [scenario-id|--all]\n',
		);
		process.exit(command ? 1 : 0);
	}
};

main();
