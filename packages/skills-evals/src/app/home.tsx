import {scenarios, type SkillEvalScenario} from '../../scenarios';
import type {SkillEvalComparison} from '../manifest';
import {getLatestComparisonByScenario} from './comparison-data';
import {formatDate, page, Pill} from './shared';

const ScenarioCard = ({
	latest,
	scenario,
}: {
	latest: SkillEvalComparison | undefined;
	scenario: SkillEvalScenario;
}) => (
	<a
		className="block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-[0_12px_30px_rgba(24,24,27,0.06)]"
		href={`/scenarios/${encodeURIComponent(scenario.id)}`}
	>
		<div className="flex items-start justify-between gap-3">
			<div className="min-w-0">
				<h2 className="text-[0.9375rem] font-semibold">{scenario.id}</h2>
				<p className="text-sm text-zinc-500">{scenario.model}</p>
			</div>
			<Pill>{latest ? 'Ready' : 'New'}</Pill>
		</div>
		<p className="mt-4 text-xs text-zinc-400">
			{latest
				? `Last run ${formatDate(latest.completedAt)}`
				: 'No comparisons yet.'}
		</p>
	</a>
);

export const renderHome = async () => {
	const latest = await getLatestComparisonByScenario();

	return page({
		children: (
			<>
				<main className="grid gap-4">
					<section className="max-w-3xl">
						<h2 className="text-sm font-semibold text-zinc-700">Workflow</h2>
						<p className="mt-1 text-sm leading-6 text-zinc-500">
							When skills match HEAD, run a scenario as visual validation. When
							you have local skill changes, run a comparison to see how those
							changes affect the resulting videos.
						</p>
					</section>
					<section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
						{scenarios.map((scenario) => (
							<ScenarioCard
								key={scenario.id}
								latest={latest.get(scenario.id)}
								scenario={scenario}
							/>
						))}
					</section>
				</main>
			</>
		),
		title: 'Remotion Skills Evals',
	});
};
