import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	AddSequenceKeyframeRequest,
	AddSequenceKeyframeResponse,
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
import {logUpdate} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const addSequenceKeyframeHandler: ApiHandler<
	AddSequenceKeyframeRequest,
	AddSequenceKeyframeResponse
> = ({
	input: {fileName, nodePath, key, frame, value, schema, clientId},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[add-sequence-keyframe] Received request for fileName="${fileName}" key="${key}" frame=${frame}`,
		);
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'modify',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const parsedValue = JSON.parse(value);

		const {
			output,
			oldValueStrings,
			newValueStrings,
			formatted,
			logLine,
			updatedNodePath,
		} = await updateSequenceKeyframes({
			input: fileContents,
			nodePath: nodePath.nodePath,
			schema,
			updates: [
				{
					key,
					operation: {
						type: 'add',
						frame,
						value: parsedValue,
					},
				},
			],
		});

		const oldValueString = oldValueStrings[0];
		const newValueString = newValueStrings[0];

		const undoPropChange = `${key} keyframe removed at frame ${frame}`;
		const redoPropChange = `${key} keyframe added at frame ${frame}`;

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			newContents: null,
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
			nodePath: updatedNodePath,
			componentIdentity: null,
			effects: [],
		});
		const updatedSubscriptionKey = {...nodePath, nodePath: updatedNodePath};

		return {
			canUpdate: true,
			props: status.props,
			results: [
				{fileName, nodePath: updatedSubscriptionKey, props: status.props},
			],
		};
	});
