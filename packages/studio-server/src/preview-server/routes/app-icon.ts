import {Buffer} from 'node:buffer';
import {createReadStream, statSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path from 'node:path';
import {
	defaultCodingAgentIds,
	type DefaultCodingAgent,
} from '@remotion/renderer';
import {finderArtworkDataUrl} from '../../helpers/finder-artwork';
import {terminalArtworkDataUrls} from '../../helpers/terminal-artwork';
import {validateSameOrigin} from '../validate-same-origin';

const respondWithNotFound = (response: ServerResponse) => {
	response.writeHead(404);
	response.end('App icon not found.');
};

export const handleAppIcon = ({
	request,
	response,
	pathname,
}: {
	request: IncomingMessage;
	response: ServerResponse;
	pathname: string;
}): Promise<void> => {
	if (request.method !== 'GET') {
		response.writeHead(405, {Allow: 'GET'});
		response.end('Method not allowed.');
		return Promise.resolve();
	}

	validateSameOrigin(request);

	const match =
		/^\/api\/app-icon\/(coding-agent|file-manager|terminal)\/([a-z0-9-]+)\.png$/.exec(
			pathname,
		);
	if (!match) {
		respondWithNotFound(response);
		return Promise.resolve();
	}

	const [, kind, id] = match;
	if (kind === 'coding-agent') {
		if (!defaultCodingAgentIds.includes(id as DefaultCodingAgent)) {
			respondWithNotFound(response);
			return Promise.resolve();
		}

		const filePath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'web',
			'coding-agent-icons',
			`${id}.png`,
		);
		const stat = statSync(filePath);
		response.writeHead(200, {
			'Cache-Control': 'public, max-age=3600',
			'Content-Length': stat.size,
			'Content-Type': 'image/png',
		});
		createReadStream(filePath).pipe(response);
		return Promise.resolve();
	}

	const dataUrl =
		kind === 'file-manager'
			? id === 'finder'
				? finderArtworkDataUrl
				: null
			: Object.hasOwn(terminalArtworkDataUrls, id)
				? terminalArtworkDataUrls[id as keyof typeof terminalArtworkDataUrls]
				: null;
	if (dataUrl === null) {
		respondWithNotFound(response);
		return Promise.resolve();
	}

	const image = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
	response.writeHead(200, {
		'Cache-Control': 'public, max-age=3600',
		'Content-Length': image.length,
		'Content-Type': 'image/png',
	});
	response.end(image);
	return Promise.resolve();
};
