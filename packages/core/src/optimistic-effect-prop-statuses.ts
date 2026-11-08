import type {SequencePropsSubscriptionKey} from './SequenceManager.js';
import type {CanUpdateSequencePropSource} from './use-schema.js';

type NodePath = SequencePropsSubscriptionKey;
type Props = Record<string, CanUpdateSequencePropSource>;

const nodes = new Map<string, Map<string, Props>>();
const listeners = new Set<(nodePath: NodePath) => void>();
const keyForNode = (nodePath: NodePath) =>
	JSON.stringify([nodePath.absolutePath, nodePath.nodePath]);

export const OptimisticEffectPropStatuses = {
	get: (nodePath: NodePath, id: string): Props | null =>
		nodes.get(keyForNode(nodePath))?.get(id) ?? null,
	set: (nodePath: NodePath, id: string, props: Props | null) => {
		const key = keyForNode(nodePath);
		const current = nodes.get(key);
		if ((current?.get(id) ?? null) === props) return;
		if (props === null) {
			current?.delete(id);
			if (current?.size === 0) nodes.delete(key);
		} else {
			const next = current ?? new Map<string, Props>();
			next.set(id, props);
			nodes.set(key, next);
		}

		for (const listener of listeners) listener(nodePath);
	},
	copy: (nodePath: NodePath, fromId: string, toId: string) => {
		const props = OptimisticEffectPropStatuses.get(nodePath, fromId);
		if (props === null) return;
		OptimisticEffectPropStatuses.set(nodePath, toId, props);
	},
	removeNode: (nodePath: NodePath) => {
		if (!nodes.delete(keyForNode(nodePath))) return;
		for (const listener of listeners) listener(nodePath);
	},
	remap: (
		remappings: readonly {oldNodePath: NodePath; nodePath: NodePath | null}[],
	) => {
		const moved = remappings.map(({oldNodePath, nodePath}) => ({
			oldNodePath,
			nodePath,
			props: nodes.get(keyForNode(oldNodePath)),
		}));
		for (const {oldNodePath} of moved) nodes.delete(keyForNode(oldNodePath));
		for (const {nodePath, props} of moved) {
			if (nodePath !== null && props) nodes.set(keyForNode(nodePath), props);
		}

		for (const {oldNodePath, nodePath} of moved) {
			for (const listener of listeners) listener(oldNodePath);
			if (nodePath !== null)
				for (const listener of listeners) listener(nodePath);
		}
	},
	clear: () => nodes.clear(),
	subscribe: (listener: (nodePath: NodePath) => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
};
