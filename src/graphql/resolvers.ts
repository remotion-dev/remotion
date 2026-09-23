import { SEQUENCE_NODE_PATHS_REMAP_EVENT } from './subscriptions';

export const resolvers = {
  Subscription: {
    sequenceNodePathsRemapped: {
      subscribe: () => pubsub.asyncIterator([SEQUENCE_NODE_PATHS_REMAP_EVENT]),
    },
  },
};
