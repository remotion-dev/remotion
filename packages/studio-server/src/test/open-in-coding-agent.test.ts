import {expect, test} from 'bun:test';
import {
	chmodSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	getCodingAgentLaunchCommand,
	launchCodingAgent,
} from '../helpers/coding-agent-registry';

test('constructs macOS coding agent launch commands', () => {
	expect(
		getCodingAgentLaunchCommand({
			codingAgent: {
				applicationPath: '/Applications/ChatGPT.app',
				iconDataUrl: null,
				id: 'codex',
				name: 'Codex',
			},
			projectPath: '/Users/test/My Project',
		}),
	).toEqual({
		command: '/Applications/ChatGPT.app/Contents/Resources/codex',
		args: ['app', '/Users/test/My Project'],
	});

	expect(
		getCodingAgentLaunchCommand({
			codingAgent: {
				applicationPath: '/Applications/Cursor.app',
				iconDataUrl: null,
				id: 'cursor',
				name: 'Cursor',
			},
			projectPath: '/Users/test/My Project',
		}),
	).toEqual({
		command: '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
		args: ['--glass', '--suppress-popups-on-startup', '/Users/test/My Project'],
	});

	for (const codingAgent of [
		{
			applicationPath: '/Applications/GitHub Copilot.app',
			iconDataUrl: null,
			id: 'copilot' as const,
			name: 'GitHub Copilot',
		},
		{
			applicationPath: '/Applications/Claude.app',
			iconDataUrl: null,
			id: 'claude-code' as const,
			name: 'Claude Code',
		},
	]) {
		expect(
			getCodingAgentLaunchCommand({
				codingAgent,
				projectPath: '/Users/test/My Project',
			}),
		).toEqual({
			command: 'open',
			args: ['-a', codingAgent.applicationPath, '/Users/test/My Project'],
		});
	}
});

test.skipIf(process.platform === 'win32')(
	'launches the project through the coding agent executable',
	async () => {
		const directory = mkdtempSync(
			path.join(tmpdir(), 'remotion-coding-agent-launch-'),
		);
		const applicationPath = path.join(directory, 'ChatGPT.app');
		const executable = path.join(
			applicationPath,
			'Contents',
			'Resources',
			'codex',
		);
		const output = path.join(path.dirname(executable), 'received.txt');
		mkdirSync(path.dirname(executable), {recursive: true});
		writeFileSync(
			executable,
			'#!/bin/sh\nprintf "%s\\n" "$@" > "$(dirname "$0")/received.txt"\n',
		);
		chmodSync(executable, 0o755);

		try {
			const success = await launchCodingAgent({
				codingAgent: {
					applicationPath,
					iconDataUrl: null,
					id: 'codex',
					name: 'Codex',
				},
				logLevel: 'error',
				projectPath: '/Users/test/My Project',
			});
			expect(success).toBe(true);

			for (let attempt = 0; attempt < 100 && !existsSync(output); attempt++) {
				await Bun.sleep(10);
			}

			expect(readFileSync(output, 'utf8')).toBe(
				'app\n/Users/test/My Project\n',
			);
		} finally {
			rmSync(directory, {force: true, recursive: true});
		}
	},
);
