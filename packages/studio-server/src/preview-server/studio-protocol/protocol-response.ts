import type {ServerResponse} from 'node:http';

export const writeStudioProtocolError = ({
	code,
	message,
	response,
	status,
}: {
	readonly code: string;
	readonly message: string;
	readonly response: ServerResponse;
	readonly status: number;
}): void => {
	response.writeHead(status, {'Content-Type': 'application/json'});
	response.end(
		JSON.stringify({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'error',
			error: {code, message},
		}),
	);
};
