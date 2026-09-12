import {expect, test} from 'bun:test';
import {chmod, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {allApiRoutes} from '../preview-server/api-routes';
import {handleRequest} from '../preview-server/handler';

// Replace only the external skills installer; exercise the real HTTP handler and filesystem.
test.skipIf(process.platform === 'win32')(
	'Studio installs a skill in the project, reports failures, and allows retrying',
	async () => {
		const root = await mkdtemp(path.join(tmpdir(), 'studio-install-skill-'));
		const previousPath = process.env.PATH;
		const bin = path.join(root, 'bin');
		await mkdir(bin);
		const npx = path.join(bin, 'npx');
		await writeFile(
			npx,
			`#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
fs.writeFileSync('install-call.json', JSON.stringify(args));
if (fs.existsSync('fail')) {
  process.stderr.write('Could not download skills');
  process.stdout.end();
  setTimeout(() => process.exit(1), 100);
} else {
  const skill = args[args.indexOf('--skill') + 1];
  const directory = path.join('.agents', 'skills', skill);
  fs.mkdirSync(directory, {recursive: true});
  fs.writeFileSync(path.join(directory, 'SKILL.md'), '# Installed skill');
}
`,
		);
		await chmod(npx, 0o755);
		process.env.PATH = `${bin}${path.delimiter}${previousPath}`;
		const server = createServer((request, response) => {
			handleRequest({
				request,
				response,
				handler: allApiRoutes['/api/install-remotion-skill'],
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
			const request = async (skill: string) => {
				const response = await fetch(`${origin}/api/install-remotion-skill`, {
					method: 'POST',
					headers: {origin, 'content-type': 'application/json'},
					body: JSON.stringify({skill}),
				});
				return response.json();
			};

			expect(await request('../untrusted-skill')).toMatchObject({
				success: false,
			});
			await expect(
				readFile(path.join(root, 'install-call.json')),
			).rejects.toThrow();
			await writeFile(path.join(root, 'fail'), '');
			const failed = await request('remotion-interactivity');
			expect(failed.success).toBe(false);
			expect(failed.error).toContain('Could not download skills');
			await rm(path.join(root, 'fail'));
			const installed = await request('remotion-interactivity');
			expect(installed.success).toBe(true);
			expect(installed.data.remotionInteractivitySkillAvailable).toBe(true);
			expect(
				installed.data.skills.find(
					({name}: {name: string}) => name === 'remotion-interactivity',
				),
			).toMatchObject({installedInProject: true});
			expect(
				await readFile(
					path.join(root, '.agents/skills/remotion-interactivity/SKILL.md'),
					'utf8',
				),
			).toBe('# Installed skill');
			expect(
				JSON.parse(
					await readFile(path.join(root, 'install-call.json'), 'utf8'),
				),
			).toEqual([
				'--yes',
				'--loglevel=error',
				'skills@1.5.20',
				'add',
				'remotion-dev/skills',
				'--skill',
				'remotion-interactivity',
				'--yes',
			]);
		} finally {
			process.env.PATH = previousPath;
			server.closeAllConnections();
			await new Promise<void>((resolve) => server.close(() => resolve()));
			await rm(root, {recursive: true, force: true});
		}
	},
);
