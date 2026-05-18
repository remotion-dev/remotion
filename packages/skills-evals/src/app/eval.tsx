import {getSkillEvalName} from '../eval';
import {readJson} from '../files';
import type {SkillEval, SkillEvalManifest} from '../manifest';
import {
	getPreferredArtifact,
	loadComparison,
	type ComparisonWithManifests,
} from './comparison-data';
import {
	formatDate,
	formatDuration,
	getDurationMs,
	Header,
	page,
	Pill,
	type RenderOptions,
	ShareResultButton,
	ShareResultScript,
	toFileUrl,
} from './shared';

export type SkillEvalWithData =
	| {
			evaluation: Extract<SkillEval, {type: 'comparison'}>;
			comparisonData: ComparisonWithManifests;
			type: 'comparison';
	  }
	| {
			evaluation: Extract<SkillEval, {type: 'run'}>;
			manifests: SkillEvalManifest[];
			type: 'run';
	  };

export const loadSkillEvalData = async (
	evaluation: SkillEval,
): Promise<SkillEvalWithData | null> => {
	if (evaluation.type === 'run') {
		return {
			evaluation,
			manifests: await Promise.all(
				evaluation.runs.map((run) =>
					readJson<SkillEvalManifest>(run.manifestPath),
				),
			),
			type: 'run',
		};
	}

	const comparison = await readJson<ComparisonWithManifests['comparison']>(
		evaluation.comparisonPath,
	);
	const comparisonData = await loadComparison(
		comparison.scenarioId,
		comparison.id,
	);

	if (!comparisonData) {
		return null;
	}

	return {comparisonData, evaluation, type: 'comparison'};
};

const Artifact = ({
	manifest,
	renderOptions,
}: {
	manifest: SkillEvalManifest;
	renderOptions?: RenderOptions;
}) => {
	const artifact = getPreferredArtifact(manifest);

	if (!artifact) {
		return (
			<div className="grid aspect-video place-items-center rounded-xl bg-zinc-900 text-[0.8125rem] text-zinc-400">
				No visual artifact found
			</div>
		);
	}

	const href = toFileUrl(artifact.path, renderOptions);

	if (artifact.type === 'image') {
		return (
			<a href={href}>
				<img
					alt={artifact.relativePath}
					className="aspect-video w-full rounded-xl bg-zinc-900 object-contain"
					src={href}
				/>
			</a>
		);
	}

	return (
		<video
			className="aspect-video w-full rounded-xl bg-zinc-900 object-contain"
			controls
			preload="metadata"
			src={href}
		/>
	);
};

const PromptCard = ({prompt}: {prompt: string}) => (
	<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
		<summary className="cursor-pointer text-sm font-semibold">Prompt</summary>
		<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
			{prompt}
		</pre>
	</details>
);

const RunCard = ({
	label,
	manifest,
	renderOptions,
}: {
	label: string;
	manifest: SkillEvalManifest;
	renderOptions?: RenderOptions;
}) => {
	const artifact = getPreferredArtifact(manifest);

	return (
		<section className="rounded-2xl border border-zinc-200 bg-white p-3">
			<div className="mb-2 flex items-center justify-between gap-3">
				<div className="min-w-0">
					<h2 className="text-[0.9375rem] font-semibold">{label}</h2>
					<p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-500">
						{artifact?.relativePath ?? 'No artifact'}
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-3">
					<Pill>Took {formatDuration(getDurationMs(manifest))}</Pill>
					<a
						className="text-[0.8125rem] text-zinc-600"
						href={toFileUrl(manifest.pi.htmlExport, renderOptions)}
					>
						Pi export
					</a>
				</div>
			</div>
			<Artifact manifest={manifest} renderOptions={renderOptions} />
		</section>
	);
};

const RunEvalResults = ({
	evaluation,
	manifests,
	renderOptions,
}: {
	evaluation: Extract<SkillEval, {type: 'run'}>;
	manifests: SkillEvalManifest[];
	renderOptions?: RenderOptions;
}) => (
	<div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3">
		{manifests.map((manifest, index) => (
			<RunCard
				key={manifest.runDir}
				label={`Run #${
					manifest.evalRunIndex ?? evaluation.runs[index]?.index ?? index + 1
				}`}
				manifest={manifest}
				renderOptions={renderOptions}
			/>
		))}
	</div>
);

const ComparisonEvalResult = ({
	comparisonData,
	renderOptions,
}: {
	comparisonData: ComparisonWithManifests;
	renderOptions?: RenderOptions;
}) => (
	<div className="grid gap-4">
		{comparisonData.runs.map((run) => {
			const runMetadata = comparisonData.comparison.runs?.find(
				(candidate) => candidate.index === run.index,
			);
			const beforeMetadata =
				runMetadata?.before ?? comparisonData.comparison.before;

			return (
				<section className="grid min-w-0 gap-3" key={run.index}>
					{comparisonData.runs.length > 1 ? (
						<h2 className="text-[0.9375rem] font-semibold">Run #{run.index}</h2>
					) : null}
					<div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
						<RunCard
							label={`Before (${beforeMetadata.gitRef ?? beforeMetadata.source})`}
							manifest={run.beforeManifest}
							renderOptions={renderOptions}
						/>
						<RunCard
							label="After"
							manifest={run.afterManifest}
							renderOptions={renderOptions}
						/>
					</div>
				</section>
			);
		})}
	</div>
);

export const renderEval = (
	data: SkillEvalWithData,
	renderOptions?: RenderOptions,
) => {
	const {evaluation} = data;
	const evalName = getSkillEvalName(evaluation);
	const prompt =
		data.type === 'run'
			? data.manifests[0]?.prompt
			: data.comparisonData.afterManifest.prompt;

	return page({
		children: (
			<>
				<Header
					action={
						<div className="flex flex-wrap items-center gap-3">
							<Pill>{formatDate(evaluation.completedAt)}</Pill>
							{renderOptions?.mode === 'static' ? null : (
								<ShareResultButton
									endpoint={`/api/share/eval/${encodeURIComponent(
										evaluation.scenarioId,
									)}/${encodeURIComponent(evaluation.id)}`}
									label="Share eval"
								/>
							)}
						</div>
					}
					eyebrow="Eval"
					subtitle={`${evaluation.scenarioId} - ${
						evaluation.type === 'run' ? 'Run' : 'Comparison'
					} eval - ${evaluation.runCount} ${
						evaluation.runCount === 1 ? 'run' : 'runs'
					}`}
					title={evalName}
				/>
				<main className="grid min-w-0 gap-4">
					{data.type === 'run' ? (
						<RunEvalResults
							evaluation={data.evaluation}
							manifests={data.manifests}
							renderOptions={renderOptions}
						/>
					) : (
						<ComparisonEvalResult
							comparisonData={data.comparisonData}
							renderOptions={renderOptions}
						/>
					)}
					{prompt ? <PromptCard prompt={prompt} /> : null}
				</main>
				{renderOptions?.mode === 'static' ? null : <ShareResultScript />}
			</>
		),
		renderOptions,
		title: evalName,
	});
};
