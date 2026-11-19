import {readFileSync} from 'node:fs';
import {reorderEffects} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	ReorderEffectRequest,
	ReorderEffectResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {updateSequencePropsForEffectEdit} from '../sequence-props-watchers';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {attrName} from './log-updates/formatting';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const reorderEffectHandler: ApiHandler<
	ReorderEffectRequest,
	ReorderEffectResponse
> = ({
	input: {
		fileName,
		sequenceNodePath,
		fromIndices,
		toIndex,
		clientId,
		sequenceProps,
	},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue(() => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[reorder-effect] Received request for fileName="${fileName}" fromIndices=${fromIndices.join(',')} toIndex=${toIndex}`,
			);

			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');
			const result = reorderEffects({
				project: {files: {[absolutePath]: fileContents}, rootDir: remotionRoot},
				effects: fromIndices.map((effectIndex) => ({
					filePath: absolutePath,
					nodePath: sequenceNodePath.nodePath,
					effectIndex,
				})),
				toIndex,
			});
			const output = result.changes[0]?.nextContents ?? fileContents;
			const {formatted, effectLabel, logLine} = result.editDetails[0];

			if (
				[...fromIndices]
					.sort((a, b) => a - b)
					.every((index, offset) => index === toIndex + offset)
			) {
				return {success: true, nodePathMutation: null};
			}

			const sourceUnchanged = output === fileContents;
			const nodePathMutation = broadcastSequenceNodePathMutation(
				[{absolutePath, remappings: result.nodePathRemappings}],
				null,
				sourceUnchanged,
			);

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: output,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Reordering of ${effectLabel}`,
					redoMessage: `↪️  Reordering of ${effectLabel}`,
				},
				entryType: 'reorder-effect',
				suppressHmrOnFileRestore: sourceUnchanged,
				nodePathRemappings: result.nodePathRemappings,
			});
			if (!sourceUnchanged) {
				suppressUndoStackInvalidation(absolutePath);
				writeFileAndNotifyFileWatchers({
					file: absolutePath,
					content: output,
					originatorClientId: clientId,
					metadata: {skipSequencePropsUpdate: true},
				});
			}

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Reordered ${attrName(effectLabel)}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[reorder-effect] ${sourceUnchanged ? 'Kept' : 'Wrote'} ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
			);

			printUndoHint(logLevel);

			return {
				success: true,
				...updateSequencePropsForEffectEdit(sequenceProps ?? [], remotionRoot),
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
