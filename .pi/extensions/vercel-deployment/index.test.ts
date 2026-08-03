import {expect, test} from 'bun:test';
import type {
	ExtensionAPI,
	ExtensionContext,
} from '@earendil-works/pi-coding-agent';
import remotionVercelDeployment, {
	parseVercelComment,
	VERCEL_WIDGET_KEY,
} from './index';

const REMOTION_PREVIEW = 'https://remotion-git-feature-remotion.vercel.app';
const REMOTION_DEPLOYMENT =
	'https://vercel.com/remotion/remotion/remotion-feature-123';

const vercelComment = (
	status = 'Ready',
) => `The latest updates on your projects.

| Project | Deployment | Actions | Updated (UTC) |
| :--- | :----- | :------ | :------ |
| [bugs](https://vercel.com/remotion/bugs) | ![Ready](status.svg) [Ready](https://vercel.com/remotion/bugs/bugs-123) | [Preview](https://bugs-git-feature-remotion.vercel.app) | now |
| [remotion](https://vercel.com/remotion/remotion) | ![${status}](status.svg) [${status}](${REMOTION_DEPLOYMENT}) | [Preview](${REMOTION_PREVIEW}) | now |`;

const result = (stdout: string, code = 0) => ({
	stdout,
	stderr: '',
	code,
	killed: false,
});

const flushBackground = async () => {
	for (let index = 0; index < 12; index++) {
		await Promise.resolve();
	}
};

const stripHyperlinks = (value: string) =>
	value.replace(/\u001B\]8;;[^\u001B]*\u001B\\/g, '');

type Handler = (
	event: Record<string, unknown>,
	ctx: ExtensionContext,
) => void | Promise<void>;

test('shows the remotion PR preview on the right without replacing work-context', async () => {
	const handlers = new Map<string, Handler>();
	const widgets = new Map<
		string,
		{
			content: unknown;
			options: unknown;
		}
	>();
	const calls: Array<{command: string; args: string[]; options: unknown}> = [];
	const pi = {
		exec: async (command: string, args: string[], options: unknown) => {
			calls.push({command, args, options});
			return result(
				JSON.stringify({
					number: 10101,
					state: 'OPEN',
					comments: [
						{
							author: {login: 'someone-else'},
							createdAt: '2026-08-03T10:01:00Z',
							body: vercelComment('Failed'),
						},
						{
							author: {login: 'vercel'},
							createdAt: '2026-08-03T10:00:00Z',
							body: vercelComment(),
						},
					],
				}),
			);
		},
		on: (event: string, handler: Handler) => {
			handlers.set(event, handler);
		},
	} as unknown as ExtensionAPI;
	const context = {
		cwd: '/repo',
		mode: 'tui',
		ui: {
			setWidget(key: string, content: unknown, options?: unknown) {
				if (content === undefined) {
					widgets.delete(key);
				} else {
					widgets.set(key, {content, options});
				}
			},
		},
	} as unknown as ExtensionContext;

	remotionVercelDeployment(pi);
	await handlers.get('session_start')?.({reason: 'startup'}, context);
	await flushBackground();

	expect(calls).toEqual([
		{
			command: 'gh',
			args: ['pr', 'view', '--json', 'number,state,comments'],
			options: {cwd: '/repo', timeout: 30_000},
		},
	]);
	expect(widgets.has('work-context')).toBe(false);
	const widget = widgets.get(VERCEL_WIDGET_KEY);
	expect(widget?.options).toEqual({placement: 'belowEditor'});
	expect(typeof widget?.content).toBe('function');
	const component = (
		widget?.content as (
			tui: unknown,
			theme: {fg: (color: string, text: string) => string},
		) => {render: (width: number) => string[]}
	)({}, {fg: (_color, text) => text});
	const [line] = component.render(80);
	expect(stripHyperlinks(line).trimStart()).toBe('Vercel ✓ Preview ↗');
	expect(line.startsWith(' ')).toBe(true);
	expect([...stripHyperlinks(line)].length).toBe(80);
	expect(line).toContain(`\u001B]8;;${REMOTION_PREVIEW}/\u001B\\Preview ↗`);
	expect(line).not.toContain('bugs-git-feature');

	for (const width of [0, 1, 5, 9, 12]) {
		const [narrowLine] = component.render(width);
		expect([...stripHyperlinks(narrowLine)].length).toBe(width);
	}

	await handlers.get('session_shutdown')?.({reason: 'quit'}, context);
	expect(widgets.has(VERCEL_WIDGET_KEY)).toBe(false);
});

test('falls back to Vercel comment metadata and validates both URLs', () => {
	const body = JSON.stringify({
		projects: [
			{
				name: 'bugs',
				inspectorUrl: 'https://vercel.com/remotion/bugs/bugs-123',
				previewUrl: 'bugs-git-feature-remotion.vercel.app',
				nextCommitStatus: 'DEPLOYED',
			},
			{
				name: 'remotion',
				inspectorUrl: REMOTION_DEPLOYMENT,
				previewUrl: 'remotion-git-feature-remotion.vercel.app',
				nextCommitStatus: 'BUILDING',
			},
		],
	});
	const encoded = Buffer.from(body).toString('base64');

	expect(parseVercelComment(`[vc]: #signature:${encoded}`)).toEqual({
		previewUrl: `${REMOTION_PREVIEW}/`,
		deploymentUrl: REMOTION_DEPLOYMENT,
		state: 'pending',
	});
	expect(
		parseVercelComment(
			vercelComment().replace(
				REMOTION_PREVIEW,
				'https://remotion.vercel.app.example.com',
			),
		),
	).toBeNull();
});
