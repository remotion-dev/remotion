import {basename} from 'node:path';
import type {SkillEvalComparison, SkillEvalManifest} from '../manifest';
import {formatDate, Header, page, Pill} from './shared';

export type ShareRunResult = {
	href: string;
	manifest: SkillEvalManifest;
	type: 'run';
};

export type ShareComparisonResult = {
	comparison: SkillEvalComparison;
	href: string;
	type: 'comparison';
};

export type ShareResult = ShareComparisonResult | ShareRunResult;

const resultTitle = (result: ShareResult) =>
	result.type === 'run' ? result.manifest.id : result.comparison.scenarioId;

const resultDate = (result: ShareResult) =>
	result.type === 'run'
		? result.manifest.completedAt
		: result.comparison.completedAt;

const resultMetadata = (result: ShareResult) => {
	if (result.type === 'run') {
		return `${result.manifest.model} - ${result.manifest.skillSnapshot.hash}`;
	}

	return result.comparison.runs && result.comparison.runs.length > 1
		? `${result.comparison.runs.length} comparison runs`
		: `${result.comparison.before.hash} -> ${result.comparison.after.hash}`;
};

export const renderShareIndex = (results: ShareResult[]) =>
	page({
		children: (
			<>
				<Header
					eyebrow="Skills eval share"
					subtitle={`${results.length} ${
						results.length === 1 ? 'result' : 'results'
					} exported for review.`}
					title="Scenario results"
				/>
				<main className="grid gap-3">
					{results.map((result) => (
						<a
							className="block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300"
							href={result.href}
							key={`${result.type}:${result.href}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h2 className="text-[0.9375rem] font-semibold">
										{resultTitle(result)}
									</h2>
									<p className="mt-1 text-[0.8125rem] text-zinc-500">
										{resultMetadata(result)}
									</p>
								</div>
								<Pill>{result.type === 'run' ? 'Run' : 'Comparison'}</Pill>
							</div>
							<p className="mt-4 text-xs text-zinc-400">
								{formatDate(resultDate(result))}
							</p>
						</a>
					))}
				</main>
			</>
		),
		renderOptions: {mode: 'static'},
		title: 'Skills Eval Share',
	});

export const runShareHref = (manifest: SkillEvalManifest) =>
	`runs/${encodeURIComponent(manifest.id)}/${encodeURIComponent(
		basename(manifest.runDir),
	)}/`;

export const comparisonShareHref = (comparison: SkillEvalComparison) =>
	`comparisons/${encodeURIComponent(comparison.scenarioId)}/${encodeURIComponent(
		comparison.id,
	)}/`;
