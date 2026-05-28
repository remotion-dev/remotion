import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {updateSequenceProps} from '../../codemods/update-sequence-props/update-sequence-props';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
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
import {withSavePropsLock} from './save-props-mutex';

type KeyframedStatus = Extract<
	CanUpdateSequencePropStatus,
	{canUpdate: false; reason: 'keyframed'}
>;

const getLegacyComputedKeyframes = (
	status: CanUpdateSequencePropStatus,
): KeyframedStatus['keyframes'] | null => {
	if (status.canUpdate || status.reason !== 'computed') {
		return null;
	}

	const keyframes = (status as unknown as {keyframes?: unknown}).keyframes;
	if (!Array.isArray(keyframes)) {
		return null;
	}

	if (
		!keyframes.every(
			(keyframe) =>
				typeof keyframe === 'object' &&
				keyframe !== null &&
				'frame' in keyframe &&
				typeof keyframe.frame === 'number' &&
				'value' in keyframe,
		)
	) {
		return null;
	}

	return keyframes as KeyframedStatus['keyframes'];
};

const normalizePropStatus = (
	status: CanUpdateSequencePropStatus,
): CanUpdateSequencePropStatus => {
	const keyframes = getLegacyComputedKeyframes(status);
	if (!keyframes) {
		return status;
	}

	return {
		canUpdate: false,
		reason: 'keyframed',
		keyframes,
		easing: new Array(Math.max(0, keyframes.length - 1)).fill(
			'linear',
		) as KeyframedStatus['easing'],
		clamping: {left: 'extend', right: 'extend'},
	};
};

export const saveSequencePropsHandler: ApiHandler<
	SaveSequencePropsRequest,
	SaveSequencePropsResponse
> = ({
	input: {fileName, nodePath, key, value, defaultValue, schema, clientId},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[save-sequence-props] Received request for fileName="${fileName}" key="${key}"`,
		);
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'modify',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {output, oldValueStrings, formatted, logLine, removedProps} =
			await updateSequenceProps({
				input: fileContents,
				nodePath: nodePath.nodePath,
				updates: [
					{
						key,
						value: JSON.parse(value),
						defaultValue:
							defaultValue !== null ? JSON.parse(defaultValue) : null,
					},
				],
				schema: NoReactInternals.sequenceSchema,
			});
		const oldValueString = oldValueStrings[0];

		const newValueString = JSON.stringify(JSON.parse(value));
		const parsedDefault =
			defaultValue !== null ? JSON.parse(defaultValue) : null;
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
		writeFileAndNotifyFileWatchers(absolutePath, output, clientId);

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

		const normalizedProps: Record<string, CanUpdateSequencePropStatus> = {};
		for (const [propKey, propStatus] of Object.entries(newStatus.props)) {
			normalizedProps[propKey] = normalizePropStatus(propStatus);
		}

		return {
			canUpdate: true,
			props: normalizedProps,
		};
	});
