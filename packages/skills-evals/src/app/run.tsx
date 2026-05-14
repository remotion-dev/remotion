import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {readJson, sanitizePathPart} from '../files';
import type {SkillEvalManifest} from '../manifest';
import {getPreferredArtifact} from './comparison-data';
import {Card, Header, page, runsRoot, toFileUrl} from './shared';

export const loadRun = async (scenarioId: string, runId: string) => {
	const manifestPath = join(
		runsRoot,
		sanitizePathPart(scenarioId),
		runId,
		'manifest.json',
	);

	if (!existsSync(manifestPath)) {
		return null;
	}

	const manifest = await readJson<SkillEvalManifest>(manifestPath);

	return manifest;
};

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

export const renderRun = (manifest: SkillEvalManifest) =>
	page({
		children: (
			<>
				<Header
					action={
						<div className="flex flex-wrap items-center gap-3">
							<a
								className="text-[0.8125rem] text-zinc-600"
								href={`/scenarios/${encodeURIComponent(manifest.id)}`}
							>
								Scenario
							</a>
							<a
								className="text-[0.8125rem] text-zinc-600"
								href={toFileUrl(manifest.pi.htmlExport)}
							>
								Pi export
							</a>
						</div>
					}
					eyebrow="Run"
					subtitle={manifest.model}
					title={manifest.id}
				/>
				<main className="grid min-w-0 gap-4">
					<Card>
						<Artifact manifest={manifest} />
					</Card>
					<details className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
						<summary className="cursor-pointer text-sm font-semibold">
							Prompt
						</summary>
						<pre className="mt-3 max-h-75 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-xs text-zinc-700">
							{manifest.prompt}
						</pre>
					</details>
				</main>
			</>
		),
		title: `${manifest.id} Run`,
	});
