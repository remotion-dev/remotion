import type {SequenceNodePath} from 'remotion';

export type SequenceNodePathRemapping = {
	oldNodePath: SequenceNodePath;
	newNodePath: SequenceNodePath | null;
};

export type SequenceNodePathMutation = {
	mutationId: string;
	files: Array<{
		absolutePath: string;
		invalidatedNodePaths: SequenceNodePath[];
		remappings: SequenceNodePathRemapping[];
		restoredNodePaths: SequenceNodePath[];
	}>;
};
