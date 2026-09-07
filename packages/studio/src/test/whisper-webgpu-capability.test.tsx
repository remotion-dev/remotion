import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {ModalsProvider} from '../components/ModalsProvider';
import {TranscriptionModalWithOptionalWhisper} from '../components/Transcription/TranscriptionModalWithOptionalWhisper';
import {
	isWhisperWebGpuInstalled,
	WHISPER_WEBGPU_PACKAGE,
} from '../components/Transcription/whisper-webgpu-capability';

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
		'This requires installing @remotion/whisper-webgpu. Continue?',
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
	const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
		new Response(JSON.stringify({success: true, data: {}})),
	);
	try {
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

		fireEvent.click(getByRole('button', {name: 'Continue'}));
		await waitFor(() => {
			expect(window.remotion_installedPackages).toContain(
				WHISPER_WEBGPU_PACKAGE,
			);
			expect(container.textContent).toContain('Output in public/');
		});
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	} finally {
		fetchSpy.mockRestore();
		window.remotion_isStudio = originalIsStudio;
		window.remotion_isReadOnlyStudio = originalIsReadOnlyStudio;
		window.remotion_staticBase = originalStaticBase;
	}
});
