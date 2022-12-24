import type {ApiHandler, ApiRoutes} from './api-types';
import {handleAddRender} from './routes/add-render';

export const allApiRoutes: {
	[key in keyof ApiRoutes]: ApiHandler<
		ApiRoutes[key]['Request'],
		ApiRoutes[key]['Response']
	>;
} = {
	'/api/render': handleAddRender,
};
