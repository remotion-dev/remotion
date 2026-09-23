import request from 'supertest';
import app from '../../src/app'; // Next.js API handler wrapper
import { updateSequenceKeyframes } from '../../src/server/sequence';
import { pubsub } from '../../src/graphql/pubsub';
import { SEQUENCE_NODE_PATHS_REMAP_EVENT } from '../../src/graphql/subscriptions';

jest.mock('../../src/server/sequence');
jest.mock('../../src/graphql/pubsub');

describe('POST /api/add-keyframes', () => {
  const mockUpdatedNodePath = 'new/path/to/node';

  beforeEach(() => {
    (updateSequenceKeyframes as jest.Mock).mockResolvedValue(mockUpdatedNodePath);
  });

  it('returns success and updatedNodePath, and publishes remap event', async () => {
    const res = await request(app)
      .post('/api/add-keyframes')
      .send({
        compositionId: 'comp1',
        keyframes: [{ frame: 0, value: '#fff' }],
        nodePath: 'old/path',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      updatedNodePath: mockUpdatedNodePath,
    });

    expect(pubsub.publish).toHaveBeenCalledWith(
      SEQUENCE_NODE_PATHS_REMAP_EVENT,
      {
        sequenceNodePathsRemapped: {
          compositionId: 'comp1',
          updatedNodePath: mockUpdatedNodePath,
        },
      }
    );
  });

  it('handles errors', async () => {
    (updateSequenceKeyframes as jest.Mock).mockRejectedValue(
      new Error('boom')
    );

    const res = await request(app)
      .post('/api/add-keyframes')
      .send({
        compositionId: 'comp1',
        keyframes: [],
        nodePath: 'old/path',
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'boom',
    });
  });
});
