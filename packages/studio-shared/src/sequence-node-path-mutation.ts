import type {SequenceNodePath} from 'remotion';

export type SequenceNodePathRemapping = {
	/** `null` means the JSX node was inserted by this mutation. */
	oldNodePath: SequenceNodePath | null;
	/** `null` means the JSX node was deleted by this mutation. */
	newNodePath: SequenceNodePath | null;
	/** JSX tag before the mutation. Older mutation producers may omit it. */
	oldJsxName?: string | null;
	/** JSX tag after the mutation. Older mutation producers may omit it. */
	newJsxName?: string | null;
	sourceLocations?: {
		before: {line: number; column: number} | null;
		after: {line: number; column: number} | null;
	};
};

export type SequenceNodePathMutation = {
	mutationId: string;
	applyWithoutFastRefresh?: true;
	timelineSelection: {
		compositionId: string;
		absolutePath: string;
		nodePath: SequenceNodePath;
	} | null;
	files: Array<{
		absolutePath: string;
		remappings: SequenceNodePathRemapping[];
	}>;
};
