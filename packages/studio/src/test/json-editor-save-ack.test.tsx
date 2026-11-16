import {afterEach, expect, mock, test} from 'bun:test';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {act, cleanup, fireEvent, render} from '@testing-library/react';
import type {Dispatch, SetStateAction} from 'react';
import {NoReactInternals} from 'remotion/no-react';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {z} from 'zod';
import {ZodProvider} from '../components/get-zod-if-possible';
import {RenderModalJSONPropsEditor} from '../components/RenderModal/RenderModalJSONPropsEditor';
import {StudioServerConnectionCtx} from '../helpers/client-id';

afterEach(cleanup);

const createSchema = () =>
	z.object({title: z.string(), delay: z.number().min(0)});

const renderEditor = async () => {
	const initial = {title: 'initial', delay: 1};
	let value: Record<string, unknown> = initial;
	let compositionId = 'Comp';
	let schema = createSchema();
	const listeners = new Set<(event: EventSourceEvent) => void>();
	const onSave = mock(() => undefined);
	const connection = {
		previewServerState: {type: 'connected', clientId: 'test'} as const,
		configFileChangeRevision: 0,
		restartRequired: false,
		subscribeToEvent: (
			type: EventSourceEvent['type'],
			listener: (event: EventSourceEvent) => void,
		) => {
			if (type === 'default-props-updatable-changed') listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
	const setValue: Dispatch<SetStateAction<Record<string, unknown>>> = (
		next,
	) => {
		value = typeof next === 'function' ? next(value) : next;
		view.rerender(element());
	};

	const element = () => (
		<StudioServerConnectionCtx.Provider value={connection}>
			<ZodProvider>
				<RenderModalJSONPropsEditor
					value={value}
					setValue={setValue}
					onSave={onSave}
					serializedJSON={NoReactInternals.serializeJSONWithSpecialTypes({
						data: value,
						indent: 2,
						staticBase: '/testbed/',
					})}
					defaultProps={initial}
					schema={schema}
					compositionId={compositionId}
				/>
			</ZodProvider>
		</StudioServerConnectionCtx.Provider>
	);
	const view = render(element());
	await act(async () => {});
	const textarea = view.getByRole('textbox', {
		name: 'Input props JSON',
	}) as HTMLTextAreaElement;
	return {
		textarea,
		onSave,
		error: () =>
			view.container.querySelector('[data-testid="json-props-error"]')!
				.textContent,
		edit: (text: string) => fireEvent.change(textarea, {target: {value: text}}),
		acknowledge: (props: Record<string, unknown>, id = compositionId) => {
			act(() => {
				for (const listener of listeners)
					listener({
						type: 'default-props-updatable-changed',
						compositionId: id,
						result: {canUpdate: true, currentDefaultProps: props},
					});
			});
		},
		refresh: (next: Record<string, unknown>) => {
			value = next;
			view.rerender(element());
		},
		refreshSchema: () => {
			schema = createSchema();
			view.rerender(element());
		},
		selectComposition: (id: string) => {
			compositionId = id;
			view.rerender(element());
		},
	};
};

test('keeps a later invalid JSON draft when its preceding save is acknowledged', async () => {
	const editor = await renderEditor();
	editor.edit(JSON.stringify({title: 'saved', delay: 1}));
	fireEvent.blur(editor.textarea);
	expect(editor.onSave).toHaveBeenCalledTimes(1);
	editor.edit('{invalid json');
	expect(editor.error()).not.toBe('');
	editor.acknowledge({title: 'saved', delay: 1});
	expect(editor.textarea.value).toBe('{invalid json');
	expect(editor.error()).not.toBe('');
	fireEvent.blur(editor.textarea);
	expect(editor.onSave).toHaveBeenCalledTimes(1);
});

test('keeps schema-invalid JSON when unchanged saved props arrive', async () => {
	const editor = await renderEditor();
	const draft = JSON.stringify({title: 'draft', delay: -1});
	editor.edit(draft);
	expect(editor.error()).not.toBe('');
	editor.acknowledge({title: 'initial', delay: 1});
	expect(editor.textarea.value).toBe(draft);
	expect(editor.error()).not.toBe('');
});

test('keeps invalid text when equivalent controlled props or schema are refreshed', async () => {
	const editor = await renderEditor();
	editor.edit('{invalid json');
	editor.refresh({title: 'initial', delay: 1});
	editor.refreshSchema();
	expect(editor.textarea.value).toBe('{invalid json');
	expect(editor.error()).not.toBe('');
});

test('applies a genuinely changed file update and clears the draft error', async () => {
	const editor = await renderEditor();
	editor.edit('{invalid json');
	editor.acknowledge({title: 'external', delay: 2});
	expect(JSON.parse(editor.textarea.value)).toEqual({
		title: 'external',
		delay: 2,
	});
	expect(editor.error()).toBe('');
});

test('applies a genuinely changed controlled value and ignores another composition', async () => {
	const editor = await renderEditor();
	editor.edit('{invalid json');
	editor.acknowledge({title: 'other', delay: 2}, 'Other');
	expect(editor.textarea.value).toBe('{invalid json');
	editor.refresh({title: 'external', delay: 2});
	expect(JSON.parse(editor.textarea.value)).toEqual({
		title: 'external',
		delay: 2,
	});
	expect(editor.error()).toBe('');
});

test('resets an invalid draft when switching to another composition with equal props', async () => {
	const editor = await renderEditor();
	editor.edit('{invalid json');
	editor.selectComposition('Other');
	expect(JSON.parse(editor.textarea.value)).toEqual({
		title: 'initial',
		delay: 1,
	});
	expect(editor.error()).toBe('');
});
