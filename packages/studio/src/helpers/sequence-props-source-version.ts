import type {SourceFileVersion} from '@remotion/studio-shared';
import type {ContextType} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {clearPendingSequenceSplits} from '../components/Timeline/pending-sequence-splits';

type Setters = ContextType<typeof Internals.VisualModeSettersContext>;
const versions = new WeakMap<
	Setters['updateDragOverrides'],
	{
		sessionId: string;
		nodes: Map<string, number>;
	}
>();

let sourceSessionId: string | null = null;

export const getSequencePropsSourceSession = () => sourceSessionId;
export const setSequencePropsSourceSession = (sessionId: string | null) => {
	if (sourceSessionId !== sessionId) {
		Internals.OptimisticEffectDeletion.clear();
		clearPendingSequenceSplits();
	}

	sourceSessionId = sessionId;
};

// Only the connection's init handshake establishes a source session. Neither a
// late HTTP acknowledgement nor a delayed notification can switch it back.
export const acceptSequencePropsSourceVersion = (
	updateDragOverrides: Setters['updateDragOverrides'],
	nodePath: SequencePropsSubscriptionKey,
	version: SourceFileVersion | null,
) => {
	if (version === null) return true;
	if (version.sessionId !== sourceSessionId) return false;
	let state = versions.get(updateDragOverrides);
	if (!state || state.sessionId !== sourceSessionId) {
		state = {sessionId: version.sessionId, nodes: new Map()};
		versions.set(updateDragOverrides, state);
	}

	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const previous = state.nodes.get(key);
	if (previous !== undefined && previous > version.revision) return false;
	state.nodes.set(key, version.revision);
	return true;
};
