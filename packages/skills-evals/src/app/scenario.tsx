import type {SkillEvalScenario} from '../../scenarios';
import {runCommand} from '../command';
import type {SkillEvalComparison} from '../manifest';
import {loadComparisons} from './comparison-data';
import {
	createJobRuns,
	formatRunLabel,
	getActiveJob,
	type Job,
	type JobRun,
} from './jobs';
import {
	Card,
	formatDate,
	Header,
	page,
	repoRoot,
	toComparisonUrl,
} from './shared';

type SkillDiffState = {
	hasChanges: boolean;
	message: string;
};

const getSkillDiffState = async (): Promise<SkillDiffState> => {
	const result = await runCommand({
		command: ['git', 'status', '--porcelain', '--', 'packages/skills/skills'],
		cwd: repoRoot,
	});

	if (result.exitCode === 0) {
		return {
			hasChanges: result.stdout.trim().length > 0,
			message: result.stdout.trim()
				? 'Skills differ from HEAD. Run a before/after comparison against HEAD.'
				: 'Skills match HEAD. This will run the scenario without a diff to review.',
		};
	}

	throw new Error(`Could not inspect skill diff: ${result.stderr}`);
};

const ScenarioRuns = ({comparisons}: {comparisons: SkillEvalComparison[]}) => {
	if (comparisons.length === 0) {
		return <p className="text-sm text-zinc-500">No runs yet.</p>;
	}

	return (
		<div className="mt-3 grid">
			{comparisons.map((comparison) => (
				<a
					className="flex items-center justify-between gap-4 border-t border-zinc-100 py-3 first:border-t-0 first:pt-0 last:pb-0"
					href={toComparisonUrl(comparison)}
					key={comparison.id}
				>
					<div>
						<h3 className="text-sm font-semibold text-zinc-800">
							{formatDate(comparison.completedAt)}
						</h3>
						<p className="mt-1 text-[0.8125rem] text-zinc-500">
							{comparison.before.hash} -&gt; {comparison.after.hash}
						</p>
					</div>
					<div className="whitespace-nowrap text-right text-xs text-zinc-400">
						{comparison.before.source ?? 'baseline'}
					</div>
				</a>
			))}
		</div>
	);
};

const ScenarioPageScript = ({activeJob}: {activeJob: Job | undefined}) => (
	<script
		dangerouslySetInnerHTML={{
			__html: `
const button = document.getElementById('run-comparison');
const panel = document.getElementById('active-job');
const log = document.getElementById('job-log');
const status = document.getElementById('job-status');
const runStatus = {
	before: document.getElementById('before-run-status'),
	after: document.getElementById('after-run-status'),
};
const runLog = {
	before: document.getElementById('before-run-log'),
	after: document.getElementById('after-run-log'),
};
const activeJobId = ${JSON.stringify(activeJob?.id ?? null)};

const renderJob = (job) => {
	panel.hidden = false;
	status.textContent = job.message || job.status;

	if (job.logs?.length) {
		log.hidden = false;
		log.textContent = job.logs.join('');
		log.scrollTop = log.scrollHeight;
	}

	for (const label of ['before', 'after']) {
		const run = job.runs?.[label];

		if (!run) {
			continue;
		}

		runStatus[label].textContent = run.message || run.status;
		runStatus[label].dataset.status = run.status;

		if (run.logs?.length) {
			runLog[label].hidden = false;
			runLog[label].textContent = run.logs.join('');
			runLog[label].scrollTop = runLog[label].scrollHeight;
		}
	}
};

const poll = async (jobId) => {
	const response = await fetch('/api/jobs/' + encodeURIComponent(jobId));
	const job = await response.json();
	renderJob(job);

	if (job.status === 'completed' && job.comparisonUrl) {
		location.href = job.comparisonUrl;
		return;
	}

	if (job.status === 'completed' && job.resultUrl) {
		location.href = job.resultUrl;
		return;
	}

	if (job.status === 'failed' || job.status === 'skipped') {
		button.disabled = false;
		return;
	}

	setTimeout(() => poll(jobId), 2000);
};

if (activeJobId) {
	button.disabled = true;
	log.hidden = false;
	poll(activeJobId);
}

button?.addEventListener('click', async () => {
	button.disabled = true;
	panel.hidden = false;
	status.textContent = 'Starting comparison...';
	for (const label of ['before', 'after']) {
		runStatus[label].textContent = 'Waiting to start';
		runStatus[label].dataset.status = 'waiting';
		runLog[label].hidden = true;
		runLog[label].textContent = '';
	}
	const response = await fetch(button.dataset.actionUrl, {
		method: 'POST',
	});
	const job = await response.json();
	poll(job.id);
});
`,
		}}
	/>
);

const RunProgressCard = ({
	jobRun,
	label,
}: {
	jobRun: JobRun;
	label: 'after' | 'before';
}) => (
	<section className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
		<div className="flex items-center justify-between gap-3">
			<h3 className="text-sm font-semibold">{formatRunLabel(label)}</h3>
			<span
				className="rounded-full bg-white px-2 py-1 text-xs text-zinc-500 data-[status=completed]:text-emerald-700 data-[status=failed]:text-red-700 data-[status=running]:text-yellow-700"
				data-status={jobRun.status}
				id={`${label}-run-status`}
			>
				{jobRun.message}
			</span>
		</div>
		<pre
			className="mt-3 max-h-70 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
			hidden={jobRun.logs.length === 0}
			id={`${label}-run-log`}
		>
			{jobRun.logs.join('')}
		</pre>
	</section>
);

const ActiveJobPanel = ({
	hasSkillChanges,
	job,
}: {
	hasSkillChanges: boolean;
	job: Job | undefined;
}) => {
	const runs = job?.runs ?? createJobRuns();

	return (
		<section
			className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4"
			hidden={!job}
			id="active-job"
		>
			<div>
				<h2 className="text-[0.9375rem] font-semibold">Active run</h2>
				<p className="text-sm text-zinc-500">
					{hasSkillChanges
						? 'Before and after run in parallel once the skill diff is ready.'
						: 'Scenario run without a before/after comparison.'}
				</p>
			</div>
			<p className="mt-3 text-[0.8125rem] text-yellow-700" id="job-status">
				{job?.message ?? ''}
			</p>
			<pre
				className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700"
				hidden={!job?.logs.length}
				id="job-log"
			>
				{job?.logs.join('') ?? ''}
			</pre>
			<div className="mt-3 grid grid-cols-2 gap-3 max-lg:grid-cols-1">
				<RunProgressCard jobRun={runs.before} label="before" />
				<RunProgressCard jobRun={runs.after} label="after" />
			</div>
		</section>
	);
};

export const renderScenario = async (scenario: SkillEvalScenario) => {
	const activeJob = getActiveJob(scenario.id);
	const skillDiffState = await getSkillDiffState();
	const comparisons = (await loadComparisons()).filter(
		(comparison) => comparison.scenarioId === scenario.id,
	);
	const latest = comparisons[0];

	return page({
		children: (
			<>
				<Header
					action={
						<button
							className="rounded-full bg-zinc-900 px-3 py-2 text-[0.8125rem] font-semibold text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
							data-action-url={
								skillDiffState.hasChanges
									? `/api/compare/${encodeURIComponent(scenario.id)}`
									: `/api/run/${encodeURIComponent(scenario.id)}`
							}
							data-scenario={scenario.id}
							id="run-comparison"
						>
							{skillDiffState.hasChanges ? 'Run comparison' : 'Run'}
						</button>
					}
					eyebrow="Scenario"
					subtitle={scenario.model}
					title={scenario.id}
				/>
				<main className="grid min-w-0 gap-4">
					<section
						className={`min-w-0 rounded-2xl border p-4 ${
							skillDiffState.hasChanges
								? 'border-amber-200 bg-amber-50'
								: 'border-zinc-200 bg-white'
						}`}
					>
						<div className="flex items-start justify-between gap-4 max-md:flex-col">
							<div>
								<h2 className="text-[0.9375rem] font-semibold">
									{skillDiffState.hasChanges
										? 'Skills changed from HEAD'
										: 'No skill changes'}
								</h2>
								<p
									className={`mt-1 text-sm ${
										skillDiffState.hasChanges
											? 'text-amber-800'
											: 'text-zinc-500'
									}`}
								>
									{skillDiffState.message}
								</p>
							</div>
							<span
								className={`rounded-full px-2 py-1 text-xs ${
									skillDiffState.hasChanges
										? 'bg-amber-100 text-amber-800'
										: 'bg-zinc-100 text-zinc-600'
								}`}
							>
								{skillDiffState.hasChanges ? 'Compare against HEAD' : 'HEAD'}
							</span>
						</div>
					</section>
					<Card>
						<div>
							<h2 className="text-[0.9375rem] font-semibold">
								Latest comparison
							</h2>
							<p className="text-sm text-zinc-500">
								{latest
									? `Completed ${formatDate(latest.completedAt)}`
									: 'No comparisons yet.'}
							</p>
						</div>
						{latest ? (
							<p className="mt-3 text-xs text-zinc-400">
								{latest.before.hash} -&gt; {latest.after.hash}
							</p>
						) : null}
					</Card>
					<ActiveJobPanel
						hasSkillChanges={skillDiffState.hasChanges}
						job={activeJob}
					/>
					<Card>
						<h2 className="text-[0.9375rem] font-semibold">Runs</h2>
						<ScenarioRuns comparisons={comparisons} />
					</Card>
					<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
						<summary className="cursor-pointer text-sm font-semibold">
							Prompt
						</summary>
						<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
							{scenario.prompt}
						</pre>
					</details>
				</main>
				<ScenarioPageScript activeJob={activeJob} />
			</>
		),
		title: scenario.id,
	});
};
