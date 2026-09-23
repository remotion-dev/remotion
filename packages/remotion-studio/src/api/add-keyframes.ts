import type {NextApiRequest, NextApiResponse} from 'next';
import {applyKeyframeCodemod} from '../../codemods/apply-keyframe-codemod';
import {updateSequenceKeypaths} from '../../codemods/update-sequence-keypaths';
import {broadcastMutation} from '../../mutations/broadcast-mutation';
import type {AddKeyframesResponse} from '../../types/api';

/**
 * POST /api/add-keyframes
 *
 * Body:
 * {
 *   filePath: string;
 *   elementId: string;
 *   propName: string;
 *   keyframe: {frame: number; value: any};
 * }
 *
 * Returns:
 * {
 *   success: boolean;
 *   updatedNodePath?: string; // New – path to the JSX element after codemod
 * }
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<AddKeyframesResponse>
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).end();
	}

	const {filePath, elementId, propName, keyframe} = req.body;

	// 1️⃣ Apply the keyframe codemod – this may rewrite the source (e.g. add useCurrentFrame)
	const codemodResult = await applyKeyframeCodemod({
		filePath,
		elementId,
		propName,
		keyframe,
	});

	// 2️⃣ Update the stored sequence node paths – this returns the *new* node path
	const updatedNodePath = await updateSequenceKeypaths({
		filePath,
		elementId,
	});

	// 3️⃣ Broadcast mutation so Studio can refresh its internal mapping
	if (updatedNodePath) {
		broadcastMutation('sequence-node-paths-remapped', {
			filePath,
			elementId,
			newNodePath: updatedNodePath,
		});
	}

	// 4️⃣ Respond to the client
	return res.status(200).json({
		success: true,
		updatedNodePath: updatedNodePath ?? undefined,
	});
}
