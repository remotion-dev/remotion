import type {SkillEvalManifest} from '../manifest';
import {
	getPreferredArtifact,
	type ComparisonWithManifests,
} from './comparison-data';
import {formatDate, Header, page, Pill, toFileUrl} from './shared';

const Artifact = ({manifest}: {manifest: SkillEvalManifest}) => {
	const artifact = getPreferredArtifact(manifest);

	if (!artifact) {
		return (
			<div className="grid aspect-video place-items-center rounded-xl bg-zinc-900 text-[0.8125rem] text-zinc-400">
				No visual artifact found
			</div>
		);
	}

	const href = toFileUrl(artifact.path);

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

const RunPanel = ({
	label,
	manifest,
	manifestPath,
}: {
	label: string;
	manifest: SkillEvalManifest;
	manifestPath: string;
}) => {
	const artifact = getPreferredArtifact(manifest);

	return (
		<section className="rounded-2xl border border-zinc-200 bg-white p-3">
			<div className="mb-2 flex items-center justify-between gap-3">
				<h2 className="text-[0.9375rem] font-semibold">{label}</h2>
				<div className="flex flex-wrap items-center gap-3">
					<a
						className="text-[0.8125rem] text-zinc-600"
						href={toFileUrl(manifest.pi.htmlExport)}
					>
						Pi export
					</a>
					<a
						className="text-[0.8125rem] text-zinc-600"
						href={toFileUrl(manifestPath)}
					>
						Manifest
					</a>
				</div>
			</div>
			<Artifact manifest={manifest} />
			<div className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-500">
				{artifact?.relativePath ?? 'No artifact'}
			</div>
		</section>
	);
};

const ComparisonDiffScript = () => (
	<>
		<script src="https://cdn.jsdelivr.net/npm/diff@5/dist/diff.min.js" />
		<script
			dangerouslySetInnerHTML={{
				__html: `
(() => {
	const rawDiff = document.getElementById('raw-diff');
	const renderedDiff = document.getElementById('rendered-diff');

	if (!rawDiff || !renderedDiff || !window.Diff?.parsePatch) {
		return;
	}

	const patches = window.Diff.parsePatch(rawDiff.textContent || '');

	if (patches.length === 0) {
		return;
	}

	const lineClass = (line) => {
		if (line.startsWith('+')) {
			return 'bg-emerald-50 text-green-800';
		}

		if (line.startsWith('-')) {
			return 'bg-red-50 text-red-800';
		}

		return 'text-zinc-700';
	};

	renderedDiff.replaceChildren(
		...patches.map((patch) => {
			const file = document.createElement('section');
			file.className = 'border-t border-zinc-200 py-2 first:border-t-0';
			const header = document.createElement('div');
			header.className = 'px-3 pb-2 font-semibold text-zinc-800';
			header.textContent = patch.newFileName || patch.oldFileName || 'Diff';
			file.append(header);

			for (const hunk of patch.hunks) {
				const hunkHeader = document.createElement('div');
				hunkHeader.className = 'bg-zinc-100 px-3 py-0.5 text-zinc-500 whitespace-pre';
				hunkHeader.textContent = '@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@';
				file.append(hunkHeader);

				for (const line of hunk.lines) {
					const row = document.createElement('div');
					row.className = 'grid grid-cols-[22px_1fr] min-w-max px-3 whitespace-pre ' + lineClass(line);
					const prefix = document.createElement('span');
					prefix.className = 'text-zinc-400 select-none';
					prefix.textContent = line[0] || ' ';
					const content = document.createElement('span');
					content.textContent = line.slice(1);
					row.append(prefix, content);
					file.append(row);
				}
			}

			return file;
		}),
	);
	renderedDiff.hidden = false;
	rawDiff.hidden = true;
})();
`,
			}}
		/>
	</>
);

export const renderComparison = (comparisonData: ComparisonWithManifests) => {
	const {afterManifest, beforeManifest, comparison, skillDiff} = comparisonData;

	return page({
		children: (
			<>
				<Header
					action={
						<div className="flex flex-wrap items-center gap-3">
							<Pill>{formatDate(comparison.completedAt)}</Pill>
							<a
								className="text-[0.8125rem] text-zinc-600"
								href={`/scenarios/${encodeURIComponent(comparison.scenarioId)}`}
							>
								Scenario
							</a>
						</div>
					}
					eyebrow="Comparison"
					subtitle={beforeManifest.model}
					title={comparison.scenarioId}
				/>
				<main className="grid min-w-0 gap-4">
					<div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
						<RunPanel
							label="Before"
							manifest={beforeManifest}
							manifestPath={comparison.before.manifestPath}
						/>
						<RunPanel
							label="After"
							manifest={afterManifest}
							manifestPath={comparison.after.manifestPath}
						/>
					</div>
					<details
						className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4"
						open
					>
						<summary className="cursor-pointer text-sm font-semibold">
							Skill diff
						</summary>
						<div
							className="mt-3 max-h-130 max-w-full min-w-0 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 font-mono text-xs"
							hidden
							id="rendered-diff"
						/>
						<pre
							className="mt-3 max-h-130 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700"
							id="raw-diff"
						>
							{skillDiff}
						</pre>
					</details>
					<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
						<summary className="cursor-pointer text-sm font-semibold">
							Prompt
						</summary>
						<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
							{afterManifest.prompt}
						</pre>
					</details>
				</main>
				<ComparisonDiffScript />
			</>
		),
		title: `${comparison.scenarioId} Comparison`,
	});
};
