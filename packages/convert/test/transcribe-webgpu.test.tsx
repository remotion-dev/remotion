import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import Display from '../app/components/transcribe/display';
import ModelSelector from '../app/components/transcribe/modelSelector';

afterEach(() => cleanup());

test('offers WebGPU model downloads', () => {
	const rendered = render(
		<ModelSelector
			cachedModels={['tiny.en']}
			selectedModel="tiny.en"
			setSelectedModel={() => undefined}
			selectedLanguage="en"
			setSelectedLanguage={() => undefined}
			disabled={false}
		/>,
	);

	const model = rendered.getByRole('combobox', {name: 'Whisper model'});
	expect(model.textContent).toContain('119.7 MB WebGPU');
	expect(model.textContent).toContain('Downloaded');
	expect(
		rendered.queryByRole('combobox', {name: 'Spoken language'}),
	).toBeNull();
});

test('offers a language selector for multilingual models', () => {
	const rendered = render(
		<ModelSelector
			cachedModels={[]}
			selectedModel="small"
			setSelectedModel={() => undefined}
			selectedLanguage="de"
			setSelectedLanguage={() => undefined}
			disabled={false}
		/>,
	);

	expect(
		rendered.getByRole('combobox', {name: 'Spoken language'}).textContent,
	).toContain('German');
});

test('offers transcription actions underneath the transcript', async () => {
	const originalCreateObjectUrl = URL.createObjectURL;
	const originalRevokeObjectUrl = URL.revokeObjectURL;
	const originalAnchorClick = HTMLAnchorElement.prototype.click;
	const originalClipboard = Object.getOwnPropertyDescriptor(
		navigator,
		'clipboard',
	);
	const blobs: Blob[] = [];
	const revokedUrls: string[] = [];
	const downloads: Array<{filename: string; url: string}> = [];
	const copiedText: string[] = [];

	URL.createObjectURL = (blob) => {
		if (!(blob instanceof Blob)) {
			throw new Error('Expected a Blob');
		}

		blobs.push(blob);
		return `blob:transcription-${blobs.length}`;
	};
	URL.revokeObjectURL = (url) => revokedUrls.push(url);
	HTMLAnchorElement.prototype.click = function () {
		downloads.push({filename: this.download, url: this.href});
	};
	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: {
			writeText: (text: string) => {
				copiedText.push(text);
				return Promise.resolve();
			},
		},
	});

	const captions = [
		{
			text: 'Hello',
			startMs: 0,
			endMs: 500,
			timestampMs: 250,
			confidence: null,
		},
	];
	const whisperWebGpuOutput = {
		text: 'Hello',
		words: [
			{
				text: 'Hello',
				startInSeconds: 0,
				endInSeconds: 0.5,
			},
		],
		model: 'tiny.en' as const,
	};

	try {
		const rendered = render(
			<Display
				result={captions}
				time={0}
				whisperWebGpuOutput={whisperWebGpuOutput}
			/>,
		);

		const downloadCaptions = rendered.getByRole('button', {
			name: 'Download as Caption[]',
		});
		const transcript = rendered.getByText('Hello');
		expect(
			transcript.compareDocumentPosition(downloadCaptions) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();

		fireEvent.click(downloadCaptions);
		fireEvent.click(rendered.getByRole('button', {name: 'Whisper output'}));
		fireEvent.click(rendered.getByRole('button', {name: 'Copy text'}));

		expect(downloads).toEqual([
			{filename: 'captions.json', url: 'blob:transcription-1'},
			{filename: 'whisper-output.json', url: 'blob:transcription-2'},
		]);
		expect(blobs.map((blob) => blob.type)).toEqual([
			'application/json',
			'application/json',
		]);
		expect(await blobs[0]?.text()).toBe(JSON.stringify(captions, null, 2));
		expect(await blobs[1]?.text()).toBe(
			JSON.stringify(whisperWebGpuOutput, null, 2),
		);
		expect(revokedUrls).toEqual([
			'blob:transcription-1',
			'blob:transcription-2',
		]);
		expect(copiedText).toEqual(['Hello']);
	} finally {
		URL.createObjectURL = originalCreateObjectUrl;
		URL.revokeObjectURL = originalRevokeObjectUrl;
		HTMLAnchorElement.prototype.click = originalAnchorClick;
		if (originalClipboard) {
			Object.defineProperty(navigator, 'clipboard', originalClipboard);
		} else {
			Reflect.deleteProperty(navigator, 'clipboard');
		}
	}
});
