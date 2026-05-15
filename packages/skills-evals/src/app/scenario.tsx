import {basename, join} from 'node:path';
import type {SkillEvalScenario} from '../../scenarios';
import {runCommand} from '../command';
import {getDefaultComparisonBaseRef} from '../compare';
import {listFilesRecursively, readJson, sanitizePathPart} from '../files';
import type {SkillEvalComparison, SkillEvalManifest} from '../manifest';
import {loadComparisons} from './comparison-data';
import {
	createJobRuns,
	formatRunLabel,
	getActiveJob,
	type Job,
	type JobRun,
	type JobRunGroup,
} from './jobs';
import {
	Card,
	formatDate,
	Header,
	page,
	repoRoot,
	runsRoot,
	toComparisonUrl,
} from './shared';

type SkillDiffState = {
	baseRef: string;
	hasChanges: boolean;
	message: string;
	title: string;
};

type ScenarioRunListItem = {
	completedAt: string;
	href: string;
	metadata: string;
};

const getSkillDiffState = async (): Promise<SkillDiffState> => {
	const baseRef = getDefaultComparisonBaseRef();
	const result = await runCommand({
		command: [
			'git',
			'diff',
			'--quiet',
			'--exit-code',
			baseRef,
			'--',
			'packages/skills/skills',
		],
		cwd: repoRoot,
	});

	if (result.exitCode === 0 || result.exitCode === 1) {
		const hasChanges = result.exitCode === 1;
		return {
			baseRef,
			hasChanges,
			message: hasChanges
				? `Skills differ from ${baseRef}. Run a before/after comparison against ${baseRef}.`
				: `Skills match ${baseRef}. This will run the scenario without a diff to review.`,
			title: hasChanges ? `Skills changed from ${baseRef}` : 'No skill changes',
		};
	}

	return {
		baseRef,
		hasChanges: false,
		message: `Could not inspect skill diff against ${baseRef}. The scenario can still run without a comparison. ${result.stderr}`,
		title: 'Skill diff unavailable',
	};
};

const loadPlainRuns = async (
	scenarioId: string,
): Promise<SkillEvalManifest[]> => {
	const manifestFiles = (
		await listFilesRecursively(join(runsRoot, sanitizePathPart(scenarioId)))
	).filter((file) => file.endsWith('/manifest.json'));

	return Promise.all(
		manifestFiles.map((file) => readJson<SkillEvalManifest>(file)),
	);
};

const toRunListItems = ({
	comparisons,
	runs,
}: {
	comparisons: SkillEvalComparison[];
	runs: SkillEvalManifest[];
}) => {
	const items: ScenarioRunListItem[] = [
		...comparisons.map((comparison) => ({
			completedAt: comparison.completedAt,
			href: toComparisonUrl(comparison),
			metadata:
				comparison.runs && comparison.runs.length > 1
					? `${comparison.runs.length} comparison runs`
					: `${comparison.before.hash} -> ${comparison.after.hash}`,
		})),
		...runs.map((run) => ({
			completedAt: run.completedAt,
			href: `/runs/${encodeURIComponent(run.id)}/${encodeURIComponent(
				basename(run.runDir),
			)}`,
			metadata: run.skillSnapshot.hash,
		})),
	];

	return items.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
};

const ScenarioRuns = ({items}: {items: ScenarioRunListItem[]}) => {
	if (items.length === 0) {
		return <p className="text-sm text-zinc-500">No runs yet.</p>;
	}

	return (
		<div className="mt-3 grid">
			{items.map((item) => (
				<a
					className="flex items-center justify-between gap-4 border-t border-zinc-100 py-3 first:border-t-0 first:pt-0 last:pb-0"
					href={item.href}
					key={item.href}
				>
					<div>
						<h3 className="text-sm font-semibold text-zinc-800">
							{formatDate(item.completedAt)}
						</h3>
						<p className="mt-1 text-[0.8125rem] text-zinc-500">
							{item.metadata}
						</p>
					</div>
				</a>
			))}
		</div>
	);
};

const ScenarioPageScript = ({
	activeJob,
	baseRef,
}: {
	activeJob: Job | undefined;
	baseRef: string;
}) => (
	<script
		dangerouslySetInnerHTML={{
			__html: `
const button = document.getElementById('run-comparison');
const runCountSelect = document.getElementById('run-count');
const baseRefInput = document.getElementById('comparison-base-ref');
const panel = document.getElementById('active-job');
const log = document.getElementById('job-log');
const status = document.getElementById('job-status');
const runGroups = document.getElementById('run-groups');
const activeJobId = ${JSON.stringify(activeJob?.id ?? null)};
const defaultBaseRef = ${JSON.stringify(baseRef)};

const shouldStickToBottom = (element) =>
	element.scrollHeight - element.scrollTop - element.clientHeight < 8;

const formatLabel = (label) => label === 'before' ? 'Before' : 'After';
const createRunPanel = (runGroup, label) => {
	const run = runGroup[label];
	const section = document.createElement('section');
	section.className = 'min-w-0 rounded-xl border border-zinc-200 bg-white p-3';
	section.dataset.runLabel = label;

	const header = document.createElement('div');
	header.className = 'flex items-center justify-between gap-3';

	const title = document.createElement('h4');
	title.className = 'text-sm font-semibold';
	title.textContent = formatLabel(label);

	const pill = document.createElement('span');
	pill.className = 'rounded-full bg-zinc-50 px-2 py-1 text-xs text-zinc-500 data-[status=completed]:text-emerald-700 data-[status=failed]:text-red-700 data-[status=running]:text-yellow-700';
	pill.dataset.runStatus = label;
	pill.dataset.status = run.status;
	pill.textContent = run.message || run.status;

	header.append(title, pill);
	section.append(header);

	const pre = document.createElement('pre');
	pre.className = 'mt-3 max-h-70 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700';
	pre.dataset.runLog = label;
	pre.hidden = !run.logs?.length;
	pre.textContent = run.logs?.join('') || '';
	section.append(pre);
	pre.scrollTop = pre.scrollHeight;

	return section;
};

const createRunGroup = (runGroup, totalRuns) => {
	const section = document.createElement('section');
	section.className = 'min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-4';
	section.dataset.runIndex = String(runGroup.index);

	const title = document.createElement('h3');
	title.className = 'text-[0.9375rem] font-semibold';
	title.textContent = totalRuns > 1 ? 'Run #' + runGroup.index : 'Run';
	section.append(title);

	const grid = document.createElement('div');
	grid.className = 'mt-3 grid grid-cols-2 gap-3 max-lg:grid-cols-1';
	grid.append(createRunPanel(runGroup, 'before'), createRunPanel(runGroup, 'after'));
	section.append(grid);

	return section;
};

const updateRunPanel = (section, runGroup, label) => {
	const run = runGroup[label];
	const pill = section.querySelector('[data-run-status="' + label + '"]');
	const pre = section.querySelector('[data-run-log="' + label + '"]');
	const logText = run.logs?.join('') || '';

	pill.dataset.status = run.status;
	pill.textContent = run.message || run.status;

	if (pre.textContent !== logText) {
		const stickToBottom = shouldStickToBottom(pre);
		pre.textContent = logText;
		pre.hidden = !logText;

		if (stickToBottom) {
			pre.scrollTop = pre.scrollHeight;
		}
	}
};

const updateRunGroup = (section, runGroup, totalRuns) => {
	const title = section.querySelector('h3');
	title.textContent = totalRuns > 1 ? 'Run #' + runGroup.index : 'Run';
	updateRunPanel(section.querySelector('[data-run-label="before"]'), runGroup, 'before');
	updateRunPanel(section.querySelector('[data-run-label="after"]'), runGroup, 'after');
};

const createWaitingRunGroups = (runCount) => Array.from({length: runCount}, (_, index) => ({
	index: index + 1,
	before: {logs: [], message: 'Waiting to start', status: 'waiting'},
	after: {logs: [], message: 'Waiting to start', status: 'waiting'},
}));

const renderRunGroups = (runs) => {
	const runList = runs || [];
	const seen = new Set();

	for (const runGroup of runList) {
		const key = String(runGroup.index);
		let section = runGroups.querySelector('[data-run-index="' + key + '"]');

		if (!section) {
			section = createRunGroup(runGroup, runList.length);
			runGroups.append(section);
			for (const pre of section.querySelectorAll('[data-run-log]')) {
				pre.scrollTop = pre.scrollHeight;
			}
		} else {
			updateRunGroup(section, runGroup, runList.length);
		}

		seen.add(key);
	}

	for (const section of [...runGroups.querySelectorAll('[data-run-index]')]) {
		if (!seen.has(section.dataset.runIndex)) {
			section.remove();
		}
	}
};

const renderJob = (job) => {
	panel.hidden = false;
	status.textContent = job.message || job.status;

	if (job.logs?.length) {
		log.hidden = false;
		log.textContent = job.logs.join('');
		log.scrollTop = log.scrollHeight;
	}

	renderRunGroups(job.runs);
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

	if (job.status === 'completed') {
		button.disabled = false;
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
	renderRunGroups(createWaitingRunGroups(Number(runCountSelect.value)));
	const beforeGitRef = baseRefInput?.value?.trim() || defaultBaseRef;
	const shouldCompare = button.dataset.hasSkillChanges === 'true' || beforeGitRef !== defaultBaseRef;
	const targetUrl = new URL(shouldCompare ? button.dataset.compareUrl : button.dataset.runUrl, location.origin);
	targetUrl.searchParams.set('runs', runCountSelect.value);
	const response = await fetch(targetUrl.pathname + targetUrl.search, {
		body: shouldCompare ? JSON.stringify({beforeGitRef}) : undefined,
		headers: shouldCompare ? {'content-type': 'application/json'} : undefined,
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
	<section
		className="min-w-0 rounded-xl border border-zinc-200 bg-white p-3"
		data-run-label={label}
	>
		<div className="flex items-center justify-between gap-3">
			<h4 className="text-sm font-semibold">{formatRunLabel(label)}</h4>
			<span
				className="rounded-full bg-zinc-50 px-2 py-1 text-xs text-zinc-500 data-[status=completed]:text-emerald-700 data-[status=failed]:text-red-700 data-[status=running]:text-yellow-700"
				data-run-status={label}
				data-status={jobRun.status}
			>
				{jobRun.message}
			</span>
		</div>
		<pre
			className="mt-3 max-h-70 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700"
			data-run-log={label}
			hidden={jobRun.logs.length === 0}
		>
			{jobRun.logs.join('')}
		</pre>
	</section>
);

const RunProgressGroup = ({
	runCount,
	runGroup,
}: {
	runCount: number;
	runGroup: JobRunGroup;
}) => (
	<section
		className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
		data-run-index={runGroup.index}
	>
		<h3 className="text-[0.9375rem] font-semibold">
			{runCount > 1 ? `Run #${runGroup.index}` : 'Run'}
		</h3>
		<div className="mt-3 grid grid-cols-2 gap-3 max-lg:grid-cols-1">
			<RunProgressCard jobRun={runGroup.before} label="before" />
			<RunProgressCard jobRun={runGroup.after} label="after" />
		</div>
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
	const runCount = job?.runCount ?? runs.length;

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
						? `Before and after run in parallel once the skill diff is ready${
								job && job.runCount > 1 ? ` (${job.runCount} runs).` : '.'
							}`
						: `Scenario run without a before/after comparison${
								job && job.runCount > 1 ? ` (${job.runCount} runs).` : '.'
							}`}
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
			<div className="mt-3 grid gap-3" id="run-groups">
				{runs.map((runGroup) => (
					<RunProgressGroup
						key={runGroup.index}
						runCount={runCount}
						runGroup={runGroup}
					/>
				))}
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
	const runs = await loadPlainRuns(scenario.id);
	const runItems = toRunListItems({comparisons, runs});

	return page({
		children: (
			<>
				<Header
					action={
						<div className="flex flex-wrap items-center gap-2">
							<label
								className="text-[0.8125rem] font-medium text-zinc-500"
								htmlFor="run-count"
							>
								Runs
							</label>
							<select
								className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-zinc-700"
								defaultValue="1"
								id="run-count"
							>
								{[1, 2, 3, 4].map((runCount) => (
									<option key={runCount} value={runCount}>
										{runCount}
									</option>
								))}
							</select>
							<button
								className="rounded-full bg-zinc-900 px-3 py-2 text-[0.8125rem] font-semibold text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
								data-compare-url={`/api/compare/${encodeURIComponent(scenario.id)}`}
								data-has-skill-changes={String(skillDiffState.hasChanges)}
								data-run-url={`/api/run/${encodeURIComponent(scenario.id)}`}
								data-scenario={scenario.id}
								id="run-comparison"
							>
								{skillDiffState.hasChanges ? 'Run comparison' : 'Run'}
							</button>
						</div>
					}
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
									{skillDiffState.title}
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
							{skillDiffState.hasChanges ? (
								<span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
									Compare against {skillDiffState.baseRef}
								</span>
							) : null}
						</div>
						<label className="mt-4 block max-w-sm text-sm font-medium text-zinc-700">
							Comparison base ref
							<input
								className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
								defaultValue={skillDiffState.baseRef}
								id="comparison-base-ref"
								name="comparison-base-ref"
								spellCheck={false}
							/>
						</label>
					</section>
					<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
						<summary className="cursor-pointer text-sm font-semibold">
							Prompt
						</summary>
						<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
							{scenario.prompt}
						</pre>
					</details>
					<ActiveJobPanel
						hasSkillChanges={skillDiffState.hasChanges}
						job={activeJob}
					/>
					<Card>
						<h2 className="text-[0.9375rem] font-semibold">Runs</h2>
						<ScenarioRuns items={runItems} />
					</Card>
				</main>
				<ScenarioPageScript
					activeJob={activeJob}
					baseRef={skillDiffState.baseRef}
				/>
			</>
		),
		title: scenario.id,
	});
};
