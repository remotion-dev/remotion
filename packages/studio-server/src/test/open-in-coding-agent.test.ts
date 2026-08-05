import {expect, test} from 'bun:test';
import {
	chmodSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
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
				launchMode: 'direct',
				name: 'Codex',
				platform: 'darwin',
				terminal: null,
			},
			projectPath: '/Users/test/My Project',
		}),
	).toEqual({
		command: '/Applications/ChatGPT.app/Contents/Resources/codex',
		args: ['app', '/Users/test/My Project'],
		cwd: null,
	});

	expect(
		getCodingAgentLaunchCommand({
			codingAgent: {
				applicationPath: '/Applications/Cursor.app',
				iconDataUrl: null,
				id: 'cursor',
				launchMode: 'direct',
				name: 'Cursor',
				platform: 'darwin',
				terminal: null,
			},
			projectPath: '/Users/test/My Project',
		}),
	).toEqual({
		command: '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
		args: ['--glass', '--suppress-popups-on-startup', '/Users/test/My Project'],
		cwd: null,
	});

	for (const codingAgent of [
		{
			applicationPath: '/Applications/GitHub Copilot.app',
			iconDataUrl: null,
			id: 'copilot' as const,
			launchMode: 'direct' as const,
			name: 'GitHub Copilot',
			platform: 'darwin' as const,
			terminal: null,
		},
		{
			applicationPath: '/Applications/Claude.app',
			iconDataUrl: null,
			id: 'claude-code' as const,
			launchMode: 'direct' as const,
			name: 'Claude Code',
			platform: 'darwin' as const,
			terminal: null,
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
			cwd: null,
		});
	}
});

test('constructs Linux coding agent launch commands', () => {
	expect(
		getCodingAgentLaunchCommand({
			codingAgent: {
				applicationPath: '/usr/local/bin/codex',
				iconDataUrl: null,
				id: 'codex',
				launchMode: 'terminal',
				name: 'Codex',
				platform: 'linux',
				terminal: {
					id: 'gnome-terminal',
					path: '/usr/bin/gnome-terminal',
				},
			},
			projectPath: '/home/test/My Project',
		}),
	).toEqual({
		command: '/usr/bin/gnome-terminal',
		args: [
			'--working-directory=/home/test/My Project',
			'--',
			'/usr/local/bin/codex',
		],
		cwd: '/home/test/My Project',
	});

	expect(
		getCodingAgentLaunchCommand({
			codingAgent: {
				applicationPath: '/usr/bin/cursor',
				iconDataUrl: null,
				id: 'cursor',
				launchMode: 'direct',
				name: 'Cursor',
				platform: 'linux',
				terminal: null,
			},
			projectPath: '/home/test/My Project',
		}),
	).toEqual({
		command: '/usr/bin/cursor',
		args: ['--glass', '--suppress-popups-on-startup', '/home/test/My Project'],
		cwd: null,
	});
});

test('constructs Windows coding agent launch commands', () => {
	expect(
		getCodingAgentLaunchCommand({
			codingAgent: {
				applicationPath: 'C:\\Tools\\copilot.cmd',
				iconDataUrl: null,
				id: 'copilot',
				launchMode: 'terminal',
				name: 'GitHub Copilot',
				platform: 'win32',
				terminal: {
					id: 'cmd',
					path: 'C:\\Windows\\System32\\cmd.exe',
				},
			},
			projectPath: 'C:\\Users\\test\\My Project',
		}),
	).toEqual({
		command: 'C:\\Windows\\System32\\cmd.exe',
		args: [
			'/d',
			'/s',
			'/c',
			'start',
			'',
			'/d',
			'C:\\Users\\test\\My Project',
			'C:\\Windows\\System32\\cmd.exe',
			'/k',
			'C:\\Tools\\copilot.cmd',
		],
		cwd: null,
	});
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
					launchMode: 'direct',
					name: 'Codex',
					platform: 'darwin',
					terminal: null,
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

test.skipIf(process.platform === 'win32')(
	'launches a terminal coding agent in the project directory',
	async () => {
		const directory = mkdtempSync(
			path.join(tmpdir(), 'remotion-terminal-coding-agent-launch-'),
		);
		const projectPath = path.join(directory, 'My Project');
		const applicationPath = path.join(directory, 'codex');
		const terminalPath = path.join(directory, 'gnome-terminal');
		const output = path.join(directory, 'received.txt');
		mkdirSync(projectPath);
		writeFileSync(
			applicationPath,
			`#!/bin/sh\nprintf "%s\\n" "$PWD" > "${output}"\n`,
		);
		writeFileSync(
			terminalPath,
			'#!/bin/sh\nwhile [ "$#" -gt 0 ]; do\n  if [ "$1" = "--" ]; then\n    shift\n    exec "$@"\n  fi\n  shift\ndone\n',
		);
		chmodSync(applicationPath, 0o755);
		chmodSync(terminalPath, 0o755);

		try {
			const success = await launchCodingAgent({
				codingAgent: {
					applicationPath,
					iconDataUrl: null,
					id: 'codex',
					launchMode: 'terminal',
					name: 'Codex',
					platform: 'linux',
					terminal: {id: 'gnome-terminal', path: terminalPath},
				},
				logLevel: 'error',
				projectPath,
			});
			expect(success).toBe(true);

			for (let attempt = 0; attempt < 100 && !existsSync(output); attempt++) {
				await Bun.sleep(10);
			}

			expect(readFileSync(output, 'utf8')).toBe(
				`${realpathSync(projectPath)}\n`,
			);
		} finally {
			rmSync(directory, {force: true, recursive: true});
		}
	},
);
