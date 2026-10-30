import {randomUUID} from 'node:crypto';
import type {
	SequenceNodePathMutation,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import {getLiveEventsListener} from './live-events';

const mutationSessionId = randomUUID();
let mutationCounter = 0;
const listeners = new Set<(mutation: SequenceNodePathMutation) => void>();

// Lets the render queue follow the target of a pending pre-render
export const subscribeToSequenceNodePathMutations = (
	listener: (mutation: SequenceNodePathMutation) => void,
) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

export const broadcastSequenceNodePathMutation = (
	files: Array<{
		absolutePath: string;
		remappings: SequenceNodePathRemapping[];
	}>,
	timelineSelection: SequenceNodePathMutation['timelineSelection'],
): SequenceNodePathMutation => {
	mutationCounter++;
	const mutation: SequenceNodePathMutation = {
		mutationId: `${mutationSessionId}:${mutationCounter}`,
		timelineSelection,
		files,
	};

	getLiveEventsListener()?.sendEventToClient({
		type: 'sequence-node-paths-remapped',
		mutation,
	});
	for (const listener of listeners) {
		listener(mutation);
	}

	return mutation;
};
