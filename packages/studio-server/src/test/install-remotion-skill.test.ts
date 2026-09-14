import {expect, test} from 'bun:test';
import {chmod, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {allApiRoutes} from '../preview-server/api-routes';
import {handleRequest} from '../preview-server/handler';

// Replace only the external skills installer; exercise the real HTTP handler and filesystem.
test.skipIf(process.platform === 'win32')(
	'Studio installs and removes a skill in the project and allows retrying',
	async () => {
		const root = await mkdtemp(path.join(tmpdir(), 'studio-install-skill-'));
		const previousPath = process.env.PATH;
		const bin = path.join(root, 'bin');
		await mkdir(bin);
		await writeFile(path.join(root, 'bun.lock'), '');
		const bunx = path.join(bin, 'bunx');
		await writeFile(
			bunx,
			`#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
fs.appendFileSync(
	'skill-calls.jsonl',
	JSON.stringify({
		args,
		disableTelemetry: process.env.DISABLE_TELEMETRY,
		launcher: path.basename(process.argv[1]),
	}) + '\\n',
);
if (fs.existsSync('fail')) {
	process.stderr.write('Could not download skills');
	process.stdout.end();
	setTimeout(() => process.exit(1), 100);
} else {
	const adding = args.includes('add');
	const skill = adding
		? args.find((arg) => arg.startsWith('remotion-dev/skills@')).slice('remotion-dev/skills@'.length)
		: args[args.indexOf('remove') + 1];
	const directory = path.join('.agents', 'skills', skill);
	if (adding) {
		fs.mkdirSync(directory, {recursive: true});
		fs.writeFileSync(path.join(directory, 'SKILL.md'), '# Installed skill');
	} else {
		fs.rmSync(directory, {recursive: true, force: true});
	}
}
`,
		);
		await chmod(bunx, 0o755);
		const npx = path.join(bin, 'npx');
		await writeFile(
			npx,
			`#!${process.execPath}
process.stderr.write('npx should not be used for a Bun project');
process.exit(1);
`,
		);
		await chmod(npx, 0o755);
		process.env.PATH = `${bin}${path.delimiter}${previousPath}`;
		const server = createServer((request, response) => {
			const handler =
				request.url === '/api/remove-remotion-skill'
					? allApiRoutes['/api/remove-remotion-skill']
					: allApiRoutes['/api/install-remotion-skill'];
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
			const request = async (
				endpoint: 'install-remotion-skill' | 'remove-remotion-skill',
				skill: string,
			) => {
				const response = await fetch(`${origin}/api/${endpoint}`, {
					method: 'POST',
					headers: {origin, 'content-type': 'application/json'},
					body: JSON.stringify({skill}),
				});
				return response.json();
			};

			expect(
				await request('install-remotion-skill', '../untrusted-skill'),
			).toMatchObject({
				success: false,
			});
			await expect(
				readFile(path.join(root, 'skill-calls.jsonl')),
			).rejects.toThrow();
			await writeFile(path.join(root, 'fail'), '');
			const failed = await request(
				'install-remotion-skill',
				'remotion-interactivity',
			);
			expect(failed.success).toBe(false);
			expect(failed.error).toContain('Could not download skills');
			await rm(path.join(root, 'fail'));
			const installed = await request(
				'install-remotion-skill',
				'remotion-interactivity',
			);
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
			const removed = await request(
				'remove-remotion-skill',
				'remotion-interactivity',
			);
			expect(removed.success).toBe(true);
			expect(removed.data.remotionInteractivitySkillAvailable).toBe(false);
			await expect(
				readFile(
					path.join(root, '.agents/skills/remotion-interactivity/SKILL.md'),
				),
			).rejects.toThrow();
			const calls = (
				await readFile(path.join(root, 'skill-calls.jsonl'), 'utf8')
			)
				.trim()
				.split('\n')
				.map((line) => JSON.parse(line));
			expect(calls).toEqual(
				[
					[
						'--silent',
						'skills@1.5.26',
						'add',
						'remotion-dev/skills@remotion-interactivity',
						'--yes',
					],
					[
						'--silent',
						'skills@1.5.26',
						'add',
						'remotion-dev/skills@remotion-interactivity',
						'--yes',
					],
					[
						'--silent',
						'skills@1.5.26',
						'remove',
						'remotion-interactivity',
						'--yes',
					],
				].map((args) => ({
					args,
					disableTelemetry: '1',
					launcher: 'bunx',
				})),
			);
		} finally {
			process.env.PATH = previousPath;
			server.closeAllConnections();
			await new Promise<void>((resolve) => server.close(() => resolve()));
			await rm(root, {recursive: true, force: true});
		}
	},
);
