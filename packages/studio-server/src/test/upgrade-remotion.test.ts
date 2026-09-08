import {expect, test} from 'bun:test';
import {
	chmod,
	mkdir,
	mkdtemp,
	readFile,
	realpath,
	rm,
	symlink,
	writeFile,
} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {allApiRoutes} from '../preview-server/api-routes';
import {noOpUntilRestart} from '../preview-server/close-and-restart';
import {handleRequest} from '../preview-server/handler';

// Run the actual upgrade CLI, replacing only the external package manager.
test.skipIf(process.platform === 'win32')(
	'Studio upgrades through the CLI, reports installation failures, and acknowledges shutdown',
	async () => {
		const root = await mkdtemp(path.join(tmpdir(), 'studio-upgrade-'));
		const previousPath = process.env.PATH;
		const bin = path.join(root, 'bin');
		await mkdir(bin);
		await mkdir(path.join(root, 'node_modules/@remotion'), {recursive: true});
		await symlink(
			path.resolve(__dirname, '../../../cli'),
			path.join(root, 'node_modules/@remotion/cli'),
		);
		await writeFile(
			path.join(root, 'package.json'),
			JSON.stringify({
				dependencies: {remotion: '4.0.1', '@remotion/cli': '4.0.1'},
			}),
		);
		await writeFile(path.join(root, 'package-lock.json'), '{}');
		const npm = path.join(bin, 'npm');
		await writeFile(
			npm,
			`#!${process.execPath}
const fs = require('node:fs');
if (process.argv[2] === 'view') {
  console.log('{}');
} else {
  fs.writeFileSync('install-call.json', JSON.stringify({cwd: process.cwd(), args: process.argv.slice(2)}));
  if (fs.existsSync('fail')) {
    process.stderr.write('Package manager rejected the upgrade\\n');
    process.stdout.end();
    setTimeout(() => process.exit(1), 100);
  }
}
`,
		);
		await chmod(npm, 0o755);
		process.env.PATH = `${bin}${path.delimiter}${previousPath}`;
		const server = createServer((request, response) => {
			const handler =
				request.url === '/api/shutdown-studio'
					? allApiRoutes['/api/shutdown-studio']
					: allApiRoutes['/api/upgrade-remotion'];
			handleRequest({
				request,
				response,
				handler,
				remotionRoot: root,
				entryPoint: '',
				logLevel: 'error',
				publicDir: root,
				binariesDirectory: null,
				configFile: null,
				getDefaultCodingAgent: () => null,
				getDefaultEditor: () => null,
				methods: {
					addJob: () => undefined,
					cancelJob: () => undefined,
					removeJob: () => undefined,
				},
			}).catch(() => response.end());
		});
		try {
			await new Promise<void>((resolve) =>
				server.listen(0, '127.0.0.1', resolve),
			);
			const address = server.address();
			if (!address || typeof address === 'string') throw new Error('No port');
			const origin = `http://127.0.0.1:${address.port}`;
			const request = async (endpoint: string, body: object) => {
				const response = await fetch(`${origin}${endpoint}`, {
					method: 'POST',
					headers: {origin, 'content-type': 'application/json'},
					body: JSON.stringify(body),
				});
				return response.json();
			};

			expect(
				await request('/api/upgrade-remotion', {version: '4.0.521; echo bad'}),
			).toMatchObject({success: false, error: 'Invalid Remotion version.'});
			expect(
				await request('/api/upgrade-remotion', {version: '4.0.521'}),
			).toEqual({success: true, data: {}});
			const call = JSON.parse(
				await readFile(path.join(root, 'install-call.json'), 'utf8'),
			);
			expect(call.cwd).toBe(await realpath(root));
			expect(call.args).toContain('remotion@4.0.521');
			expect(call.args).toContain('@remotion/cli@4.0.521');
			await writeFile(path.join(root, 'fail'), '');
			const failed = await request('/api/upgrade-remotion', {
				version: '4.0.521',
			});
			expect(failed.success).toBe(false);
			expect(failed.error).toContain('Package manager rejected the upgrade');
			await rm(path.join(root, 'fail'));
			expect(
				await request('/api/upgrade-remotion', {version: '4.0.521'}),
			).toEqual({success: true, data: {}});
			const shutdown = noOpUntilRestart();
			expect(await request('/api/shutdown-studio', {})).toEqual({
				success: true,
				data: {},
			});
			expect(await shutdown).toBe('shutdown');
		} finally {
			process.env.PATH = previousPath;
			server.closeAllConnections();
			await new Promise<void>((resolve) => server.close(() => resolve()));
			await rm(root, {recursive: true, force: true});
		}
	},
	30000,
);
