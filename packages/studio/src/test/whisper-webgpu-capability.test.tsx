import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {ModalsProvider} from '../components/ModalsProvider';
import {TranscriptionModalWithOptionalWhisper} from '../components/Transcription/TranscriptionModalWithOptionalWhisper';
import {
	isWhisperWebGpuInstalled,
	WHISPER_WEBGPU_PACKAGE,
} from '../components/Transcription/whisper-webgpu-capability';
import {VIDEO_MATTING_PACKAGE} from '../components/VideoMatting/video-matting-capability';
import {VideoMattingModalWithOptionalPackage} from '../components/VideoMatting/VideoMattingModalWithOptionalPackage';
import {
	TRANSFORMERS_PACKAGE,
	withRequiredAuxiliaryPackages,
} from '../helpers/optional-package-dependencies';

const originalInstalledPackages = window.remotion_installedPackages;

afterEach(() => {
	cleanup();
	window.remotion_installedPackages = originalInstalledPackages;
});

test('detects whether Whisper WebGPU is installed in the project', () => {
	window.remotion_installedPackages = [];
	expect(isWhisperWebGpuInstalled()).toBe(false);
	window.remotion_installedPackages = [WHISPER_WEBGPU_PACKAGE];
	expect(isWhisperWebGpuInstalled()).toBe(true);
});

test('adds the pinned Transformers version to AI package installations', () => {
	for (const packageName of [WHISPER_WEBGPU_PACKAGE, VIDEO_MATTING_PACKAGE]) {
		expect(
			withRequiredAuxiliaryPackages([{name: packageName, version: null}]),
		).toEqual([
			{name: packageName, version: null},
			{name: TRANSFORMERS_PACKAGE, version: '4.2.0'},
		]);
	}
});

test('asks before installing Whisper for transcription', () => {
	window.remotion_installedPackages = [];
	const {container, getByRole} = render(
		<ModalsProvider>
			<TranscriptionModalWithOptionalWhisper
				state={{
					type: 'transcribe',
					src: '/voice.wav',
					displayName: 'voice.wav',
					audioStreamIndex: null,
					requestInit: null,
				}}
			/>
		</ModalsProvider>,
	);

	expect(container.textContent).toContain(
		'This requires installing @remotion/whisper-webgpu and @huggingface/transformers. Continue?',
	);
	expect(getByRole('button', {name: 'Continue'})).toBeDefined();
});

test('uses the same install confirmation for video matting', () => {
	window.remotion_installedPackages = [];
	const {container, getByRole} = render(
		<ModalsProvider>
			<VideoMattingModalWithOptionalPackage
				state={{
					type: 'video-matting',
					src: '/video.webm',
					displayName: 'video.webm',
				}}
			/>
		</ModalsProvider>,
	);

	expect(container.textContent).toContain(
		`This requires installing ${VIDEO_MATTING_PACKAGE} and ${TRANSFORMERS_PACKAGE}. Continue?`,
	);
	expect(getByRole('button', {name: 'Continue'})).toBeDefined();
});

test('opens transcription after installing Whisper without restarting', async () => {
	const originalIsStudio = window.remotion_isStudio;
	const originalIsReadOnlyStudio = window.remotion_isReadOnlyStudio;
	const originalStaticBase = window.remotion_staticBase;
	window.remotion_installedPackages = [];
	window.remotion_isStudio = true;
	window.remotion_isReadOnlyStudio = false;
	window.remotion_staticBase = '';
	let resolveInstall!: (response: Response) => void;
	const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(
		(() =>
			new Promise<Response>((resolve) => {
				resolveInstall = resolve;
			})) as unknown as typeof fetch,
	);
	try {
		const {container, getByRole, getByText} = render(
			<ModalsProvider>
				<TranscriptionModalWithOptionalWhisper
					state={{
						type: 'transcribe',
						src: '/voice.wav',
						displayName: 'voice.wav',
						audioStreamIndex: null,
						requestInit: null,
					}}
				/>
			</ModalsProvider>,
		);

		fireEvent.click(getByRole('button', {name: 'Continue'}));
		const installing = getByText(
			`Installing ${WHISPER_WEBGPU_PACKAGE} and ${TRANSFORMERS_PACKAGE}…`,
		);
		expect(getComputedStyle(installing).fontFamily).toBe('sans-serif');
		expect(getComputedStyle(installing).fontSize).toBe('14px');
		expect(getComputedStyle(installing).lineHeight).toBe('1.5');
		resolveInstall(new Response(JSON.stringify({success: true, data: {}})));
		await waitFor(() => {
			expect(window.remotion_installedPackages).toContain(
				WHISPER_WEBGPU_PACKAGE,
			);
			expect(container.textContent).toContain('Output in public/');
		});
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const requestInit = fetchSpy.mock.calls[0]?.[1];
		expect(JSON.parse(String(requestInit?.body))).toEqual({
			dependencies: [
				{name: WHISPER_WEBGPU_PACKAGE, version: null},
				{name: TRANSFORMERS_PACKAGE, version: '4.2.0'},
			],
		});
		expect(window.remotion_installedPackages).toContain(TRANSFORMERS_PACKAGE);
	} finally {
		fetchSpy.mockRestore();
		window.remotion_isStudio = originalIsStudio;
		window.remotion_isReadOnlyStudio = originalIsReadOnlyStudio;
		window.remotion_staticBase = originalStaticBase;
	}
});
