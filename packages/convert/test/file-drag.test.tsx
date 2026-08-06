import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {useState} from 'react';
import {ConvertProgress} from '../app/components/ConvertProgress';
import {ReplaceVideo} from '../app/components/ReplaceVideo';
import {
	canOfferFileDrag,
	CONVERTED_OUTPUT_DRAG_TYPE,
	MAXIMUM_SAFE_FILE_DRAG_SIZE,
	isFileDragEligible,
} from '../app/lib/file-drag';
import {TitleProvider} from '../app/lib/title-context';

afterEach(() => {
	cleanup();
});

test('uses the editable output name when dragging the completed thumbnail', async () => {
	const originalCreateObjectUrl = URL.createObjectURL;
	const originalRevokeObjectUrl = URL.revokeObjectURL;
	const revokedUrls: string[] = [];
	URL.createObjectURL = () => 'blob:converted-output';
	URL.revokeObjectURL = (url) => revokedUrls.push(url);

	const file = new File(['converted contents'], 'converted.mp4', {
		type: 'video/mp4',
	});
	const addedFiles: File[] = [];
	const dragData = new Map<string, string>();
	const dataTransfer = {
		clearData: () => dragData.clear(),
		effectAllowed: 'none',
		get files() {
			return addedFiles;
		},
		items: {
			add: (addedFile: File) => {
				addedFiles.push(addedFile);
				return {} as DataTransferItem;
			},
		},
		setData: (type: string, value: string) => dragData.set(type, value),
		get types() {
			return [...dragData.keys()];
		},
	} as unknown as DataTransfer;

	try {
		const ConvertProgressWithEditableName = () => {
			const [name, setName] = useState(file.name);

			return (
				<ConvertProgress
					bars={[]}
					done
					draggableFile={file}
					duration={1}
					isReencoding
					newName={name}
					onNameChange={setName}
					state={{
						bytesWritten: file.size,
						hasVideo: true,
						millisecondsWritten: 1000,
						overallProgress: 1,
					}}
				/>
			);
		};

		const rendered = render(
			<TitleProvider routeAction={{type: 'generic-convert'}}>
				<ConvertProgressWithEditableName />
				<ReplaceVideo src={{type: 'file', file}} setSrc={() => undefined} />
			</TitleProvider>,
		);

		const thumbnail = await waitFor(() => {
			const element = rendered.container.querySelector('[draggable="true"]');
			expect(element).not.toBeNull();
			return element as HTMLElement;
		});

		expect(thumbnail.textContent).toBe('');
		fireEvent.click(rendered.getByRole('button', {name: 'Rename file'}));
		const nameInput = rendered.getByRole('textbox', {name: 'File name'});
		fireEvent.change(nameInput, {target: {value: 'renamed.mp4'}});
		fireEvent.keyDown(nameInput, {key: 'Enter'});
		expect(rendered.getByText('renamed.mp4')).not.toBeNull();

		fireEvent.dragStart(thumbnail, {dataTransfer});

		expect(addedFiles).toHaveLength(1);
		expect(addedFiles[0]?.name).toBe('renamed.mp4');
		expect(addedFiles[0]?.type).toBe(file.type);
		expect(addedFiles[0]?.size).toBe(file.size);
		expect(dragData.get('DownloadURL')).toBe(
			'video/mp4:renamed.mp4:blob:converted-output',
		);
		expect(dragData.get(CONVERTED_OUTPUT_DRAG_TYPE)).toBe('1');

		fireEvent.dragOver(document, {dataTransfer});
		const overlay = rendered.getByText('Drop a video').parentElement;
		expect(overlay?.dataset.active).toBe('false');
		expect(overlay?.classList.contains('fixed')).toBe(true);
		expect(overlay?.classList.contains('absolute')).toBe(false);

		fireEvent.drop(document, {dataTransfer});
		expect(rendered.queryByText('Replace video?')).toBeNull();

		fireEvent.dragOver(document, {
			dataTransfer: {
				files: [file],
				types: ['Files'],
			},
		});
		await waitFor(() => expect(overlay?.dataset.active).toBe('true'));

		rendered.unmount();
		expect(revokedUrls).toEqual(['blob:converted-output']);
	} finally {
		URL.createObjectURL = originalCreateObjectUrl;
		URL.revokeObjectURL = originalRevokeObjectUrl;
	}
});

test('does not advertise unsafe outputs as file drags', () => {
	expect(
		isFileDragEligible({
			fileSize: MAXIMUM_SAFE_FILE_DRAG_SIZE,
			isFileSystemBacked: true,
		}),
	).toBe(true);
	expect(
		isFileDragEligible({
			fileSize: MAXIMUM_SAFE_FILE_DRAG_SIZE + 1,
			isFileSystemBacked: true,
		}),
	).toBe(false);
	expect(
		isFileDragEligible({
			fileSize: 1,
			isFileSystemBacked: false,
		}),
	).toBe(false);

	const rendered = render(
		<TitleProvider routeAction={{type: 'generic-convert'}}>
			<ConvertProgress
				bars={[]}
				done
				draggableFile={null}
				duration={1}
				isReencoding
				newName="converted.mp4"
				onNameChange={null}
				state={{
					bytesWritten: 1,
					hasVideo: true,
					millisecondsWritten: 1000,
					overallProgress: 1,
				}}
			/>
		</TitleProvider>,
	);

	expect(rendered.getByText('converted.mp4')).not.toBeNull();
	expect(rendered.container.querySelector('[draggable]')).toBeNull();
});

test('does not offer file dragging on touch-capable devices', () => {
	const maxTouchPoints = Object.getOwnPropertyDescriptor(
		navigator,
		'maxTouchPoints',
	);

	Object.defineProperty(navigator, 'maxTouchPoints', {
		configurable: true,
		value: 1,
	});

	try {
		expect(
			canOfferFileDrag({
				fileSize: 1,
				isFileSystemBacked: true,
			}),
		).toBe(false);
	} finally {
		if (maxTouchPoints) {
			Object.defineProperty(navigator, 'maxTouchPoints', maxTouchPoints);
		} else {
			delete (navigator as {maxTouchPoints?: number}).maxTouchPoints;
		}
	}
});
