import {expect, test} from 'bun:test';
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import type {AddCaptionJobParams} from '../components/RenderQueue/caption-job-types';

const selectComboboxItem = async (
	combobox: HTMLElement,
	itemName: string | RegExp,
) => {
	fireEvent.click(combobox);
	const item = await screen.findByRole('button', {name: itemName});
	fireEvent.pointerUp(item, {button: 0});
};

const setNumberSetting = (name: RegExp, value: number) => {
	fireEvent.click(screen.getByRole('button', {name}));
	const input = screen.getByRole('textbox', {name});
	fireEvent.change(input, {target: {value: String(value)}});
	fireEvent.blur(input);
};

test('serializes transcription modal settings into caption jobs', async () => {
	const {portals} = await import('../components/Menu/portals');
	const previousPortals = [...portals];
	const createdPortals: HTMLElement[] = [];
	const testPortals = Array.from({length: 6}, (_, index) => {
		const id = `menuportal-${index}`;
		const existing = document.getElementById(id);
		if (existing) {
			return existing;
		}

		const element = document.createElement('div');
		element.id = id;
		document.body.appendChild(element);
		createdPortals.push(element);
		return element;
	});
	portals.splice(0, portals.length, ...testPortals);

	const originalGpuDescriptor = Object.getOwnPropertyDescriptor(
		navigator,
		'gpu',
	);
	const originalSecureContextDescriptor = Object.getOwnPropertyDescriptor(
		window,
		'isSecureContext',
	);
	const originalStaticBaseDescriptor = Object.getOwnPropertyDescriptor(
		window,
		'remotion_staticBase',
	);
	const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(
		globalThis,
		'localStorage',
	);
	const localStorageValues = new Map<string, string>();
	const localStorageMock: Storage = {
		clear: () => localStorageValues.clear(),
		getItem: (key: string) => localStorageValues.get(key) ?? null,
		key: (index: number) => [...localStorageValues.keys()][index] ?? null,
		removeItem: (key: string) => localStorageValues.delete(key),
		setItem: (key: string, value: string) => localStorageValues.set(key, value),
		get length() {
			return localStorageValues.size;
		},
	};

	Object.defineProperty(navigator, 'gpu', {
		configurable: true,
		value: {requestAdapter: () => Promise.resolve({})},
	});
	Object.defineProperty(window, 'isSecureContext', {
		configurable: true,
		value: true,
	});
	Object.defineProperty(window, 'remotion_staticBase', {
		configurable: true,
		value: '/static-test',
	});
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: localStorageMock,
	});

	try {
		const {TranscriptionModal} =
			await import('../components/Transcription/TranscriptionModal');
		const {RenderQueueContext} =
			await import('../components/RenderQueue/context');
		const {SetSelectedModalContext} = await import('../state/modals');
		const {SidebarContext} = await import('../state/sidebar');
		const submittedJobs: AddCaptionJobParams[] = [];
		const requestInit = {
			credentials: 'include',
			headers: {'x-remotion-test': 'modal-serialization'},
		} as const;

		render(
			<SetSelectedModalContext.Provider
				value={{setSelectedModal: () => undefined}}
			>
				<SidebarContext.Provider
					value={{
						sidebarCollapsedDuringDrag: null,
						sidebarCollapsedStateLeft: 'collapsed',
						sidebarCollapsedStateRight: 'collapsed',
						setSidebarCollapsedDuringDrag: () => undefined,
						setSidebarCollapsedState: () => undefined,
					}}
				>
					<RenderQueueContext.Provider
						value={
							{
								captionJobs: [],
								addCaptionJob: (params: AddCaptionJobParams) => {
									submittedJobs.push(params);
									return `caption-job-${submittedJobs.length}`;
								},
							} as never
						}
					>
						<TranscriptionModal
							type="transcribe"
							audioStreamIndex={2}
							displayName="interview.wav"
							requestInit={requestInit}
							src="/media/interview.wav"
						/>
					</RenderQueueContext.Provider>
				</SidebarContext.Provider>
			</SetSelectedModalContext.Provider>,
		);

		screen.getByRole('dialog', {
			name: 'Transcribe interview.wav',
		});
		const submit = screen.getByRole('button', {
			name: /^Transcribe$/,
		}) as HTMLButtonElement;
		await waitFor(() => expect(submit.disabled).toBe(false));
		expect(
			screen.queryByText('Runs locally as a background job using WebGPU'),
		).toBeNull();
		const outputLabel = screen.getByText('Output in public/');
		const modelLabel = screen.getByText('Whisper model');
		expect(
			outputLabel.compareDocumentPosition(modelLabel) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).not.toBe(0);
		const outputHelp = screen.getByTitle('Learn more about Output in public/');
		expect(screen.queryByText('Caption[]')).toBeNull();
		fireEvent.pointerUp(outputHelp);
		const captionType = screen.getByText('Caption[]');
		expect(captionType.style.fontFamily).toBe('monospace');
		expect(captionType.style.fontSize).toBe('inherit');
		expect(captionType.style.lineHeight).toBe('inherit');
		fireEvent.pointerUp(outputHelp);
		screen.getByTitle('Learn more about Model download');
		screen.getByTitle('Learn more about Chunk length');
		screen.getByTitle('Learn more about Stride length');
		screen.getByTitle('Learn more about Force full sequences');
		screen.getByTitle('Learn more about Use sampling');
		screen.getByTitle('Learn more about Repetition penalty');
		screen.getByTitle('Learn more about No-repeat n-gram size');

		await selectComboboxItem(screen.getByTitle('Whisper model'), /^tiny ·/);
		await selectComboboxItem(screen.getByTitle('Spoken language'), 'German');
		await selectComboboxItem(
			screen.getByRole('button', {name: 'Task: Transcribe'}),
			'Task: Translate to English',
		);
		const taskLabel = screen.getByText('Translate to English', {
			selector: 'span[aria-hidden="true"]',
		});
		expect(taskLabel.style.color).toBe('inherit');
		expect(taskLabel.style.fontFamily).toBe('inherit');
		expect(taskLabel.style.fontSize).toBe('inherit');
		expect(taskLabel.style.lineHeight).toBe('inherit');
		const taskWarning = screen.getByText(
			'Word timings may be less accurate when translating to English.',
		);
		expect(
			taskWarning.parentElement?.parentElement?.parentElement?.style.display,
		).toBe('flex');
		expect(
			taskWarning.parentElement?.parentElement?.parentElement?.style
				.justifyContent,
		).toBe('flex-end');

		const outputInput = screen.getByRole('textbox', {
			name: 'Caption output file',
		});
		expect(
			outputInput.parentElement?.parentElement?.parentElement?.style
				.paddingBottom,
		).toBe('12px');
		fireEvent.change(outputInput, {
			target: {value: 'captions/interview.json'},
		});

		const forceFullSequences = screen.getByRole('checkbox', {
			name: 'Force full sequences',
		});
		const useSampling = screen.getByRole('checkbox', {
			name: 'Use sampling',
		});
		for (const checkbox of [forceFullSequences, useSampling]) {
			const checkboxLabel = document.querySelector(
				`label[for="${checkbox.id}"]`,
			) as HTMLLabelElement | null;
			expect(checkboxLabel?.style.color).toBe('inherit');
			expect(checkboxLabel?.style.fontFamily).toBe('inherit');
			expect(checkboxLabel?.style.fontSize).toBe('inherit');
			expect(checkboxLabel?.style.lineHeight).toBe('inherit');
		}

		act(() => forceFullSequences.click());
		act(() => useSampling.click());
		screen.getByTitle('Learn more about Temperature');
		screen.getByTitle('Learn more about Top K');

		setNumberSetting(/^Chunk length:/, 22);
		setNumberSetting(/^Stride length:/, 4);
		setNumberSetting(/^Temperature:/, 0.7);
		setNumberSetting(/^Top K:/, 25);
		setNumberSetting(/^Repetition penalty:/, 1.2);
		setNumberSetting(/^No-repeat n-gram size:/, 3);

		act(() => useSampling.click());
		fireEvent.click(submit);
		act(() => forceFullSequences.click());
		act(() => useSampling.click());
		fireEvent.click(submit);

		const commonJob = {
			audioStreamIndex: 2,
			chunkLengthInSeconds: 22,
			displayName: 'interview.wav',
			language: 'de',
			model: 'tiny',
			noRepeatNgramSize: 3,
			outName: 'captions/interview.json',
			repetitionPenalty: 1.2,
			requestInit,
			src: '/media/interview.wav',
			strideLengthInSeconds: 4,
			task: 'translate',
			temperature: 0.7,
			topK: 25,
		} satisfies Omit<AddCaptionJobParams, 'doSample' | 'forceFullSequences'>;
		expect(submittedJobs).toEqual([
			{...commonJob, doSample: false, forceFullSequences: true},
			{...commonJob, doSample: true, forceFullSequences: false},
		]);
	} finally {
		cleanup();
		portals.splice(0, portals.length, ...previousPortals);
		for (const portal of createdPortals) {
			portal.remove();
		}

		if (originalGpuDescriptor) {
			Object.defineProperty(navigator, 'gpu', originalGpuDescriptor);
		} else {
			Reflect.deleteProperty(navigator, 'gpu');
		}

		if (originalSecureContextDescriptor) {
			Object.defineProperty(
				window,
				'isSecureContext',
				originalSecureContextDescriptor,
			);
		} else {
			Reflect.deleteProperty(window, 'isSecureContext');
		}

		if (originalStaticBaseDescriptor) {
			Object.defineProperty(
				window,
				'remotion_staticBase',
				originalStaticBaseDescriptor,
			);
		} else {
			Reflect.deleteProperty(window, 'remotion_staticBase');
		}

		if (originalLocalStorageDescriptor) {
			Object.defineProperty(
				globalThis,
				'localStorage',
				originalLocalStorageDescriptor,
			);
		} else {
			Reflect.deleteProperty(globalThis, 'localStorage');
		}
	}
});
