import type {
	GetAppInfoRequest,
	GetAppInfoResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {getDefaultCodingAgentInfoHandler} from './default-coding-agent';
import {getDefaultEditorInfoHandler} from './default-editor';

export const appInfoHandler: ApiHandler<
	GetAppInfoRequest,
	GetAppInfoResponse
> = async (params) => {
	const [editorInfo, codingAgentInfo] = await Promise.all([
		getDefaultEditorInfoHandler({...params, input: params.input.editor}),
		getDefaultCodingAgentInfoHandler({
			...params,
			input: params.input.codingAgent,
		}),
	]);
	return {editorInfo, codingAgentInfo};
};
