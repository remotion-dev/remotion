import {existsSync} from 'node:fs';
import {realpath, stat} from 'node:fs/promises';
import {extname, isAbsolute, relative, resolve} from 'node:path';
import {notFound, runsRoot} from './shared';

export const serveRunFile = async (relativePath: string) => {
	const file = resolve(runsRoot, relativePath);

	if (!existsSync(runsRoot)) {
		return notFound();
	}

	const resolvedRunsRoot = await realpath(runsRoot);

	if (!existsSync(file)) {
		return notFound();
	}

	const realFile = await realpath(file);
	const relativeToRunsRoot = relative(resolvedRunsRoot, realFile);

	if (relativeToRunsRoot.startsWith('..') || isAbsolute(relativeToRunsRoot)) {
		return notFound();
	}

	if (!(await stat(realFile)).isFile()) {
		return notFound();
	}

	const contentType =
		{
			'.html': 'text/html; charset=utf-8',
			'.json': 'application/json',
			'.jsonl': 'application/x-ndjson',
			'.log': 'text/plain; charset=utf-8',
			'.mp4': 'video/mp4',
			'.png': 'image/png',
			'.webm': 'video/webm',
		}[extname(realFile)] ?? 'application/octet-stream';

	return new Response(Bun.file(realFile), {
		headers: {'content-type': contentType},
	});
};
