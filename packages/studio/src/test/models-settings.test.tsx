import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {ModelsSettings} from '../components/ModelsSettings';
import {WHISPER_WEBGPU_PACKAGE} from '../components/Transcription/whisper-webgpu-capability';
import {VIDEO_MATTING_PACKAGE} from '../components/VideoMatting/video-matting-capability';

const originalInstalledPackages = window.remotion_installedPackages;
const originalIsStudio = window.remotion_isStudio;
const originalStaticBase = window.remotion_staticBase;

afterEach(() => {
	cleanup();
	window.remotion_installedPackages = originalInstalledPackages;
	window.remotion_isStudio = originalIsStudio;
	window.remotion_staticBase = originalStaticBase;
});

test('offers to install missing model packages and loads models in place', async () => {
	window.remotion_installedPackages = [];
	window.remotion_isStudio = true;
	window.remotion_staticBase = '';
	const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
		new Response(JSON.stringify({success: true, data: {}})),
	);

	try {
		const {getAllByRole, getByRole} = render(<ModelsSettings />);
		expect(getAllByRole('button', {name: 'Install'})).toHaveLength(2);

		fireEvent.click(getAllByRole('button', {name: 'Install'})[0]);
		await waitFor(() => {
			expect(window.remotion_installedPackages).toContain(
				WHISPER_WEBGPU_PACKAGE,
			);
			expect(getByRole('list', {name: 'Whisper models'})).toBeDefined();
		});
		expect(window.remotion_installedPackages).not.toContain(
			VIDEO_MATTING_PACKAGE,
		);
		expect(getAllByRole('button', {name: 'Install'})).toHaveLength(1);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	} finally {
		fetchSpy.mockRestore();
	}
});
