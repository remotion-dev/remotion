import type {SequenceNodePath} from 'remotion';

export type SequenceNodePathRemapping = {
	/** `null` means the JSX node was inserted by this mutation. */
	oldNodePath: SequenceNodePath | null;
	/** `null` means the JSX node was deleted by this mutation. */
	newNodePath: SequenceNodePath | null;
};

export type SequenceNodePathMutation = {
	mutationId: string;
	files: Array<{
		absolutePath: string;
		remappings: SequenceNodePathRemapping[];
	}>;
};
