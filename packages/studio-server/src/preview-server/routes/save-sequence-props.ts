import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
} from '@remotion/studio-shared';
import {updateSequenceProps} from '../../codemods/update-sequence-props';
import type {ApiHandler} from '../api-types';
import {suppressHmrForFile} from '../hmr-suppression';
import {pushToUndoStack, suppressUndoStackInvalidation} from '../undo-stack';
import {logUpdate} from './log-update';

export const saveSequencePropsHandler: ApiHandler<
	SaveSequencePropsRequest,
	SaveSequencePropsResponse
> = async ({
	input: {fileName, nodePath, key, value, defaultValue},
	remotionRoot,
	logLevel,
}) => {
	try {
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot modify a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {output, oldValueString, formatted} = await updateSequenceProps({
			input: fileContents,
			nodePath,
			key,
			value: JSON.parse(value),
			defaultValue: defaultValue !== null ? JSON.parse(defaultValue) : null,
		});

		pushToUndoStack(absolutePath, fileContents);
		suppressUndoStackInvalidation(absolutePath);
		suppressHmrForFile(absolutePath);
		writeFileSync(absolutePath, output);

		const newValueString = JSON.stringify(JSON.parse(value));
		const parsedDefault =
			defaultValue !== null ? JSON.parse(defaultValue) : null;
		logUpdate({
			absolutePath,
			fileRelativeToRoot,
			key,
			oldValueString,
			newValueString,
			defaultValueString:
				parsedDefault !== null ? JSON.stringify(parsedDefault) : null,
			formatted,
			logLevel,
		});

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
};
