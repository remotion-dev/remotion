import type {IncomingMessage, ServerResponse} from 'http';
import {parseRequestBody} from '../parse-body';
import type {OpenInFileExplorerRequest} from './job';
import {openDirectoryInFinder} from './open-directory-in-finder';

export const handleOpenInFileExplorer = async (
	req: IncomingMessage,
	res: ServerResponse
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
	}

	try {
		const body = (await parseRequestBody(req)) as OpenInFileExplorerRequest;

		// TODO: Disallow opening file that is not in Remotion CWD
		await openDirectoryInFinder(body.directory);

		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: true,
			})
		);
	} catch (err) {
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: false,
				error: (err as Error).message,
			})
		);
	}
};
