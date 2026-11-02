import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';

type CopiedNode = {absolutePath: string; nodePath: SequenceNodePath};
type DuplicationSelectionRequest = {
	compositionId: string;
	result: {mutationId: string; nodes: readonly CopiedNode[]} | null;
	mutations: {
		mutation: SequenceNodePathMutation;
		appliedBeforeRefresh: number | null;
		sharesEarlierRefresh: boolean;
	}[];
};

let compositionId: string | null = null;
let pending: DuplicationSelectionRequest | null = null;
let snapshot: {
	request: DuplicationSelectionRequest;
	compositionId: string;
	nodes: readonly CopiedNode[];
	refreshAfter: number;
} | null = null;
const listeners = new Set<() => void>();

export const cancelDuplicatedElementSelection = (
	request: DuplicationSelectionRequest | null,
) => {
	if (request === null || pending !== request) {
		return;
	}

	pending = null;
	snapshot = null;
	for (const listener of listeners) {
		listener();
	}
};

export const invalidateDuplicatedElementSelection = () =>
	cancelDuplicatedElementSelection(pending);

export const setDuplicationSelectionComposition = (id: string | null) => {
	if (compositionId !== id) {
		invalidateDuplicatedElementSelection();
		compositionId = id;
	}
};

export const beginDuplicatedElementSelection = () => {
	invalidateDuplicatedElementSelection();
	if (compositionId === null) {
		return null;
	}

	pending = {compositionId, result: null, mutations: []};
	return pending;
};

const publishSelection = () => {
	if (pending === null || pending.result === null) {
		return;
	}

	const ownIndex = pending.mutations.findIndex(
		({mutation}) => mutation.mutationId === pending?.result?.mutationId,
	);
	if (ownIndex === -1) {
		return;
	}

	let {nodes} = pending.result;
	let refreshAfter: number | null = null;
	let waitingForRefresh = false;
	for (let index = ownIndex; index < pending.mutations.length; index++) {
		const {mutation, appliedBeforeRefresh, sharesEarlierRefresh} =
			pending.mutations[index];
		const affectedFiles = new Set(
			mutation.files.map((file) => file.absolutePath),
		);
		if (
			index !== ownIndex &&
			!nodes.some((node) => affectedFiles.has(node.absolutePath))
		) {
			continue;
		}

		// The drain contains every queued edit, but the refresh may only render
		// its oldest one. Keep the existing selection when source identities from
		// a later edit could still refer to the previous occupant of that slot.
		if (sharesEarlierRefresh) {
			invalidateDuplicatedElementSelection();
			return;
		}

		waitingForRefresh ||= appliedBeforeRefresh === null;
		if (appliedBeforeRefresh !== null) {
			refreshAfter = Math.max(
				refreshAfter ?? appliedBeforeRefresh,
				appliedBeforeRefresh,
			);
		}

		if (index === ownIndex) {
			continue;
		}

		const byFile = new Map(
			mutation.files.map((file) => {
				const byPath = new Map<string, SequenceNodePath | null>();
				for (const mapping of file.remappings) {
					if (
						mapping.oldNodePath !== null &&
						!byPath.has(JSON.stringify(mapping.oldNodePath))
					) {
						byPath.set(
							JSON.stringify(mapping.oldNodePath),
							mapping.newNodePath,
						);
					}
				}

				return [file.absolutePath, byPath];
			}),
		);
		const remapped: CopiedNode[] = [];
		for (const node of nodes) {
			const byPath = byFile.get(node.absolutePath);
			let path = node.nodePath;
			for (let {length} = path; length > 0; length--) {
				const prefix = path.slice(0, length);
				// A JSX opening element identifies its containing element's descendants.
				const key = JSON.stringify(
					length === path.length ? prefix : [...prefix, 'openingElement'],
				);
				const mapped = byPath?.get(key);
				if (mapped === null) {
					invalidateDuplicatedElementSelection();
					return;
				}

				if (mapped !== undefined) {
					path =
						length === path.length
							? mapped
							: [...mapped.slice(0, -1), ...path.slice(length)];
					break;
				}
			}

			remapped.push({...node, nodePath: path});
		}

		nodes = remapped;
	}

	// Old siblings can reuse both the copied component's runtime ID and stack.
	// Only expose the targets after their source identities have been remapped.
	snapshot =
		waitingForRefresh || refreshAfter === null
			? null
			: {
					request: pending,
					compositionId: pending.compositionId,
					nodes,
					refreshAfter,
				};
	for (const listener of listeners) {
		listener();
	}
};

export const resolveDuplicatedElementSelection = (
	request: DuplicationSelectionRequest | null,
	mutationId: string,
	nodes: readonly CopiedNode[],
) => {
	if (request === null || pending !== request) {
		return;
	}

	request.result = {mutationId, nodes};
	publishSelection();
};

export const recordDuplicationSelectionMutation = (
	mutation: SequenceNodePathMutation,
) => {
	if (pending === null) {
		return;
	}

	pending.mutations.push({
		mutation,
		appliedBeforeRefresh: null,
		sharesEarlierRefresh: false,
	});
	publishSelection();
};

export const markDuplicationSelectionMutationsApplied = (
	mutations: readonly SequenceNodePathMutation[],
	fastRefreshes: number,
) => {
	if (pending === null) {
		return;
	}

	const positions = new Map(
		mutations.map((mutation, index) => [mutation.mutationId, index]),
	);
	for (const entry of pending.mutations) {
		const position = positions.get(entry.mutation.mutationId);
		if (position !== undefined) {
			entry.appliedBeforeRefresh = fastRefreshes;
			entry.sharesEarlierRefresh ||= position > 0;
		}
	}

	publishSelection();
};

export const getDuplicatedElementSelection = () => snapshot;
export const subscribeToDuplicatedElementSelection = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};
