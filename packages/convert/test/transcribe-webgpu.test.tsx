import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import ModelSelector from '../app/components/transcribe/modelSelector';
import TranscribeAudio from '../app/components/transcribe/transcribeAudio';

afterEach(() => cleanup());

test('offers WebGPU model downloads', () => {
	const rendered = render(
		<ModelSelector
			cachedModels={['tiny.en']}
			selectedModel="tiny.en"
			setSelectedModel={() => undefined}
			disabled={false}
		/>,
	);

	const model = rendered.getByRole('combobox', {name: 'Whisper model'});
	expect(model.textContent).toContain('119.7 MB WebGPU');
	expect(model.textContent).toContain('Downloaded');
});

test('downloads captions and raw Whisper output as JSON', async () => {
	const originalCreateObjectUrl = URL.createObjectURL;
	const originalRevokeObjectUrl = URL.revokeObjectURL;
	const originalAnchorClick = HTMLAnchorElement.prototype.click;
	const blobs: Blob[] = [];
	const revokedUrls: string[] = [];
	const downloads: Array<{filename: string; url: string}> = [];

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
			<TranscribeAudio
				source={{type: 'file', file: new File([], 'audio.mp3')}}
				selectedModel="tiny.en"
				name="audio.mp3"
				state={{
					type: 'done',
					result: captions,
					whisperWebGpuOutput,
				}}
				setState={() => undefined}
			/>,
		);

		fireEvent.click(
			rendered.getByRole('button', {name: 'Download captions.json'}),
		);
		fireEvent.click(
			rendered.getByRole('button', {name: 'Download raw Whisper output'}),
		);

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
	} finally {
		URL.createObjectURL = originalCreateObjectUrl;
		URL.revokeObjectURL = originalRevokeObjectUrl;
		HTMLAnchorElement.prototype.click = originalAnchorClick;
	}
});
