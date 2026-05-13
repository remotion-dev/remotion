import {basename} from 'node:path';
import {scenarios, type SkillEvalScenario} from '../../scenarios';
import {
	runSkillEvalComparison,
	type SkillEvalComparisonEvent,
	type SkillEvalComparisonRunLabel,
} from '../compare';
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

export const startComparison = (scenario: SkillEvalScenario) => {
	const existingJob = getActiveJob(scenario.id);

	if (existingJob) {
		return existingJob;
	}

	const job: Job = {
		id: `${Date.now()}-${scenario.id}`,
		logs: [],
		message: 'Preparing comparison...',
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
			} generating.`;
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
			run.message = `${formatRunLabel(event.label)} is generating.`;
			updateJobMessage();
			return;
		}

		if (event.type === 'run-phase') {
			run.status = 'running';
			run.message = `${phaseLabels[event.event.phase]}${
				event.event.status === 'completed' ? ' complete' : ''
			}`;
			updateJobMessage();
			return;
		}

		if (event.type === 'run-output') {
			run.status = 'running';
			run.message = `${phaseLabels[event.output.phase]} (${event.output.stream})`;
			run.logs.push(event.output.chunk);
			trimLog(run.logs, 1000);
			updateJobMessage();
			return;
		}

		if (event.type === 'run-complete') {
			run.status = 'completed';
			run.message = `${formatRunLabel(event.label)} complete.`;
			updateJobMessage();
			return;
		}

		run.status = 'failed';
		run.message = event.error;
		updateJobMessage();
	};

	const comparisonPromise = runSkillEvalComparison(scenario, {
		onEvent: handleEvent,
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

export const startRun = (scenario: SkillEvalScenario) => {
	const existingJob = getActiveJob(scenario.id);

	if (existingJob) {
		return existingJob;
	}

	const job: Job = {
		id: `${Date.now()}-${scenario.id}`,
		logs: [],
		message: 'Preparing run...',
		runs: createJobRuns(),
		scenarioId: scenario.id,
		startedAt: new Date().toISOString(),
		status: 'running',
	};
	const run = job.runs.after;

	job.runs.before.message = 'Not needed for a plain run';
	job.runs.before.status = 'completed';
	jobs.set(job.id, job);

	const runPromise = runSkillEval({
		...scenario,
		onPhase: (event) => {
			run.status = 'running';
			run.message = `${phaseLabels[event.phase]}${
				event.status === 'completed' ? ' complete' : ''
			}`;
			job.message = 'Running scenario...';
		},
		onOutput: (output) => {
			run.status = 'running';
			run.message = `${phaseLabels[output.phase]} (${output.stream})`;
			run.logs.push(output.chunk);
			trimLog(run.logs, 1000);
			job.message = 'Running scenario...';
		},
		skillSnapshot: {
			isWorkingTree: true,
			label: 'after',
		},
	})
		.then((result) => {
			run.status = 'completed';
			run.message = 'Run complete.';
			job.message = 'Run complete.';
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
