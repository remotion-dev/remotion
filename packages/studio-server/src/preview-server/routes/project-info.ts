import type {
	ProjectInfoRequest,
	ProjectInfoResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';

export const projectInfoHandler: ApiHandler<
	ProjectInfoRequest,
	ProjectInfoResponse
> = async ({remotionRoot}) => {
	const info = await getProjectInfo(remotionRoot);
	return {projectInfo: info};
};
