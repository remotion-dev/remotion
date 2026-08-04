import {expect, test} from 'bun:test';
import {discoverAvailableCodingAgents} from '../helpers/coding-agent-registry';

test('discovers supported macOS coding agents without launching them', async () => {
	const existingPaths = new Set([
		'/Custom/Applications/ChatGPT.app',
		'/Users/test/Applications/Claude.app',
	]);
	const codingAgents = await discoverAvailableCodingAgents({
		platform: 'darwin',
		homeDirectory: '/Users/test',
		pathExists: (filePath) => existingPaths.has(filePath),
		findMacApplications: (bundleIdentifier) =>
			Promise.resolve(
				bundleIdentifier === 'com.openai.codex'
					? ['/Custom/Applications/ChatGPT.app']
					: [],
			),
	});

	expect(codingAgents).toEqual([
		{
			applicationPath: '/Custom/Applications/ChatGPT.app',
			id: 'codex',
			name: 'Codex',
		},
		{
			applicationPath: '/Users/test/Applications/Claude.app',
			id: 'claude-code',
			name: 'Claude Code',
		},
	]);
});

test('does not report coding agents on unsupported platforms', async () => {
	const codingAgents = await discoverAvailableCodingAgents({
		platform: 'linux',
		homeDirectory: '/home/test',
		pathExists: () => true,
		findMacApplications: () => Promise.resolve(['/Applications/ChatGPT.app']),
	});

	expect(codingAgents).toEqual([]);
});
