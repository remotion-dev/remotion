import {afterEach, expect, mock, test} from 'bun:test';
import {act, cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {ModelManager} from '../components/ModelManager';

afterEach(cleanup);

test('downloads and removes models through the shared manager', async () => {
	let finishDownload: () => void = () => undefined;
	const downloadFinished = new Promise<void>((resolve) => {
		finishDownload = resolve;
	});
	const removeModel = mock(() => Promise.resolve());
	const {getByRole, getByText} = render(
		<ModelManager
			ariaLabel="Test models"
			availableModels={[{name: 'test-model', webGpuDownloadSize: 100}]}
			description="Manage models."
			isModelCached={() => Promise.resolve(false)}
			loadModel={(_model, onProgress) => {
				onProgress(0.5);
				return downloadFinished;
			}}
			prepare={null}
			removeModel={removeModel}
			visible
		/>,
	);

	const download = await waitFor(() =>
		getByRole('button', {name: 'Download test-model'}),
	);
	fireEvent.click(download);
	expect(getByText('Downloading 50%')).toBeDefined();

	act(() => finishDownload());
	const remove = await waitFor(() =>
		getByRole('button', {name: 'Remove test-model'}),
	);
	fireEvent.click(remove);

	await waitFor(() =>
		expect(getByRole('button', {name: 'Download test-model'})).toBeDefined(),
	);
	expect(removeModel).toHaveBeenCalledWith('test-model');
});
