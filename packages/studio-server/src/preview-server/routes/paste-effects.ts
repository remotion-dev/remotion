import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	PasteEffectsRequest,
	PasteEffectsResponse,
} from '@remotion/studio-shared';
import {pasteEffects} from '../../codemods/paste-effects';
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

const getPastedEffectDescription = (effectLabels: string[]): string => {
	if (effectLabels.length === 1) {
		return effectLabels[0];
	}

	return `${effectLabels.length} effects`;
};

export const pasteEffectsHandler: ApiHandler<
	PasteEffectsRequest,
	PasteEffectsResponse
> = ({
	input: {targetFileName, targetSequenceNodePath, type, effects, clientId},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			if (effects.length === 0 && type !== 'effects-replacing') {
				throw new Error('No effects were specified for pasting');
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[paste-effects] Received request to paste ${effects.length} effect${effects.length === 1 ? '' : 's'} into fileName="${targetFileName}"`,
			);

			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName: targetFileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {output, formatted, effectLabels, logLine} = await pasteEffects({
				input: fileContents,
				targetFileName,
				targetSequenceNodePath: targetSequenceNodePath.nodePath,
				type,
				effects,
			});

			const effectDescription = getPastedEffectDescription(effectLabels);

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Pasting of ${effectDescription}`,
					redoMessage: `↪️  Pasting of ${effectDescription}`,
				},
				entryType: 'paste-effects',
				suppressHmrOnFileRestore: false,
			});
			suppressUndoStackInvalidation(absolutePath);
			writeFileAndNotifyFileWatchers(absolutePath, output, clientId);

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Pasted ${attrName(effectDescription)}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[paste-effects] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
			);

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
