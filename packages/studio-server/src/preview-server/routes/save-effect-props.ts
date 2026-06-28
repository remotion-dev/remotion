import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveEffectPropsRequest,
	SaveEffectPropsResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {parseAst} from '../../codemods/parse-ast';
import {updateEffectProps} from '../../codemods/update-effect-props/update-effect-props';
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
import {formatEffectPropChange} from './log-updates/format-effect-prop-change';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {normalizeQuotes} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const saveEffectPropsHandler: ApiHandler<
	SaveEffectPropsRequest,
	SaveEffectPropsResponse
> = ({input, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue(async () => {
		const {
			fileName,
			sequenceNodePath,
			effectIndex,
			key,
			defaultValue,
			schema,
			clientId,
		} = input;
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[save-effect-props] Received request for fileName="${fileName}" effectIndex=${effectIndex} key="${key}"`,
		);
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'modify',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const parsedDefault =
			defaultValue !== null ? JSON.parse(defaultValue) : null;

		const update = (() => {
			switch (input.type) {
				case 'value':
					return {
						key,
						value: JSON.parse(input.value),
						defaultValue: parsedDefault,
					};
				case 'effect-param':
					return {
						key,
						effectParam: input.effectParam,
						defaultValue: parsedDefault,
					};
				default:
					throw new Error(
						`Unsupported save effect props request type: ${
							(input as {type?: unknown}).type
						}`,
					);
			}
		})();

		const {
			output,
			oldValueString,
			newValueString,
			formatted,
			logLine,
			effectCallee,
			removedProps,
		} = await updateEffectProps({
			input: fileContents,
			sequenceNodePath: sequenceNodePath.nodePath,
			effectIndex,
			update,
			schema,
		});

		const defaultValueString =
			parsedDefault !== null ? JSON.stringify(parsedDefault) : null;

		const normalizedOld = normalizeQuotes(oldValueString);
		const normalizedNew = normalizeQuotes(newValueString);
		const normalizedDefault =
			defaultValueString !== null ? normalizeQuotes(defaultValueString) : null;
		const normalizedRemovedProps = removedProps.map((prop) => ({
			...prop,
			valueString: normalizeQuotes(prop.valueString),
		}));

		const undoPropChange = formatEffectPropChange({
			effectName: effectCallee,
			key,
			oldValueString: normalizedNew,
			newValueString: normalizedOld,
			defaultValueString: normalizedDefault,
			removedProps: [],
			addedProps: normalizedRemovedProps,
		});
		const redoPropChange = formatEffectPropChange({
			effectName: effectCallee,
			key,
			oldValueString: normalizedOld,
			newValueString: normalizedNew,
			defaultValueString: normalizedDefault,
			removedProps: normalizedRemovedProps,
			addedProps: [],
		});

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
			defaultValueString,
			formatted,
			logLevel,
			removedProps,
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
			ast,
			jsx,
			effectIndex,
			keys: getAllSchemaKeys(schema),
		});
	});
