import {randomUUID} from 'node:crypto';
import type {
	SequenceNodePathMutation,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import {getLiveEventsListener} from './live-events';

const mutationSessionId = randomUUID();
let mutationCounter = 0;

export const broadcastSequenceNodePathMutation = (
	files: Array<{
		absolutePath: string;
		remappings: SequenceNodePathRemapping[];
	}>,
	timelineSelection: SequenceNodePathMutation['timelineSelection'],
	applyWithoutFastRefresh = false,
): SequenceNodePathMutation => {
	mutationCounter++;
	const mutation: SequenceNodePathMutation = {
		mutationId: `${mutationSessionId}:${mutationCounter}`,
		...(applyWithoutFastRefresh ? {applyWithoutFastRefresh: true} : {}),
		timelineSelection,
		files,
	};

	getLiveEventsListener()?.sendEventToClient({
		type: 'sequence-node-paths-remapped',
		mutation,
	});

	return mutation;
};
