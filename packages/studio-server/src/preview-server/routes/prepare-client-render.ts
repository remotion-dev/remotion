import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {prepareClientRender} from '../watch-ignore-next-change';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const prepareClientRenderHandler: ApiHandler<
	ApiRoutes['/api/prepare-client-render']['Request'],
	ApiRoutes['/api/prepare-client-render']['Response']
> = () => withSourceFileWriteQueue(prepareClientRender);
