import type {
	GetDefaultEditorInfoRequest,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {resolveCustomEditorExecutable} from '../../helpers/custom-editor';
import {getAvailableEditors} from '../../helpers/editor-registry';
import type {ApiHandler} from '../api-types';

export const getDefaultEditorInfoHandler: ApiHandler<
	GetDefaultEditorInfoRequest,
	GetDefaultEditorInfoResponse
> = async ({getDefaultEditor}) => {
	const installedEditors = await getAvailableEditors();
	const configuredEditor = getDefaultEditor();
	const customEditor =
		configuredEditor &&
		typeof configuredEditor === 'object' &&
		resolveCustomEditorExecutable(configuredEditor)
			? configuredEditor
			: null;
	return {
		defaultEditor:
			typeof configuredEditor === 'object' ? 'custom' : configuredEditor,
		installedEditors: [
			...installedEditors.map(({id, name, nameWithType}) => ({
				id,
				name,
				nameWithType,
			})),
			...(customEditor
				? [
						{
							id: 'custom' as const,
							name: customEditor.name,
							nameWithType: customEditor.name,
						},
					]
				: []),
		],
	};
};
