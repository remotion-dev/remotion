import type {OverrideIdToNodePaths, PropStatuses} from 'remotion';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';

export const loadKeyframeTrimConstraints = async ({
	propStatuses,
	overrideIdsToNodePaths,
}: {
	propStatuses: PropStatuses;
	overrideIdsToNodePaths: OverrideIdToNodePaths;
}): Promise<PropStatuses> => {
	const sources = new Map(
		Object.values(overrideIdsToNodePaths).flatMap((nodePath) => {
			const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
			return propStatuses[key]?.canUpdate ? [[key, nodePath] as const] : [];
		}),
	);
	if (sources.size === 0) return propStatuses;

	// Neither the parser nor source files are loaded during rendering or prop
	// subscription updates. Keep this snapshot local to the editing gesture.
	const browserOperations = getBrowserStudioOperations();
	const [codemods, files] = await Promise.all([
		import('@remotion/codemods'),
		Promise.all(
			[
				...new Set([...sources.values()].map((source) => source.absolutePath)),
			].map(async (fileName) => {
				if (browserOperations) {
					const contents = await browserOperations.getFileSource(fileName);
					if (contents === null) throw new Error(`Could not load ${fileName}`);
					return [fileName, contents] as const;
				}

				const response = await fetch(
					`/api/file-source?f=${encodeURIComponent(fileName)}`,
				);
				if (!response.ok) throw new Error(`Could not load ${fileName}`);
				return [fileName, await response.text()] as const;
			}),
		),
	]);
	const contentsByFile = new Map(files);
	const result = {...propStatuses};
	for (const [key, source] of sources) {
		const status = propStatuses[key];
		if (!status?.canUpdate) continue;
		result[key] = {
			...status,
			durationDependentKeyframes:
				codemods.CodemodsInternals.getDurationDependentKeyframesFromContent({
					fileContents: contentsByFile.get(source.absolutePath)!,
					nodePath: source.nodePath,
				}),
		};
	}

	return result;
};
