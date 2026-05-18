import {getSkillEvalName} from '../eval';
import type {SkillEval} from '../manifest';
import {formatDate, Header, page, Pill} from './shared';

export type ShareResult = {
	evaluation: SkillEval;
	href: string;
};

const resultMetadata = (result: ShareResult) =>
	`${result.evaluation.scenarioId} - ${result.evaluation.runCount} ${
		result.evaluation.runCount === 1 ? 'run' : 'runs'
	}`;

const resultTitle = (result: ShareResult) =>
	getSkillEvalName(result.evaluation);

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
							key={result.href}
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
								<Pill>
									{result.evaluation.type === 'run'
										? 'Run eval'
										: 'Comparison eval'}
								</Pill>
							</div>
							<p className="mt-4 text-xs text-zinc-400">
								{formatDate(result.evaluation.completedAt)}
							</p>
						</a>
					))}
				</main>
			</>
		),
		renderOptions: {mode: 'static'},
		title: 'Skills Eval Share',
	});
