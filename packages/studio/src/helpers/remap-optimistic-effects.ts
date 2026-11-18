import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import {Internals} from 'remotion';

export const remapOptimisticEffects = (mutation: SequenceNodePathMutation) => {
	const byFile = new Map(
		mutation.files.map((file) => [
			file.absolutePath,
			new Map(
				file.remappings
					.filter((mapping) => mapping.oldNodePath !== null)
					.map((mapping) => [JSON.stringify(mapping.oldNodePath), mapping]),
			),
		]),
	);
	Internals.OptimisticEffects.remap(
		Internals.OptimisticEffects.getSnapshot().map((entry) => {
			const path = entry.nodePath.nodePath;
			const mappings = byFile.get(entry.nodePath.absolutePath);
			let oldLength = path.length;
			let remapping = mappings?.get(JSON.stringify(path));
			while (!remapping && oldLength > 1) {
				oldLength--;
				remapping = mappings?.get(
					JSON.stringify([...path.slice(0, oldLength - 1), 'openingElement']),
				);
			}

			return {
				oldNodePath: entry.nodePath,
				nodePath: !remapping
					? entry.nodePath
					: remapping.newNodePath === null
						? null
						: {
								...entry.nodePath,
								nodePath:
									oldLength === path.length
										? remapping.newNodePath
										: [
												...remapping.newNodePath.slice(0, -1),
												...path.slice(oldLength - 1),
											],
							},
			};
		}),
	);
};
