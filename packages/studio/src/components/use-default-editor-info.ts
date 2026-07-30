import type {
	EditorPickerId,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {useEffect, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

let editorInfoPromise: Promise<GetDefaultEditorInfoResponse> | null = null;

const loadDefaultEditorInfo = () => {
	editorInfoPromise ??= callApi('/api/default-editor-info', {}).catch((err) => {
		editorInfoPromise = null;
		throw err;
	});

	return editorInfoPromise;
};

export const canUseEditorPicker = (previewServerConnected: boolean) => {
	return (
		previewServerConnected &&
		!window.remotion_isReadOnlyStudio &&
		getBrowserStudioOperations() === null
	);
};

export const getPreferredEditorId = (
	editorInfo: GetDefaultEditorInfoResponse | null,
): EditorPickerId | null => {
	return (
		editorInfo?.installedEditors.find(
			(editor) => editor.name === window.remotion_editorName,
		)?.id ?? null
	);
};

export const useDefaultEditorInfo = (enabled: boolean) => {
	const [editorInfo, setEditorInfo] =
		useState<GetDefaultEditorInfoResponse | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		let cancelled = false;
		loadDefaultEditorInfo()
			.then((response) => {
				if (!cancelled) {
					setEditorInfo(response);
				}
			})
			.catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, [enabled]);

	return editorInfo;
};
