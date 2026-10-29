import {appendFileSync, existsSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {WebSocketServer} from 'ws';

const [mode, directory] = process.argv.slice(2);
const server = new WebSocketServer({host: '127.0.0.1', port: 0});
writeFileSync(join(directory, 'pid'), String(process.pid));

// Bound the lifetime of a worker if its test fails during startup.
setTimeout(() => process.exit(1), 15_000).unref();

server.on('listening', () => {
	const address = server.address();
	if (typeof address === 'string') {
		throw new Error('Expected a TCP address');
	}

	process.stderr.write(
		`DevTools listening on ws://127.0.0.1:${address.port}\n`,
	);
});

server.on('connection', (socket) => {
	socket.on('message', (data) => {
		const {id, method} = JSON.parse(data.toString());
		if (method !== 'Browser.close') {
			socket.send(JSON.stringify({id, result: {}}));
			return;
		}

		appendFileSync(join(directory, 'requests'), `${method}\n`);
		if (mode === 'hang') {
			return;
		}

		if (mode === 'reject') {
			socket.send(JSON.stringify({id, error: {message: 'Cannot close'}}));
			return;
		}

		if (mode === 'disconnect') {
			socket.close();
		} else if (mode !== 'no-response') {
			socket.send(JSON.stringify({id, result: {}}));
		}

		// A CDP response or socket close is not the process exit. This marker
		// models browser-owned cleanup that a SIGKILL would bypass.
		setTimeout(() => {
			writeFileSync(
				join(directory, 'closed'),
				existsSync(join(directory, 'profile'))
					? 'profile-present'
					: 'profile-missing',
			);
			process.exit(0);
		}, 100);
	});
});
