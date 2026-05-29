import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteSequenceKeyframeRequest,
	DeleteSequenceKeyframeResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {updateSequenceKeyframes} from '../../codemods/update-keyframes/update-keyframes';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeSequencePropsStatusFromContent} from './can-update-sequence-props';
import {formatPropChange} from './log-updates/format-prop-change';
import {logUpdate, normalizeQuotes} from './log-updates/log-update';
import {withSavePropsLock} from './save-props-mutex';

export const deleteSequenceKeyframeHandler: ApiHandler<
	DeleteSequenceKeyframeRequest,
	DeleteSequenceKeyframeResponse
> = ({
	input: {fileName, nodePath, key, frame, schema, clientId},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-sequence-keyframe] Received request for fileName="${fileName}" key="${key}" frame=${frame}`,
		);
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'modify',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {output, oldValueStrings, newValueStrings, formatted, logLine} =
			await updateSequenceKeyframes({
				input: fileContents,
				nodePath: nodePath.nodePath,
				updates: [
					{
						key,
						operation: {
							type: 'remove',
							frame,
						},
					},
				],
			});

		const oldValueString = oldValueStrings[0];
		const newValueString = newValueStrings[0];
		const normalizedOld = normalizeQuotes(oldValueString);
		const normalizedNew = normalizeQuotes(newValueString);

		const undoPropChange = formatPropChange({
			key,
			oldValueString: normalizedNew,
			newValueString: normalizedOld,
			defaultValueString: null,
			removedProps: [],
			addedProps: [],
		});
		const redoPropChange = formatPropChange({
			key,
			oldValueString: normalizedOld,
			newValueString: normalizedNew,
			defaultValueString: null,
			removedProps: [],
			addedProps: [],
		});

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: `↩️  ${undoPropChange}`,
				redoMessage: `↪️  ${redoPropChange}`,
			},
			entryType: 'sequence-props',
			suppressHmrOnFileRestore: true,
		});
		suppressUndoStackInvalidation(absolutePath);
		suppressBundlerUpdateForFile(absolutePath);
		writeFileAndNotifyFileWatchers(absolutePath, output, clientId);

		logUpdate({
			fileRelativeToRoot,
			line: logLine,
			key,
			oldValueString,
			newValueString,
			defaultValueString: null,
			formatted,
			logLevel,
			removedProps: [],
			addedProps: [],
		});

		printUndoHint(logLevel);

		const status = computeSequencePropsStatusFromContent({
			fileContents: output,
			keys: getAllSchemaKeys(schema),
			nodePath: nodePath.nodePath,
			effects: [],
		});

		return {
			canUpdate: true,
			props: status.props,
		};
	});
