import type {
	ProjectInfoRequest,
	ProjectInfoResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';

export const projectInfoHandler: ApiHandler<
	ProjectInfoRequest,
	ProjectInfoResponse
> = async ({remotionRoot, entryPoint}) => {
	const info = await getProjectInfo(remotionRoot, entryPoint);
	return {projectInfo: info};
};
