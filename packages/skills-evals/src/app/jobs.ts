import {basename} from 'node:path';
import {scenarios, type SkillEvalScenario} from '../../scenarios';
import {
	runSkillEvalComparison,
	type SkillEvalComparisonEvent,
	type SkillEvalComparisonRunLabel,
} from '../compare';
import {
	maxParallelSkillEvalRuns,
	validateSkillEvalRunCount,
} from '../run-count';
import {runSkillEval, type SkillEvalPhase} from '../run-skill-eval';
import {toComparisonUrl} from './shared';

export type Job = {
	id: string;
	logs: string[];
	runs: Record<SkillEvalComparisonRunLabel, JobRun>;
	scenarioId: string;
	startedAt: string;
	status: 'running' | 'completed' | 'failed' | 'skipped';
	comparisonUrl?: string;
	error?: string;
	message?: string;
	resultUrl?: string;
	runCount: number;
};

export type JobRun = {
	logs: string[];
	message: string;
	status: 'completed' | 'failed' | 'running' | 'waiting';
};

const jobs = new Map<string, Job>();

const phaseLabels: Record<SkillEvalPhase, string> = {
	install: 'Installing dependencies',
	pi: 'Generating project',
	'pi-export': 'Exporting Pi session',
	'pi-render': 'Rendering artifact',
};

const createJobRun = (): JobRun => ({
	logs: [],
	message: 'Waiting to start',
	status: 'waiting',
});

export const createJobRuns = (): Record<
	SkillEvalComparisonRunLabel,
	JobRun
> => ({
	after: createJobRun(),
	before: createJobRun(),
});

export const formatRunLabel = (label: SkillEvalComparisonRunLabel) =>
	label === 'before' ? 'Before' : 'After';

const trimLog = (logs: string[], maxLength: number) => {
	if (logs.length > maxLength) {
		logs.splice(0, logs.length - maxLength);
	}
};

export const getScenario = (id: string) =>
	scenarios.find((scenario) => scenario.id === id) ?? null;

export const getJob = (id: string) => jobs.get(id) ?? null;

export const getActiveJob = (scenarioId: string) =>
	[...jobs.values()].find(
		(job) => job.scenarioId === scenarioId && job.status === 'running',
	);

const runWithConcurrency = async <TInput, TOutput>({
	inputs,
	limit,
	worker,
}: {
	inputs: TInput[];
	limit: number;
	worker: (input: TInput) => Promise<TOutput>;
}) => {
	const results: TOutput[] = [];
	let nextIndex = 0;

	await Promise.all(
		Array.from({length: Math.min(limit, inputs.length)}, async () => {
			while (nextIndex < inputs.length) {
				const currentIndex = nextIndex;
				nextIndex++;
				results[currentIndex] = await worker(inputs[currentIndex]);
			}
		}),
	);

	return results;
};

export const startComparison = (
	scenario: SkillEvalScenario,
	options: {beforeGitRef?: string; runCount?: number} = {},
) => {
	const runCount = validateSkillEvalRunCount(options.runCount);
	const existingJob = getActiveJob(scenario.id);

	if (existingJob) {
		return existingJob;
	}

	const job: Job = {
		id: `${Date.now()}-${scenario.id}`,
		logs: [],
		message: 'Preparing comparison...',
		runCount,
		runs: createJobRuns(),
		scenarioId: scenario.id,
		startedAt: new Date().toISOString(),
		status: 'running',
	};

	jobs.set(job.id, job);

	const appendLog = (chunk: string) => {
		job.logs.push(chunk);
		trimLog(job.logs, 1000);
	};

	const updateJobMessage = () => {
		const running = Object.entries(job.runs)
			.filter(([, run]) => run.status === 'running')
			.map(([label]) => formatRunLabel(label as SkillEvalComparisonRunLabel));

		if (running.length > 0) {
			job.message = `${running.join(' and ')} ${
				running.length === 1 ? 'is' : 'are'
			} generating${job.runCount > 1 ? ` across ${job.runCount} runs` : ''}.`;
			return;
		}

		const failed = Object.entries(job.runs).find(
			([, run]) => run.status === 'failed',
		);

		if (failed) {
			job.message = `${formatRunLabel(
				failed[0] as SkillEvalComparisonRunLabel,
			)} failed.`;
		}
	};

	const handleEvent = (event: SkillEvalComparisonEvent) => {
		if (event.type === 'message') {
			appendLog(event.message);
			job.message = event.message.trim();
			return;
		}

		const run = job.runs[event.label];

		if (event.type === 'run-start') {
			run.status = 'running';
			run.message = `${formatRunLabel(event.label)} ${
				job.runCount > 1 ? `#${event.runIndex} ` : ''
			}is generating.`;
			updateJobMessage();
			return;
		}

		if (event.type === 'run-phase') {
			run.status = 'running';
			run.message = `${job.runCount > 1 ? `#${event.runIndex}: ` : ''}${
				phaseLabels[event.event.phase]
			}${event.event.status === 'completed' ? ' complete' : ''}`;
			updateJobMessage();
			return;
		}

		if (event.type === 'run-output') {
			run.status = 'running';
			run.message = `${job.runCount > 1 ? `#${event.runIndex}: ` : ''}${
				phaseLabels[event.output.phase]
			} (${event.output.stream})`;
			run.logs.push(event.output.chunk);
			trimLog(run.logs, 1000);
			updateJobMessage();
			return;
		}

		if (event.type === 'run-complete') {
			run.status = 'completed';
			run.message = `${formatRunLabel(event.label)} ${
				job.runCount > 1 ? `#${event.runIndex} ` : ''
			}complete.`;
			updateJobMessage();
			return;
		}

		run.status = 'failed';
		run.message = event.error;
		updateJobMessage();
	};

	const comparisonPromise = runSkillEvalComparison(scenario, {
		beforeGitRef: options.beforeGitRef,
		onEvent: handleEvent,
		runCount,
	})
		.then((result) => {
			if (result.skipped) {
				job.message = result.reason;
				job.status = 'skipped';
				return;
			}

			job.comparisonUrl = toComparisonUrl(result.comparison);
			job.message = 'Comparison complete.';
			job.status = 'completed';
		})
		.catch((error: unknown) => {
			job.error = error instanceof Error ? error.message : String(error);
			job.message = job.error;
			job.status = 'failed';
		});
	comparisonPromise.catch(() => undefined);

	return job;
};

export const startRun = (
	scenario: SkillEvalScenario,
	runCountInput?: number,
) => {
	const runCount = validateSkillEvalRunCount(runCountInput);
	const existingJob = getActiveJob(scenario.id);

	if (existingJob) {
		return existingJob;
	}

	const job: Job = {
		id: `${Date.now()}-${scenario.id}`,
		logs: [],
		message: 'Preparing run...',
		runCount,
		runs: createJobRuns(),
		scenarioId: scenario.id,
		startedAt: new Date().toISOString(),
		status: 'running',
	};
	const run = job.runs.after;

	job.runs.before.message = 'Not needed for a plain run';
	job.runs.before.status = 'completed';
	jobs.set(job.id, job);

	const runPromise = runWithConcurrency({
		inputs: Array.from({length: runCount}, (_, index) => index + 1),
		limit: maxParallelSkillEvalRuns,
		worker: (runIndex) =>
			runSkillEval({
				...scenario,
				onPhase: (event) => {
					run.status = 'running';
					run.message = `${
						runCount > 1 ? `Run #${runIndex}: ` : ''
					}${phaseLabels[event.phase]}${
						event.status === 'completed' ? ' complete' : ''
					}`;
					job.message = `Running scenario${
						runCount > 1 ? ` (${runCount} runs)` : ''
					}...`;
				},
				onOutput: (output) => {
					run.status = 'running';
					run.message = `${
						runCount > 1 ? `Run #${runIndex}: ` : ''
					}${phaseLabels[output.phase]} (${output.stream})`;
					run.logs.push(output.chunk);
					trimLog(run.logs, 1000);
					job.message = `Running scenario${
						runCount > 1 ? ` (${runCount} runs)` : ''
					}...`;
				},
				runLabel:
					runCount === 1
						? undefined
						: `run-${String(runIndex).padStart(2, '0')}`,
				skillSnapshot: {
					isWorkingTree: true,
					label: 'after',
				},
			}),
	})
		.then((results) => {
			const result = results[0];

			if (!result) {
				throw new Error('No run result was produced.');
			}

			run.status = 'completed';
			run.message =
				runCount === 1 ? 'Run complete.' : `${runCount} runs complete.`;
			job.message = run.message;
			job.resultUrl = `/runs/${encodeURIComponent(
				result.manifest.id,
			)}/${encodeURIComponent(basename(result.manifest.runDir))}`;
			job.status = 'completed';
		})
		.catch((error: unknown) => {
			job.error = error instanceof Error ? error.message : String(error);
			job.message = job.error;
			job.status = 'failed';
			run.status = 'failed';
			run.message = job.error;
		});
	runPromise.catch(() => undefined);

	return job;
};
