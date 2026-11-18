import {readFile} from 'node:fs/promises';
import path from 'node:path';
import type {
	PickOpenTimelineRequest,
	PickOpenTimelineResponse,
} from '@remotion/studio-shared';
import {getNativeFilePickerDirectory} from '../../helpers/native-file-picker-directory';
import {
	openNativeFilePicker,
	supportsNativeFilePicker,
} from '../../native-file-picker';
import type {ApiHandler} from '../api-types';

export const pickOpenTimelineHandler: ApiHandler<
	PickOpenTimelineRequest,
	PickOpenTimelineResponse
> = async ({input, request, response, remotionRoot}) => {
	if (!supportsNativeFilePicker(request)) {
		throw new Error('Native file selection is unavailable for this Studio.');
	}

	if (input.type !== 'timeline' && input.type !== 'media-directory') {
		throw new Error('Invalid file picker type.');
	}

	const position = input.position ?? null;
	if (
		position !== null &&
		(!Number.isFinite(position.x) || !Number.isFinite(position.y))
	) {
		throw new Error('Invalid file picker position.');
	}

	const controller = new AbortController();
	const onClose = () => controller.abort();
	response.once('close', onClose);
	try {
		const selected = await openNativeFilePicker({
			type: input.type,
			initialDirectory:
				input.initialDirectory ??
				(await getNativeFilePickerDirectory({
					remotionRoot,
					type: input.type,
					updateDirectory: null,
				})) ??
				remotionRoot,
			signal: controller.signal,
			position,
		});
		if (selected.directory !== null) {
			await getNativeFilePickerDirectory({
				remotionRoot,
				type: input.type,
				updateDirectory: selected.directory,
			});
		}

		if (selected.path === null) return null;
		if (input.type === 'media-directory') {
			return {type: 'media-directory', mediaDirectory: selected.path};
		}

		if (path.extname(selected.path).toLowerCase() !== '.otio') {
			throw new Error('Select an OpenTimelineIO (.otio) file.');
		}

		return {
			type: 'timeline',
			name: path.basename(selected.path),
			contents: await readFile(selected.path, 'utf8'),
			mediaDirectory: path.dirname(selected.path),
		};
	} finally {
		response.off('close', onClose);
	}
};
