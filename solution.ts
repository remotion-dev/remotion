import type {Request, Response} from 'express';
import {updateSequenceKeyframes} from '../../core/sequence-keyframes';
import {broadcastMutation} from '../../core/mutations';

/**
 * Handles the `/api/add-keyframes` request.
 *
 * The original implementation applied the codemod that adds keyframes
 * but discarded the `updatedNodePath` returned by `updateSequenceKeyframes`.
 * This caused Remotion Studio to keep a stale JSX location after the first
 * keyframe edit (see issue #11542).
 *
 * The updated implementation now:
 *   1. Returns the `updatedNodePath` to the client.
 *   2. Broadcasts a `sequence-node-paths-remapped` mutation so that all
 *      Studio clients can update their internal state.
 */
export const addKeyframesHandler = async (req: Request, res: Response) => {
	const {
		compositionId,
		elementId,
		keyframes,
	} = req.body as {
		compositionId: string;
		elementId: string;
		keyframes: Record<string, unknown>;
	};

	// Apply the codemod that adds the keyframes.
	const result = await updateSequenceKeyframes({
		compositionId,
		elementId,
		keyframes,
	});

	if (!result.success) {
		// Propagate the error to the client.
		res.status(400).json({success: false, error: result.error});
		return;
	}

	// `result.updatedNodePath` is the new JSX location after the codemod.
	const {updatedNodePath} = result;

	// Notify all connected Studio clients that the node paths have changed.
	// This mutation is listened to by the Studio UI to refresh its internal
	// representation of the composition tree.
	broadcastMutation('sequence-node-paths-remapped', {
		compositionId,
		elementId,
		updatedNodePath,
	});

	// Return the new path to the caller so that subsequent edits can use it.
	res.json({
		success: true,
		updatedNodePath,
	});
};
