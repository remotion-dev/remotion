import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DuplicateEffectRequest,
	DuplicateEffectResponse,
} from '@remotion/studio-shared';
import {duplicateEffects} from '../../codemods/duplicate-effect';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {attrName} from './log-updates/formatting';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

const getDuplicatedEffectDescription = (effectLabels: string[]): string => {
	if (effectLabels.length === 1) {
		return effectLabels[0];
	}

	return `${effectLabels.length} effects`;
};

export const duplicateEffectHandler: ApiHandler<
	DuplicateEffectRequest,
	DuplicateEffectResponse
> = ({input: effects, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			if (effects.length === 0) {
				throw new Error('No effects were specified for duplication');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[duplicate-effect] Received request to duplicate ${effects.length} effect target${effects.length === 1 ? '' : 's'}`,
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
						await duplicateEffects({
							input: fileContents,
							effects: fileItems.map((item) => ({
								sequenceNodePath: item.sequenceNodePath.nodePath,
								effectIndex: item.effectIndex,
							})),
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
				const duplicatedEffectDescription = getDuplicatedEffectDescription(
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
						undoMessage: `↩️  Duplication of ${duplicatedEffectDescription}`,
						redoMessage: `↪️  Duplication of ${duplicatedEffectDescription}`,
					},
					entryType: 'duplicate-effect',
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
					`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Duplicated ${attrName(duplicatedEffectDescription)}`,
				);
				if (!update.formatted) {
					warnAboutPrettierOnce(logLevel);
				}

				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`[duplicate-effect] Wrote ${update.fileRelativeToRoot}${update.formatted ? ' (formatted)' : ''}`,
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
