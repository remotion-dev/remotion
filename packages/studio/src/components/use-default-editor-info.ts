import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {useEffect, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

let editorInfoPromise: Promise<GetDefaultEditorInfoResponse> | null = null;
let codingAgentInfoPromise: Promise<GetDefaultCodingAgentInfoResponse> | null =
	null;

const loadDefaultEditorInfo = () => {
	editorInfoPromise ??= callApi('/api/default-editor-info', {}).catch((err) => {
		editorInfoPromise = null;
		throw err;
	});

	return editorInfoPromise;
};

const loadDefaultCodingAgentInfo = () => {
	codingAgentInfoPromise ??= callApi(
		'/api/default-coding-agent-info',
		{},
	).catch((err) => {
		codingAgentInfoPromise = null;
		throw err;
	});

	return codingAgentInfoPromise;
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

export const useDefaultCodingAgentInfo = (enabled: boolean) => {
	const [codingAgentInfo, setCodingAgentInfo] =
		useState<GetDefaultCodingAgentInfoResponse | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		let cancelled = false;
		loadDefaultCodingAgentInfo()
			.then((response) => {
				if (!cancelled) {
					setCodingAgentInfo(response);
				}
			})
			.catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, [enabled]);

	return codingAgentInfo;
};
