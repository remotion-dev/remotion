import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveEffectPropsRequest,
	SaveEffectPropsResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '../../codemods/get-all-schema-keys';
import {parseAst} from '../../codemods/parse-ast';
import {updateEffectProps} from '../../codemods/update-effect-props/update-effect-props';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeEffectPropStatus} from './can-update-effect-props';
import {findJsxElementAtNodePath} from './can-update-sequence-props';
import {formatPropChange} from './log-updates/format-prop-change';
import {logUpdate, normalizeQuotes} from './log-updates/log-update';

export const saveEffectPropsHandler: ApiHandler<
	SaveEffectPropsRequest,
	SaveEffectPropsResponse
> = async ({
	input: {
		fileName,
		sequenceNodePath,
		effectIndex,
		key,
		value,
		defaultValue,
		schema,
	},
	remotionRoot,
	logLevel,
}) => {
	RenderInternals.Log.trace(
		{indent: false, logLevel},
		`[save-effect-props] Received request for fileName="${fileName}" effectIndex=${effectIndex} key="${key}"`,
	);
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error('Cannot modify a file outside the project');
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');

	const parsedDefault = defaultValue !== null ? JSON.parse(defaultValue) : null;

	const {output, oldValueString, formatted, logLine} = await updateEffectProps({
		input: fileContents,
		sequenceNodePath,
		effectIndex,
		update: {
			key,
			value: JSON.parse(value),
			defaultValue: parsedDefault,
		},
	});

	const defaultValueString =
		parsedDefault !== null ? JSON.stringify(parsedDefault) : null;

	const normalizedOld = normalizeQuotes(oldValueString);
	const normalizedNew = normalizeQuotes(value);
	const normalizedDefault =
		defaultValueString !== null ? normalizeQuotes(defaultValueString) : null;

	const undoPropChange = formatPropChange({
		key,
		oldValueString: normalizedNew,
		newValueString: normalizedOld,
		defaultValueString: normalizedDefault,
		removedProps: [],
		addedProps: [],
	});
	const redoPropChange = formatPropChange({
		key,
		oldValueString: normalizedOld,
		newValueString: normalizedNew,
		defaultValueString: normalizedDefault,
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
		entryType: 'effect-props',
		suppressHmrOnFileRestore: true,
	});
	suppressUndoStackInvalidation(absolutePath);
	suppressBundlerUpdateForFile(absolutePath);
	writeFileAndNotifyFileWatchers(absolutePath, output);

	logUpdate({
		fileRelativeToRoot,
		line: logLine,
		key: `[${effectIndex}].${key}`,
		oldValueString,
		newValueString: value,
		defaultValueString,
		formatted,
		logLevel,
		removedProps: [],
		addedProps: [],
	});

	printUndoHint(logLevel);

	const ast = parseAst(readFileSync(absolutePath, 'utf-8'));
	const jsx = findJsxElementAtNodePath(ast, sequenceNodePath);
	if (!jsx) {
		return {
			canUpdate: false,
			effectIndex,
			reason: 'not-found',
		};
	}

	return computeEffectPropStatus({
		jsx,
		subscription: {effectIndex},
		keys: getAllSchemaKeys(schema),
	});
};
