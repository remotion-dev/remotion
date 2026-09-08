import {afterEach, expect, test} from 'bun:test';
import type {Caption} from '@remotion/captions';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {CaptionInspector} from '../components/CaptionInspector';
import {SetSelectedModalContext, type ModalState} from '../state/modals';

afterEach(cleanup);

test('imports captions from a JSON file in the public folder', async () => {
	let selectedModal: ModalState | null = null;
	const importResult: {captions: Caption[] | null} = {captions: null};
	const previousFetch = globalThis.fetch;
	globalThis.fetch = ((input) => {
		expect(input).toBe('/captions.json');
		return Promise.resolve(
			new Response(
				JSON.stringify([
					{
						text: 'From public folder',
						startMs: 0,
						endMs: 1000,
						timestampMs: null,
						confidence: null,
					},
				]),
			),
		);
	}) as typeof fetch;

	try {
		render(
			<SetSelectedModalContext.Provider
				value={{
					setSelectedModal: (update) => {
						selectedModal =
							typeof update === 'function' ? update(selectedModal) : update;
					},
				}}
			>
				<CaptionInspector
					captions={[]}
					expanded={false}
					onTextChange={() => undefined}
					onTextSave={null}
					onTextCancel={null}
					onReplaceCaptions={(captions) => {
						importResult.captions = captions;
					}}
					onToggle={() => undefined}
					readOnly={false}
					readOnlyTitle={null}
				/>
			</SetSelectedModalContext.Provider>,
		);

		fireEvent.click(screen.getByRole('button', {name: 'Import captions'}));
		const modal = selectedModal as ModalState | null;
		if (modal?.type !== 'quick-switcher' || modal.assetSelection === null) {
			throw new Error('Expected asset Quick Switcher to open');
		}

		const {assetSelection} = modal;

		expect(assetSelection.initialQuery).toBe('type:json');
		await act(async () => {
			await (assetSelection.onSelected({
				lastModified: 0,
				name: 'captions.json',
				sizeInBytes: 1,
				src: '/captions.json',
			}) as unknown as Promise<void>);
		});

		expect(importResult.captions).toEqual([
			{
				text: 'From public folder',
				startMs: 0,
				endMs: 1000,
				timestampMs: null,
				confidence: null,
			},
		]);
	} finally {
		globalThis.fetch = previousFetch;
	}
});
