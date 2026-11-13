import {expect, spyOn, test} from 'bun:test';
import {EventEmitter} from 'node:events';
import http from 'node:http';
import type {Socket} from 'node:net';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {serveStatic} from '../serve-static';

class Connection extends EventEmitter {
	destroyed = false;
	constructor(
		readonly metadata: 'unique' | 'throws' | 'missing',
		readonly port: number,
	) {
		super();
	}
	get remoteAddress() {
		if (this.metadata === 'throws') throw new Error('Address is unavailable');
		return this.metadata === 'missing' ? undefined : '127.0.0.1';
	}
	get remotePort() {
		return this.metadata === 'missing' ? undefined : this.port;
	}
	destroy() {
		this.destroyed = true;
		this.emit('close');
		return this;
	}
}

test.each([
	{metadata: 'unique', closeFirst: false},
	{metadata: 'throws', closeFirst: false},
	{metadata: 'missing', closeFirst: false},
	{metadata: 'throws', closeFirst: true},
] as const)(
	'closes every connection with $metadata metadata after early close=$closeFirst',
	async ({metadata, closeFirst}) => {
		const originalCreateServer = http.createServer;
		const restores: (() => void)[] = [];
		const captured: {listener: ((socket: Socket) => void) | null} = {
			listener: null,
		};
		const createSpy = spyOn(http, 'createServer').mockImplementation(
			(...args) => {
				const server = Reflect.apply(
					originalCreateServer,
					http,
					args,
				) as http.Server;
				const originalOn = server.on.bind(server);
				const onSpy = spyOn(server, 'on').mockImplementation(
					(event, listener) => {
						if (event === 'connection') captured.listener = listener;
						return originalOn(event, listener);
					},
				);
				restores.push(() => onSpy.mockRestore());
				return server;
			},
		);
		const downloadMap = makeDownloadMap(48000);
		let service: Awaited<ReturnType<typeof serveStatic>> | null = null;
		const connections = [1, 2, 3].map((port) => new Connection(metadata, port));
		try {
			service = await serveStatic(null, {
				port: null,
				downloadMap,
				remotionRoot: process.cwd(),
				offthreadVideoThreads: 1,
				logLevel: 'error',
				indent: false,
				offthreadVideoCacheSizeInBytes: null,
				binariesDirectory: null,
				forceIPv4: true,
			});
			createSpy.mockRestore();
			for (const restore of restores) restore();
			expect(captured.listener).toBeFunction();
			for (const connection of connections)
				captured.listener!(connection as unknown as Socket);
			if (closeFirst) connections[0]!.destroy();
			await service.close();
			expect(connections.map((connection) => connection.destroyed)).toEqual([
				true,
				true,
				true,
			]);
		} finally {
			createSpy.mockRestore();
			for (const restore of restores) restore();
			for (const connection of connections) connection.destroy();
			await service?.close();
			cleanDownloadMap(downloadMap);
		}
	},
);
