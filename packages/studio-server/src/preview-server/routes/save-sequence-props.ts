import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import {updateSequenceProps} from '../../codemods/update-sequence-props/update-sequence-props';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeSequencePropsOnlyStatus} from './can-update-sequence-props';
import {formatPropChange} from './log-updates/format-prop-change';
import {logUpdate, normalizeQuotes} from './log-updates/log-update';

export const saveSequencePropsHandler: ApiHandler<
	SaveSequencePropsRequest,
	SaveSequencePropsResponse
> = async ({
	input: {fileName, nodePath, key, value, defaultValue, schema},
	remotionRoot,
	logLevel,
}) => {
	RenderInternals.Log.trace(
		{indent: false, logLevel},
		`[save-sequence-props] Received request for fileName="${fileName}" key="${key}"`,
	);
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error('Cannot modify a file outside the project');
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');

	const {output, oldValueStrings, formatted, logLine, removedProps} =
		await updateSequenceProps({
			input: fileContents,
			nodePath: nodePath.nodePath,
			updates: [
				{
					key,
					value: JSON.parse(value),
					defaultValue: defaultValue !== null ? JSON.parse(defaultValue) : null,
				},
			],
			schema: NoReactInternals.sequenceSchema,
		});
	const oldValueString = oldValueStrings[0];

	const newValueString = JSON.stringify(JSON.parse(value));
	const parsedDefault = defaultValue !== null ? JSON.parse(defaultValue) : null;
	const defaultValueString =
		parsedDefault !== null ? JSON.stringify(parsedDefault) : null;

	const normalizedOld = normalizeQuotes(oldValueString);
	const normalizedNew = normalizeQuotes(newValueString);
	const normalizedDefault =
		defaultValueString !== null ? normalizeQuotes(defaultValueString) : null;

	const undoPropChange = formatPropChange({
		key,
		oldValueString: normalizedNew,
		newValueString: normalizedOld,
		defaultValueString: normalizedDefault,
		removedProps: [],
		addedProps: removedProps,
	});
	const redoPropChange = formatPropChange({
		key,
		oldValueString: normalizedOld,
		newValueString: normalizedNew,
		defaultValueString: normalizedDefault,
		removedProps,
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
	writeFileAndNotifyFileWatchers(absolutePath, output);

	logUpdate({
		fileRelativeToRoot,
		line: logLine,
		key,
		oldValueString,
		newValueString,
		defaultValueString,
		formatted,
		logLevel,
		removedProps,
		addedProps: [],
	});

	printUndoHint(logLevel);

	const newStatus = computeSequencePropsOnlyStatus({
		fileName,
		keys: getAllSchemaKeys(schema),
		nodePath: nodePath.nodePath,
		remotionRoot,
	});

	return newStatus;
};
