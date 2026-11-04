import type {SequenceNodePath, SequencePropsSubscriptionKey} from 'remotion';
import type {createCanvasDragPreview} from '../canvas-drag-preview';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	saveSequencePropsWithResult,
	type SaveSequencePropChange,
} from './save-sequence-prop';

type TimingOperation = 'move' | 'trim-start' | 'trim-end' | 'slip-source';
type PendingTimingEdit = {
	id: number;
	operation: TimingOperation;
	nodes: () => {absolutePath: string; nodePath: SequenceNodePath}[];
};
const pending = new Map<number, PendingTimingEdit>();
let nextId = 0;

export const getPendingTimelineTimingEdits = () =>
	[...pending.values()].map(({id, operation, nodes}) => ({
		id,
		operation,
		nodes: nodes(),
	}));

export const commitTimelineTimingEdit = async ({
	preview,
	changes,
	movedKeyframes,
	clientId,
	operation,
	undoLabel,
	redoLabel,
}: {
	preview: ReturnType<typeof createCanvasDragPreview>;
	changes: SaveSequencePropChange[];
	movedKeyframes: Parameters<
		typeof saveSequencePropsWithResult
	>[0]['movedKeyframes'];
	clientId: string;
	operation: TimingOperation;
	undoLabel: string;
	redoLabel: string;
}): Promise<{success: true} | {success: false; reason: string}> => {
	const id = nextId++;
	const nodes = [
		...new Map(
			[
				...changes,
				...(movedKeyframes?.sequenceKeyframes ?? []),
				...(movedKeyframes?.effectKeyframes ?? []),
			].map(({nodePath}) => [
				JSON.stringify([nodePath.absolutePath, nodePath.nodePath]),
				nodePath,
			]),
		).values(),
	];
	pending.set(id, {
		id,
		operation,
		nodes: () =>
			nodes.flatMap((node) => {
				const current = preview.getNodePath(node);
				return current
					? [{absolutePath: current.absolutePath, nodePath: current.nodePath}]
					: [];
			}),
	});
	try {
		const resolve = <
			T extends {nodePath: SequencePropsSubscriptionKey; fileName: string},
		>(
			change: T,
		): T => {
			const nodePath = preview.getNodePath(change.nodePath);
			if (nodePath === null)
				throw new Error(
					'The layer was removed before the edit could be saved.',
				);
			return {...change, nodePath, fileName: nodePath.absolutePath};
		};

		const response = await saveSequencePropsWithResult({
			addedKeyframes: null,
			changes: changes.map(resolve),
			movedKeyframes:
				movedKeyframes === null
					? null
					: {
							sequenceKeyframes: movedKeyframes.sequenceKeyframes.map(resolve),
							effectKeyframes: movedKeyframes.effectKeyframes.map(resolve),
						},
			setPropStatuses: preview.setPropStatuses,
			clientId,
			undoLabel,
			redoLabel,
		});
		if (response && !response.canUpdate) {
			throw new Error('The layer could not be updated. Try the edit again.');
		}

		preview.acknowledge(response);
		return {success: true};
	} catch (error) {
		preview.fail();
		const cause = error instanceof Error ? error.message : String(error);
		const action =
			operation === 'move'
				? 'move clip'
				: operation === 'slip-source'
					? 'adjust source start'
					: 'resize clip';
		const reason =
			/^(Failed to fetch|fetch failed|NetworkError when attempting to fetch resource\.?)$/i.test(
				cause,
			)
				? `Could not ${action}. Check your connection to Studio and try again.`
				: `Could not ${action}: ${cause}`;
		showNotification(reason, 4000);
		return {success: false, reason};
	} finally {
		pending.delete(id);
	}
};
