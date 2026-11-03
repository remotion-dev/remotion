import type {AnyRenderJob} from '../components/RenderQueue/context';

export const getRenderJobOutputPath = (job: AnyRenderJob): string => {
	if (job.type !== 'client-video' && job.type !== 'client-still') {
		return job.outName;
	}

	return job.outName.replace(
		window.remotion_fileSystemPlatform === 'win32' ? /^[\\/]+/ : /^\/+/,
		'',
	);
};

export const getEncodedOutputPath = (path: string): string => {
	return `/${encodeURIComponent(path)}`;
};

export const getOutputRoute = (path: string): string => {
	return `/outputs${getEncodedOutputPath(path)}`;
};
