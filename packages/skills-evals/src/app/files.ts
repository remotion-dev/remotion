import {existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import {extname, resolve} from 'node:path';
import {notFound, runsRoot} from './shared';

export const serveRunFile = async (relativePath: string) => {
	const file = resolve(runsRoot, relativePath);
	const resolvedRunsRoot = resolve(runsRoot);

	if (!file.startsWith(`${resolvedRunsRoot}/`)) {
		return notFound();
	}

	if (!existsSync(file) || !(await stat(file)).isFile()) {
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
		}[extname(file)] ?? 'application/octet-stream';

	return new Response(Bun.file(file), {
		headers: {'content-type': contentType},
	});
};
