import {readFileSync} from 'node:fs';
import {canPrecomposeJsxNodes, precomposeJsxNodes} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	PrecomposeJsxNodesRequest,
	PrecomposeJsxNodesResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const precomposeJsxNodesHandler: ApiHandler<
	PrecomposeJsxNodesRequest,
	PrecomposeJsxNodesResponse
> = ({
	input: {
		nodes,
		dryRun,
		compositionFile,
		compositionId,
		metadata,
		existingCompositionIds,
	},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue((): Promise<PrecomposeJsxNodesResponse> => {
		try {
			if (nodes.length === 0) {
				throw new Error('No JSX sequences were selected');
			}

			const resolved = nodes.map(({fileName, nodePath}) => ({
				...resolveFileInsideProject({
					remotionRoot,
					fileName,
					action: 'modify',
				}),
				nodePath,
			}));
			const {absolutePath} = resolved[0];
			if (resolved.some((node) => node.absolutePath !== absolutePath)) {
				throw new Error('Selected sequences must be in the same source file');
			}

			const registration = resolveFileInsideProject({
				remotionRoot,
				fileName: compositionFile,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const registrationContents =
				registration.absolutePath === absolutePath
					? fileContents
					: readFileSync(registration.absolutePath, 'utf-8');
			const files = {
				[absolutePath]: fileContents,
				[registration.absolutePath]: registrationContents,
			};
			const project = {files, rootDir: remotionRoot};
			const codemodInput = {
				project,
				nodes: resolved.map(({nodePath}) => ({
					filePath: absolutePath,
					nodePath,
				})),
				compositionFile: registration.absolutePath,
				compositionId,
				metadata,
				existingCompositionIds,
			};
			const eligibility = canPrecomposeJsxNodes(codemodInput);
			if (dryRun) {
				return Promise.resolve({
					success: true,
					...eligibility,
					nodePathMutation: null,
				});
			}

			if (!eligibility.canPrecompose) {
				throw new Error(
					eligibility.reason ?? 'Cannot pre-compose this selection',
				);
			}

			const result = precomposeJsxNodes(codemodInput);
			const changes = [...result.changes].sort(
				(a, b) =>
					Number(b.filePath === absolutePath) -
					Number(a.filePath === absolutePath),
			);
			if (
				!changes.some(({filePath}) => filePath === absolutePath) ||
				!changes.some(({filePath}) => filePath === registration.absolutePath)
			) {
				throw new Error('Could not pre-compose selected sequences');
			}

			for (const change of changes) {
				if (
					!Object.hasOwn(files, change.filePath) ||
					change.previousContents !== files[change.filePath] ||
					change.nextContents === null ||
					readFileSync(change.filePath, 'utf-8') !== change.previousContents
				) {
					throw new Error('Source changed before applying pre-compose');
				}
			}

			const remappingsByFile = changes.map(({filePath}) => ({
				absolutePath: filePath,
				remappings: result.nodePathRemappings
					.filter((remapping) => remapping.filePath === filePath)
					.map(({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath})),
			}));
			const mutationFiles = remappingsByFile.filter(
				({remappings}) => remappings.length > 0,
			);
			const nodePathMutation =
				mutationFiles.length === 0
					? null
					: broadcastSequenceNodePathMutation(mutationFiles, null);
			pushTransactionToUndoStack({
				snapshots: changes.map((change) => {
					const remappings = remappingsByFile.find(
						({absolutePath: filePath}) => filePath === change.filePath,
					)?.remappings;
					return {
						filePath: change.filePath,
						oldContents: change.previousContents,
						newContents: change.nextContents,
						logLine: change.filePath === absolutePath ? result.logLine : 1,
						nodePathRemappings:
							remappings && remappings.length > 0 ? remappings : null,
					};
				}),
				logLevel,
				remotionRoot,
				description: {
					undoMessage: '↩️  Pre-compose sequences',
					redoMessage: '↪️  Pre-compose sequences',
				},
				entryType: 'precompose-jsx-nodes',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation: null,
			});
			for (const change of changes) {
				const output = change.nextContents;
				if (output === null) {
					throw new Error('Could not write a pre-composed source file');
				}

				suppressUndoStackInvalidation(change.filePath);
				writeFileAndNotifyFileWatchers({
					file: change.filePath,
					content: output,
					originatorClientId: undefined,
					metadata: remappingsByFile.some(
						({absolutePath: filePath, remappings}) =>
							filePath === change.filePath && remappings.length > 0,
					)
						? {skipSequencePropsUpdate: true}
						: null,
				});
			}

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: result.logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Pre-composed ${nodes.length} sequence${nodes.length === 1 ? '' : 's'}`,
			);
			for (const change of changes) {
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[precompose-jsx-nodes] Wrote ${
						resolveFileInsideProject({
							remotionRoot,
							fileName: change.filePath,
							action: 'modify',
						}).fileRelativeToRoot
					}`,
				);
			}

			printUndoHint(logLevel);
			return Promise.resolve({success: true, ...eligibility, nodePathMutation});
		} catch (err) {
			return Promise.resolve({
				success: false,
				reason: (err as Error).message,
				stack: (err as Error).stack ?? '',
			});
		}
	});
