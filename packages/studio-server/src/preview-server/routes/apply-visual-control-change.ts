import {readFileSync} from 'node:fs';
import {updateVisualControls} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyVisualControlRequest,
	ApplyVisualControlResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {waitForLiveEventsListener} from '../live-events';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const applyVisualControlHandler: ApiHandler<
	ApplyVisualControlRequest,
	ApplyVisualControlResponse
> = ({input: {fileName, changes}, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(() => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[apply-visual-control] Received request for ${fileName} with ${changes.length} changes`,
		);
		const {absolutePath} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'apply visual control change to',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const result = updateVisualControls({
			project: {rootDir: remotionRoot, files: {[absolutePath]: fileContents}},
			filePath: absolutePath,
			changes,
		});
		const output = result.project.files[absolutePath];
		const logLine =
			result.updatedControls.findLast(
				(control) => control.id === changes[0]?.id,
			)?.line ?? 1;

		if (result.updatedControls.length === 0) {
			throw new Error('No changes were made to the file');
		}

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			newContents: null,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: '↩️  Visual control change',
				redoMessage: '↪️  Visual control change',
			},
			entryType: 'visual-control',
			suppressHmrOnFileRestore: true,
			nodePathRemappings: null,
		});
		suppressUndoStackInvalidation(absolutePath);
		suppressBundlerUpdateForFile(absolutePath);
		writeFileAndNotifyFileWatchers({
			file: absolutePath,
			content: output,
			originatorClientId: undefined,
			metadata: null,
		});

		waitForLiveEventsListener().then((listener) => {
			listener.sendEventToClient({
				type: 'visual-control-values-changed',
				values: changes.map((change) => ({
					id: change.id,
					value: change.newValueIsUndefined
						? null
						: JSON.parse(change.newValueSerialized),
					isUndefined: change.newValueIsUndefined,
				})),
			});
		});

		const locationLabel = formatLogFileLocation({
			remotionRoot,
			absolutePath,
			line: logLine,
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Applied visual control changes`,
		);

		printUndoHint(logLevel);

		return Promise.resolve({success: true});
	});
};
