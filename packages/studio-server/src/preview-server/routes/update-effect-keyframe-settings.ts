import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	UpdateEffectKeyframeSettingsRequest,
	UpdateEffectKeyframeSettingsResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {parseAst} from '../../codemods/parse-ast';
import {updateEffectKeyframes} from '../../codemods/update-keyframes/update-keyframes';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import {getVideoConfigIdentifierValues} from '../../helpers/video-config-values';
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
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const updateEffectKeyframeSettingsHandler: ApiHandler<
	UpdateEffectKeyframeSettingsRequest,
	UpdateEffectKeyframeSettingsResponse
> = ({
	input: {
		fileName,
		sequenceNodePath,
		effectIndex,
		key,
		settings,
		schema,
		clientId,
	},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[update-effect-keyframe-settings] Received request for fileName="${fileName}" effectIndex=${effectIndex} key="${key}"`,
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
			updatedSequenceNodePath,
		} = await updateEffectKeyframes({
			input: fileContents,
			sequenceNodePath: sequenceNodePath.nodePath,
			effectIndex,
			schema,
			videoConfigValues: sequenceNodePath.videoConfigValues,
			updates: [
				{
					key,
					operation:
						settings.type === 'settings'
							? {
									type: 'settings',
									clamping: settings.clamping,
									posterize: settings.posterize,
									output: settings.output,
								}
							: {
									type: 'easing',
									segmentIndex: settings.segmentIndex,
									easing: settings.easing,
								},
				},
			],
		});

		const undoPropChange = `${key} keyframe settings reverted`;
		const redoPropChange = `${key} keyframe settings updated`;

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
			oldValueString: oldValueStrings[0],
			newValueString: newValueStrings[0],
			defaultValueString: null,
			formatted,
			logLevel,
			removedProps: [],
			addedProps: [],
		});

		printUndoHint(logLevel);

		const ast = parseAst(output);
		const jsx = findJsxElementAtNodePath(ast, updatedSequenceNodePath);
		if (!jsx) {
			return {
				canUpdate: false,
				effectIndex,
				reason: 'not-found',
			};
		}

		return computeEffectPropStatus({
			ast,
			jsx,
			effectIndex,
			keys: getAllSchemaKeys(schema),
			videoConfigValues: getVideoConfigIdentifierValues({
				ast,
				videoConfigValues: sequenceNodePath.videoConfigValues,
			}),
		});
	});
