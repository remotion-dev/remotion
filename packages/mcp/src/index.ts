#! /usr/bin/env node

import {handleJsonRpcMessage, serializeMessage} from './server.js';

let buffer = '';
let queue = Promise.resolve();

const send = (message: Parameters<typeof serializeMessage>[0]) => {
	process.stdout.write(serializeMessage(message));
};

const handleLine = (line: string) => {
	if (line.trim() === '') {
		return;
	}

	queue = queue.then(async () => {
		try {
			await handleJsonRpcMessage(JSON.parse(line), send);
		} catch (err) {
			send({
				jsonrpc: '2.0',
				id: null,
				error: {
					code: -32700,
					message: err instanceof Error ? err.message : 'Parse error',
				},
			});
		}
	});
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
	buffer += chunk;

	while (true) {
		const newline = buffer.indexOf('\n');
		if (newline === -1) {
			break;
		}

		const line = buffer.slice(0, newline).replace(/\r$/, '');
		buffer = buffer.slice(newline + 1);
		handleLine(line);
	}
});
