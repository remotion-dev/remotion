import type {StaticFile} from './static-file';

export const getStaticFiles = (): StaticFile[] => {
	return window.remotion_staticFiles;
};
