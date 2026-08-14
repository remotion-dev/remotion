import {expect, test} from 'bun:test';
import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from '@earendil-works/pi-coding-agent';
import remotionCommitExtension from './index';

type Handler = (
	event: Record<string, unknown>,
	ctx: ExtensionCommandContext,
) => unknown | Promise<unknown>;
type CommandHandler = (
	args: string,
	ctx: ExtensionCommandContext,
) => unknown | Promise<unknown>;

test('queues user messages outside the temporary commit worker branch', async () => {
	const handlers = new Map<string, Handler>();
	let commitCommand: CommandHandler | undefined;
	let leafId = 'source-leaf';
	let workerStartedResolve: (() => void) | undefined;
	const workerStarted = new Promise<void>((resolve) => {
		workerStartedResolve = resolve;
	});
	const sentUserMessages: Array<{
		content: unknown;
		options: unknown;
	}> = [];
	const sentCustomMessages: Array<{customType: string}> = [];

	const pi = {
		on(event: string, handler: Handler) {
			handlers.set(event, handler);
		},
		registerCommand(_name: string, options: {handler: CommandHandler}) {
			commitCommand = options.handler;
		},
		sendMessage(message: {customType: string}) {
			sentCustomMessages.push(message);
			if (message.customType === 'remotion-commit-worker-prompt') {
				leafId = 'worker-leaf';
				workerStartedResolve?.();
			}
		},
		sendUserMessage(content: unknown, options: unknown) {
			sentUserMessages.push({content, options});
		},
	} as unknown as ExtensionAPI;
	const context = {
		isIdle: () => true,
		waitForIdle: async () => undefined,
		navigateTree: async (targetId: string) => {
			leafId = targetId;
			return {cancelled: false};
		},
		sessionManager: {
			getLeafId: () => leafId,
		},
		ui: {
			notify: () => undefined,
			setStatus: () => undefined,
		},
	} as unknown as ExtensionCommandContext;

	remotionCommitExtension(pi);
	const commandPromise = commitCommand?.('', context);
	await workerStarted;

	const steerResult = await handlers.get('input')?.(
		{
			text: 'Do not steer the worker',
			source: 'interactive',
			streamingBehavior: 'steer',
		},
		context,
	);
	const followUpResult = await handlers.get('input')?.(
		{
			text: 'Run this after the worker exits',
			source: 'interactive',
			streamingBehavior: 'followUp',
		},
		context,
	);

	expect(steerResult).toEqual({action: 'handled'});
	expect(followUpResult).toEqual({action: 'handled'});
	expect(sentUserMessages).toEqual([]);
	expect(leafId).toBe('worker-leaf');

	await handlers.get('agent_end')?.(
		{
			messages: [
				{customType: 'remotion-commit-worker-prompt'},
				{
					role: 'assistant',
					content: [
						{
							type: 'text',
							text: [
								'status: no_changes',
								'commit: none',
								'pr: none',
								'verification: Not run',
								'notes: none',
							].join('\n'),
						},
					],
				},
			],
		},
		context,
	);
	await commandPromise;

	expect(leafId).toBe('source-leaf');
	expect(sentCustomMessages.at(-1)?.customType).toBe('remotion-commit-result');
	expect(sentUserMessages).toEqual([
		{content: 'Do not steer the worker', options: undefined},
	]);

	await handlers.get('agent_start')?.({}, context);
	expect(sentUserMessages).toEqual([
		{content: 'Do not steer the worker', options: undefined},
		{
			content: 'Run this after the worker exits',
			options: {deliverAs: 'followUp'},
		},
	]);
});
