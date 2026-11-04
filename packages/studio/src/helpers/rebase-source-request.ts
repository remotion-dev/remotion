import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';

type SourcePathProvenance = {
	appliedMutationIds: ReadonlySet<string>;
	uncertain: boolean;
};

const provenance = new WeakMap<SequenceNodePath, SourcePathProvenance>();
const indexes = new WeakMap<
	SequenceNodePathMutation,
	Map<string, Map<string, SequenceNodePath | null>>
>();
const locationFields = new Set([
	'nodePath',
	'sequenceNodePath',
	'targetSequenceNodePath',
	'targetNodePath',
	'sourceNodePaths',
	'insertedNodePath',
]);
const envelopes = new Set([
	'edits',
	'captionPatches',
	'addedKeyframes',
	'movedKeyframes',
	'sequenceKeyframes',
	'effectKeyframes',
	'nodes',
	'duplicatedNodes',
	'splitNodes',
	'sequences',
	'captionTarget',
	'results',
	'insertedEffect',
]);

// Only visit transport locations. Props, schemas, captions and effect configs
// can contain arbitrary objects that resemble a source location.
const mapSourcePaths = (
	value: unknown,
	map: (
		nodePath: SequenceNodePath,
		fileName: string | null,
	) => SequenceNodePath,
): unknown => {
	if (Array.isArray(value)) {
		const mapped = value.map((item) => mapSourcePaths(item, map));
		return mapped.every((item, index) => item === value[index])
			? value
			: mapped;
	}

	if (value === null || typeof value !== 'object') {
		return value;
	}

	const object = value as Record<string, unknown>;
	let result = object;
	for (const [key, child] of Object.entries(object)) {
		if (!locationFields.has(key) && !envelopes.has(key)) {
			continue;
		}

		const mapped =
			locationFields.has(key) &&
			Array.isArray(child) &&
			child.every(
				(part) => typeof part === 'string' || typeof part === 'number',
			)
				? map(
						child,
						typeof object.absolutePath === 'string'
							? object.absolutePath
							: typeof object.fileName === 'string'
								? object.fileName
								: null,
					)
				: mapSourcePaths(child, map);
		if (mapped !== child) {
			if (result === object) {
				result = {...object};
			}

			result[key] = mapped;
		}
	}

	return result;
};

export const markSourceRequestPaths = (
	value: unknown,
	mutations: readonly SequenceNodePathMutation[],
	uncertain: boolean,
): void => {
	const appliedMutationIds = new Set(
		mutations.map(({mutationId}) => mutationId),
	);
	mapSourcePaths(value, (nodePath) => {
		provenance.set(nodePath, {appliedMutationIds, uncertain});
		return nodePath;
	});
};

export const copySourcePathProvenance = (
	from: SequenceNodePath,
	to: SequenceNodePath,
) => {
	const source = provenance.get(from);
	if (source) {
		provenance.set(to, source);
	}
};

export const captureSourceRequest = (
	body: unknown,
	mutations: readonly SequenceNodePathMutation[],
): unknown => {
	const pendingIds = new Set(mutations.map(({mutationId}) => mutationId));
	const root = typeof window === 'undefined' ? '' : (window.remotion_cwd ?? '');
	const changedFiles = new Set(
		mutations.flatMap((mutation) =>
			mutation.files.map((file) =>
				normalizeSourceFileName(file.absolutePath, root),
			),
		),
	);
	return mapSourcePaths(body, (nodePath, fileName) => {
		const source = provenance.get(nodePath);
		if (
			source?.uncertain ||
			(!source &&
				changedFiles.size > 0 &&
				(fileName === null ||
					changedFiles.has(normalizeSourceFileName(fileName, root))))
		) {
			throw new Error(
				'The source changed while this control was loading. Wait for the preview to update, then try again.',
			);
		}

		const captured = [...nodePath];
		// Each queued action owns its snapshot. A later request cannot compact
		// provenance still needed by an earlier request using the same UI path.
		provenance.set(captured, {
			appliedMutationIds: new Set(
				[...(source?.appliedMutationIds ?? [])].filter((id) =>
					pendingIds.has(id),
				),
			),
			uncertain: false,
		});
		return captured;
	});
};

export const normalizeSourceFileName = (
	fileName: string,
	root: string,
): string => {
	const normalized = fileName.replace(/\\/g, '/');
	const absolute = /^(?:\/|[a-z]:\/)/i.test(normalized)
		? normalized
		: `${root.replace(/\\/g, '/')}/${normalized}`;
	const parts: string[] = [];
	for (const part of absolute.split('/')) {
		if (part === '.' || part === '') {
			continue;
		}

		if (part === '..') {
			parts.pop();
		} else {
			parts.push(part);
		}
	}

	const path = parts.join('/');
	return /^[a-z]:\//i.test(path) ? path.toLowerCase() : path;
};

export const rebaseSourceRequest = (
	body: unknown,
	mutations: readonly SequenceNodePathMutation[],
	allowUnmarkedPaths: boolean,
	root: string,
): unknown => {
	const relevantMutationIds = new Set(
		mutations.map(({mutationId}) => mutationId),
	);
	return mapSourcePaths(body, (originalPath, fileName) => {
		const source = provenance.get(originalPath);
		if (source?.uncertain || (!source && !allowUnmarkedPaths)) {
			throw new Error(
				'The source changed while this control was loading. Wait for the preview to update, then try again.',
			);
		}

		let nodePath = originalPath;
		const appliedMutationIds = new Set(
			[...(source?.appliedMutationIds ?? [])].filter((id) =>
				relevantMutationIds.has(id),
			),
		);
		for (const mutation of mutations) {
			if (appliedMutationIds.has(mutation.mutationId)) {
				continue;
			}

			let byFile = indexes.get(mutation);
			if (!byFile) {
				byFile = new Map();
				for (const file of mutation.files) {
					const indexedPaths = new Map<string, SequenceNodePath | null>();
					for (const remapping of file.remappings) {
						if (remapping.oldNodePath === null) {
							continue;
						}

						const key = JSON.stringify(remapping.oldNodePath);
						if (!indexedPaths.has(key)) {
							indexedPaths.set(key, remapping.newNodePath);
						}
					}

					byFile.set(
						normalizeSourceFileName(file.absolutePath, root),
						indexedPaths,
					);
				}

				indexes.set(mutation, byFile);
			}

			const byPath =
				fileName === null
					? null
					: byFile.get(normalizeSourceFileName(fileName, root));
			const nextPath = byPath?.get(JSON.stringify(nodePath));
			if (nextPath === null) {
				throw new Error(
					'This layer was removed before the edit could be saved. Undo its removal or select another layer.',
				);
			}

			if (nextPath !== undefined) {
				nodePath = nextPath;
			}

			appliedMutationIds.add(mutation.mutationId);
		}

		if (nodePath !== originalPath) {
			nodePath = [...nodePath];
			provenance.set(nodePath, {appliedMutationIds, uncertain: false});
		}

		return nodePath;
	});
};
