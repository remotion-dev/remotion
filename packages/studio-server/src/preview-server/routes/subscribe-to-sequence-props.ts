import path from 'node:path';
import type {
	SubscribeToSequencePropsBatchRequest,
	SubscribeToSequencePropsBatchResponse,
} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import type {ApiHandler} from '../api-types';
import {subscribeToSequencePropsWatchers} from '../sequence-props-watchers';
import {resolveSequencePropsNodePathsFromFilename} from './can-update-sequence-props';

export const subscribeToSequenceProps: ApiHandler<
	SubscribeToSequencePropsBatchRequest,
	SubscribeToSequencePropsBatchResponse
> = ({input, remotionRoot, logLevel}) => {
	// Source contents are shared only within this synchronous subscription batch.
	const fileContentsCache = new Map<string, string>();
	const requestsByFile = new Map<string, number[]>();
	for (const [index, request] of input.requests.entries()) {
		const absolutePath = path.resolve(remotionRoot, request.fileName);
		const indexes = requestsByFile.get(absolutePath) ?? [];
		indexes.push(index);
		requestsByFile.set(absolutePath, indexes);
	}

	const results: SubscribeToSequencePropsBatchResponse['results'] = [];
	// Finish each file before moving on so large batches do not evict and
	// repeatedly parse the same source snapshot from the bounded AST cache.
	for (const indexes of requestsByFile.values()) {
		const unresolved = indexes
			.filter((index) => input.requests[index].nodePath === null)
			.map((index) => ({
				index,
				line: input.requests[index].line,
				column: input.requests[index].column,
			}));
		const resolvedNodePaths = new Map<number, SequenceNodePath>();
		if (unresolved.length > 0) {
			try {
				const nodePaths = resolveSequencePropsNodePathsFromFilename({
					fileName: input.requests[indexes[0]].fileName,
					targets: unresolved,
					remotionRoot,
					fileContentsCache,
				});
				for (const [index, nodePath] of nodePaths.entries()) {
					if (nodePath) {
						resolvedNodePaths.set(unresolved[index].index, nodePath);
					}
				}
			} catch {
				// Let each subscription produce its usual not-found response.
			}
		}

		for (const index of indexes) {
			const {
				fileName,
				line,
				column,
				nodePath,
				componentIdentity,
				keys,
				assetKeys,
				effects,
				clientId,
			} = input.requests[index];
			results[index] = subscribeToSequencePropsWatchers({
				fileName,
				line,
				column,
				nodePath,
				resolvedNodePath: resolvedNodePaths.get(index),
				componentIdentity,
				keys,
				assetKeys,
				effects,
				remotionRoot,
				clientId,

				logLevel,
				fileContentsCache,
			});
		}
	}

	return Promise.resolve({results});
};
