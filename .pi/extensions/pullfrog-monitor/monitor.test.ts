import type {ExtensionAPI} from '@earendil-works/pi-coding-agent';
import {expect, test} from 'bun:test';
import {fetchMonitorStatus} from './index';

const result = (stdout: string, code = 0) => ({
	stdout,
	stderr: '',
	code,
	killed: false,
});

test('waits for a workflow link newer than the Pullfrog trigger', async () => {
	let workflowRequests = 0;
	const pi = {
		exec: async (command: string, args: string[]) => {
			if (command === 'git' && args[0] === 'symbolic-ref') {
				return result('feature\n');
			}
			if (command === 'git' && args[0] === 'config') {
				return result('git@github.com:owner/repo.git\n');
			}
			if (command === 'gh' && args[0] === 'pr') {
				return result(
					JSON.stringify({
						number: 42,
						state: 'OPEN',
						comments: [
							{
								author: {login: 'pullfrog'},
								createdAt: '2026-01-01T00:00:00Z',
								body: 'https://github.com/owner/repo/actions/runs/100',
							},
							{
								author: {login: 'developer'},
								createdAt: '2026-01-01T00:01:00Z',
								body: '@pullfrog',
								url: 'https://github.com/owner/repo/pull/42#issuecomment-1',
							},
						],
					}),
				);
			}
			workflowRequests++;
			return result('{}');
		},
	} as ExtensionAPI;

	const monitor = await fetchMonitorStatus({pi, cwd: '/repo', cachedRun: null});
	expect(monitor.status).toEqual({
		kind: 'pending',
		prNumber: 42,
		reviewUrl: null,
	});
	expect(workflowRequests).toBe(0);
});

test('treats a submitted Pullfrog review as final without waiting for its workflow', async () => {
	let workflowRequests = 0;
	const pi = {
		exec: async (command: string, args: string[]) => {
			if (command === 'git' && args[0] === 'symbolic-ref') {
				return result('feature\n');
			}
			if (command === 'git' && args[0] === 'config') {
				return result('https://github.com/owner/repo.git\n');
			}
			if (command === 'gh' && args[0] === 'pr') {
				return result(
					JSON.stringify({
						number: 42,
						state: 'OPEN',
						comments: [
							{
								author: {login: 'developer'},
								createdAt: '2026-01-01T00:00:00Z',
								body: '@pullfrog',
							},
						],
						reviews: [
							{
								author: {login: 'pullfrog'},
								submittedAt: '2026-01-01T00:01:00Z',
								body: 'https://github.com/owner/repo/actions/runs/101/job/202',
							},
						],
					}),
				);
			}
			if (args.some((arg) => arg.includes('/pulls/42/reviews'))) {
				return result(
					JSON.stringify([
						[
							{
								body: 'https://github.com/owner/repo/actions/runs/101/job/202',
								html_url:
									'https://github.com/owner/repo/pull/42#pullrequestreview-123',
								submitted_at: '2026-01-01T00:01:00Z',
								user: {id: 226033991, login: 'pullfrog[bot]'},
							},
						],
					]),
				);
			}
			workflowRequests++;
			return result(
				JSON.stringify({id: 101, status: 'completed', conclusion: 'success'}),
			);
		},
	} as ExtensionAPI;

	const first = await fetchMonitorStatus({pi, cwd: '/repo', cachedRun: null});
	expect(first.status).toEqual({
		kind: 'completed',
		prNumber: 42,
		runId: 101,
		conclusion: 'success',
		reviewUrl: 'https://github.com/owner/repo/pull/42#pullrequestreview-123',
	});
	const second = await fetchMonitorStatus({
		pi,
		cwd: '/repo',
		cachedRun: first.run,
	});
	expect(second.status).toEqual(first.status);
	expect(workflowRequests).toBe(0);
});
