import type {SequenceNodePath} from 'remotion';

export type SequenceNodePathRemapping = {
	/** The edit only changes effects on a surviving JSX node. */
	effectsOnly?: true;
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
	/**
	 * Keyframe frame changes inside the node, so keyframe and easing
	 * selection can follow the same keyframes across undo and redo.
	 */
	keyframeEdits?: {
		key: string;
		/** Effect index for effect keyframes, `null` for sequence prop keyframes. */
		effectIndex: number | null;
		/** Frame in the pre-mutation file, `null` when the keyframe was added. */
		frame: number | null;
		/** Frame in the post-mutation file, `null` when the keyframe was removed. */
		movedTo: number | null;
	}[];
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
