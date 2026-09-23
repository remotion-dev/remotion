import type { NextApiRequest, NextApiResponse } from 'next';
import { updateSequenceKeyframes } from '../../src/server/sequence';
import { pubsub } from '../../src/graphql/pubsub';
import { SEQUENCE_NODE_PATHS_REMAP_EVENT } from '../../src/graphql/subscriptions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { compositionId, keyframes, nodePath } = req.body;

    // Update the keyframes and get the updated node path
    const updatedNodePath = await updateSequenceKeyframes(
      compositionId,
      keyframes,
      nodePath
    );

    // Broadcast the remapped node path to Studio clients
    pubsub.publish(SEQUENCE_NODE_PATHS_REMAP_EVENT, {
      sequenceNodePathsRemapped: {
        compositionId,
        updatedNodePath,
      },
    });

    // Return the updated node path so the client can update its local state
    res.status(200).json({
      success: true,
      updatedNodePath,
    });
  } catch (error) {
    console.error('Error adding keyframes:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
}
