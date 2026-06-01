import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteEffectKeyframeRequest,
	DeleteEffectKeyframeResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {parseAst} from '../../codemods/parse-ast';
import {updateEffectKeyframes} from '../../codemods/update-keyframes/update-keyframes';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeEffectPropStatus} from './can-update-effect-props';
import {findJsxElementAtNodePath} from './can-update-sequence-props';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {withSavePropsLock} from './save-props-mutex';

export const deleteEffectKeyframeHandler: ApiHandler<
	DeleteEffectKeyframeRequest,
	DeleteEffectKeyframeResponse
> = ({
	input: {
		fileName,
		sequenceNodePath,
		effectIndex,
		key,
		frame,
		schema,
		clientId,
	},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-effect-keyframe] Received request for fileName="${fileName}" effectIndex=${effectIndex} key="${key}" frame=${frame}`,
		);
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'modify',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {
			output,
			oldValueStrings,
			newValueStrings,
			formatted,
			logLine,
			effectCallee,
		} = await updateEffectKeyframes({
			input: fileContents,
			sequenceNodePath: sequenceNodePath.nodePath,
			effectIndex,
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

		const undoPropChange = `${key} keyframe restored at frame ${frame}`;
		const redoPropChange = `${key} keyframe deleted at frame ${frame}`;

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
			entryType: 'effect-props',
			suppressHmrOnFileRestore: true,
		});
		suppressUndoStackInvalidation(absolutePath);
		suppressBundlerUpdateForFile(absolutePath);
		writeFileAndNotifyFileWatchers(absolutePath, output, clientId);

		logEffectUpdate({
			fileRelativeToRoot,
			line: logLine,
			effectName: effectCallee,
			propKey: key,
			oldValueString,
			newValueString,
			defaultValueString: null,
			formatted,
			logLevel,
			removedProps: [],
			addedProps: [],
		});

		printUndoHint(logLevel);

		const ast = parseAst(readFileSync(absolutePath, 'utf-8'));
		const jsx = findJsxElementAtNodePath(ast, sequenceNodePath.nodePath);
		if (!jsx) {
			return {
				canUpdate: false,
				effectIndex,
				reason: 'not-found',
			};
		}

		return computeEffectPropStatus({
			jsx,
			effectIndex,
			keys: getAllSchemaKeys(schema),
		});
	});
