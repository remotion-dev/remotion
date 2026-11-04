import path from 'node:path';
import type {
	SubscribeToSequencePropsBatchRequest,
	SubscribeToSequencePropsBatchResponse,
} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import type {ApiHandler} from '../api-types';
import {resolveCompiledSequencePaths} from '../resolve-compiled-sequence-paths';
import {subscribeToSequencePropsWatchers} from '../sequence-props-watchers';
import {invalidatePreviouslySuppressedFiles} from '../watch-ignore-next-change';
import {resolveSequencePropsNodePathsFromFilename} from './can-update-sequence-props';

export const subscribeToSequenceProps: ApiHandler<
	SubscribeToSequencePropsBatchRequest,
	SubscribeToSequencePropsBatchResponse
> = async ({input, remotionRoot, logLevel}) => {
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
	const staleFiles = new Set<string>();
	for (const [absolutePath, indexes] of requestsByFile) {
		const unresolved: {index: number; line: number; column: number}[] = [];
		const compiledTargets: ((typeof unresolved)[number] & {hash: string})[] =
			[];
		for (const index of indexes) {
			const {line, column, nodePath} = input.requests[index];
			if (nodePath !== null) continue;
			const hash = input.compiledSourceHashes?.[index] ?? null;
			if (hash === null) unresolved.push({index, line, column});
			else compiledTargets.push({index, line, column, hash});
		}

		let compiledPaths = new Map<number, SequenceNodePath | null>();
		if (compiledTargets.length > 0) {
			try {
				compiledPaths = resolveCompiledSequencePaths({
					fileName: input.requests[indexes[0]].fileName,
					remotionRoot,
					fileContentsCache,
					targets: compiledTargets,
				});
			} catch {
				// An unavailable or unparsable source cannot be safely located in a newer file.
			}
		}

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
			const requireExactNodePath =
				nodePath === null &&
				(input.compiledSourceHashes?.[index] ?? null) !== null;
			const result = subscribeToSequencePropsWatchers({
				fileName,
				line,
				column,
				nodePath: requireExactNodePath
					? (compiledPaths.get(index) ?? null)
					: nodePath,
				requireExactNodePath,
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
			results[index] = result;
			if (
				requireExactNodePath &&
				!result.success &&
				result.status.reason === 'not-found'
			) {
				staleFiles.add(absolutePath);
			}
		}
	}

	await Promise.all(
		[...staleFiles].map((file) => invalidatePreviouslySuppressedFiles(file)),
	);
	return {results};
};
