import {readFileSync} from 'node:fs';
import {deleteEffects} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteEffectRequest,
	DeleteEffectResponse,
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
import {strikeThroughOrRemovedPrefix} from './log-updates/formatting';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

const getDeletedEffectDescription = (effectLabels: string[]): string => {
	if (effectLabels.length === 1) {
		return effectLabels[0];
	}

	return `${effectLabels.length} effects`;
};

export const deleteEffectHandler: ApiHandler<
	DeleteEffectRequest,
	DeleteEffectResponse
> = ({input: effects, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			if (effects.length === 0) {
				throw new Error('No effects were specified for deletion');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[delete-effect] Received request to delete ${effects.length} effect target${effects.length === 1 ? '' : 's'}`,
			);

			const itemsByFileName = new Map<string, typeof effects>();
			for (const item of effects) {
				const fileItems = itemsByFileName.get(item.fileName) ?? [];
				fileItems.push(item);
				itemsByFileName.set(item.fileName, fileItems);
			}

			const preparedUpdates = await Promise.all(
				[...itemsByFileName.entries()].map(async ([fileName, fileItems]) => {
					const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
						remotionRoot,
						fileName,
						action: 'modify',
					});

					const fileContents = readFileSync(absolutePath, 'utf-8');
					const result = await deleteEffects({
						project: {
							files: {[absolutePath]: fileContents},
							rootDir: remotionRoot,
						},
						effects: fileItems.map((item) => ({
							filePath: absolutePath,
							nodePath: item.sequenceNodePath.nodePath,
							effectIndex:
								item.type === 'all-effects' ? null : item.effectIndex,
						})),
					});
					const output = result.changes[0]?.nextContents ?? fileContents;
					const {formatted, effectLabels, logLines} = result.editDetails[0];

					return {
						absolutePath,
						nodePathRemappings: result.nodePathRemappings,
						fileRelativeToRoot,
						fileContents,
						output,
						formatted,
						effectLabels,
						logLine: Math.min(...logLines),
					};
				}),
			);

			const updates = preparedUpdates.filter(
				(update) => update.output !== update.fileContents,
			);
			if (updates.length === 0) {
				return {success: true, nodePathMutation: null};
			}

			const nodePathMutation = broadcastSequenceNodePathMutation(
				updates.map((update) => ({
					absolutePath: update.absolutePath,
					remappings: update.nodePathRemappings,
				})),
				null,
			);

			const effectDescription = getDeletedEffectDescription(
				updates.flatMap((update) => update.effectLabels),
			);
			pushTransactionToUndoStack({
				snapshots: updates.map((update) => ({
					filePath: update.absolutePath,
					oldContents: update.fileContents,
					newContents: update.output,
					logLine: update.logLine,
					nodePathRemappings: update.nodePathRemappings,
				})),
				logLevel,
				remotionRoot,
				description: {
					undoMessage: `↩️  Deletion of ${effectDescription}`,
					redoMessage: `↪️  Deletion of ${effectDescription}`,
				},
				entryType: 'delete-effect',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation: null,
			});

			for (const update of updates) {
				const deletedEffectDescription = getDeletedEffectDescription(
					update.effectLabels,
				);

				suppressUndoStackInvalidation(update.absolutePath);
				writeFileAndNotifyFileWatchers({
					file: update.absolutePath,
					content: update.output,
					originatorClientId: undefined,
					metadata: {skipSequencePropsUpdate: true},
				});

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: update.absolutePath,
					line: update.logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} ${strikeThroughOrRemovedPrefix(deletedEffectDescription)}`,
				);
				if (!update.formatted) {
					warnAboutPrettierOnce(logLevel);
				}

				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[delete-effect] Wrote ${update.fileRelativeToRoot}${update.formatted ? ' (formatted)' : ''}`,
				);
			}

			printUndoHint(logLevel);

			return {
				success: true,
				nodePathMutation,
			};
		} catch (err) {
			return {
				success: false,
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});
};
