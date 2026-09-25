import type {VirtualProject} from './types';

export const normalizeVirtualPath = (path: string) =>
	path.startsWith('/') ? path : `/${path}`;

export const getVirtualProjectFiles = (project: VirtualProject) =>
	Object.fromEntries(
		Object.entries(project.files).map(([path, contents]) => [
			normalizeVirtualPath(path),
			contents,
		]),
	);

export const getVirtualProjectChanges = ({
	previous,
	next,
}: {
	previous: Record<string, string>;
	next: Record<string, string>;
}) => ({
	modified: Object.keys(next).filter((path) => previous[path] !== next[path]),
	removed: Object.keys(previous).filter((path) => !Object.hasOwn(next, path)),
});
