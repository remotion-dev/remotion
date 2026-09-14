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
	const requests = input.requests ?? [input];
	const unresolvedByFile = new Map<
		string,
		{index: number; line: number; column: number}[]
	>();
	for (const [index, request] of requests.entries()) {
		if (request.nodePath !== null) {
			continue;
		}

		const unresolved = unresolvedByFile.get(request.fileName) ?? [];
		unresolved.push({index, line: request.line, column: request.column});
		unresolvedByFile.set(request.fileName, unresolved);
	}

	const resolvedNodePaths = new Map<number, SequenceNodePath>();
	for (const [fileName, unresolved] of unresolvedByFile) {
		try {
			const nodePaths = resolveSequencePropsNodePathsFromFilename({
				fileName,
				targets: unresolved,
				remotionRoot,
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

	const results = requests.map(
		(
			{
				fileName,
				line,
				column,
				nodePath,
				componentIdentity,
				keys,
				assetKeys = [],
				effects,
				clientId,
				videoConfigValues,
			},
			index,
		) =>
			subscribeToSequencePropsWatchers({
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
				videoConfigValues,
				logLevel,
			}),
	);
	return Promise.resolve({
		...results[0],
		results,
	});
};
