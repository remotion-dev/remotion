import {updateNodeProps} from '@remotion/codemods';
import type {
	ReplaceVideoSourceRequest,
	ReplaceVideoSourceResponse,
} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import type {ApiHandler} from '../api-types';
import {commitNodeCodemod} from '../commit-node-codemod';

export const replaceVideoSourceHandler: ApiHandler<
	ReplaceVideoSourceRequest,
	ReplaceVideoSourceResponse
> = ({input: {fileName, nodePath, src}, remotionRoot, logLevel}) =>
	commitNodeCodemod({
		remotionRoot,
		logLevel,
		fileName,
		nodePath,
		codemod: ({project, node}) =>
			updateNodeProps({
				project,
				node,
				updates: [
					{
						key: 'src',
						value: `${NoReactInternals.FILE_TOKEN}${src.split('/').map(encodeURIComponent).join('/')}`,
						defaultValue: null,
					},
				],
			}),
		label: 'Removed video background',
		entryType: 'replace-video-source',
	}).then(
		({nodePathMutation}) => ({success: true as const, nodePathMutation}),
		(error) => ({
			success: false as const,
			reason: (error as Error).message,
			stack: (error as Error).stack ?? '',
		}),
	);
