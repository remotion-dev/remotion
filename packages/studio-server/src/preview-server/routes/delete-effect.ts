import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteEffectRequest,
	DeleteEffectResponse,
} from '@remotion/studio-shared';
import {deleteEffects} from '../../codemods/delete-effect';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {strikeThroughOrRemovedPrefix} from './log-updates/formatting';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

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

			const updates = await Promise.all(
				[...itemsByFileName.entries()].map(async ([fileName, fileItems]) => {
					const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
						remotionRoot,
						fileName,
						action: 'modify',
					});

					const fileContents = readFileSync(absolutePath, 'utf-8');
					const {output, formatted, effectLabels, logLines} =
						await deleteEffects({
							input: fileContents,
							effects: fileItems.map((item) =>
								item.type === 'single-effect'
									? {
											type: 'single-effect',
											sequenceNodePath: item.sequenceNodePath.nodePath,
											effectIndex: item.effectIndex,
										}
									: {
											type: 'all-effects',
											sequenceNodePath: item.sequenceNodePath.nodePath,
										},
							),
						});

					return {
						absolutePath,
						fileRelativeToRoot,
						fileContents,
						output,
						formatted,
						effectLabels,
						logLine: Math.min(...logLines),
					};
				}),
			);

			for (const update of updates) {
				const deletedEffectDescription = getDeletedEffectDescription(
					update.effectLabels,
				);

				pushToUndoStack({
					filePath: update.absolutePath,
					oldContents: update.fileContents,
					newContents: null,
					logLevel,
					remotionRoot,
					logLine: update.logLine,
					description: {
						undoMessage: `↩️  Deletion of ${deletedEffectDescription}`,
						redoMessage: `↪️  Deletion of ${deletedEffectDescription}`,
					},
					entryType: 'delete-effect',
					suppressHmrOnFileRestore: false,
				});
				suppressUndoStackInvalidation(update.absolutePath);
				writeFileAndNotifyFileWatchers(
					update.absolutePath,
					update.output,
					undefined,
				);

				const locationLabel = formatLogFileLocation({
					remotionRoot,
					absolutePath: update.absolutePath,
					line: update.logLine,
				});
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${RenderInternals.chalk.blueBright(`${locationLabel}`)} ${strikeThroughOrRemovedPrefix(deletedEffectDescription)}`,
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
