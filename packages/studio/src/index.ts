import {Studio} from './Studio';

export type {GitSource, RenderDefaults} from '@remotion/studio-shared';

export const StudioInternals = {
	Studio,
};

export {StaticFile, getStaticFiles} from './api/get-static-files';
export {watchStaticFile} from './api/watch-static-file';
