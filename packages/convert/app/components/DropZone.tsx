import React, {useCallback, useState} from 'react';
import {formatBytes} from '~/lib/format-bytes';
import {handleDrop} from '~/lib/upload-report';
import type {UploadProgress} from '~/lib/upload-with-progress';

const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	children,
}) => {
	return (
		<div className="relative overflow-hidden flex h-40 border-black rounded-md mt-8 justify-center items-center border-solid border-2">
			{children}
		</div>
	);
};

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'waiting-for-presign';
	  }
	| {type: 'progress'; progress: UploadProgress}
	| {
			type: 'error';
			err: Error;
	  }
	| {type: 'done'; url: string; filename: string; size: number};

export const DropZone: React.FC<{
	readonly onUrl: (src: string) => void;
	readonly onFilename: (filename: string) => void;
}> = ({onUrl, onFilename}) => {
	const [progress, setProgress] = useState<State>({type: 'idle'});

	const selectVideo = useCallback(
		async (file: File) => {
			onFilename(file.name);
			setProgress({type: 'waiting-for-presign'});
			const url = await handleDrop({
				file,
				onProgress: (p) => setProgress({type: 'progress', progress: p}),
			});
			setProgress({type: 'done', url, filename: file.name, size: file.size});
			onUrl(url);
		},
		[onFilename, onUrl],
	);

	const onDrop: React.DragEventHandler = useCallback(
		async (e) => {
			const firstItem = e.dataTransfer?.files?.[0];
			if (!firstItem) {
				return;
			}

			e.preventDefault();

			await selectVideo(firstItem);
		},
		[selectVideo],
	);

	const onPick: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		async (e) => {
			const firstItem = e.target.files?.[0];
			if (!firstItem) {
				return;
			}

			await selectVideo(firstItem);
		},
		[selectVideo],
	);

	if (progress.type === 'done') {
		return (
			<Container>
				<div className="text-muted-foreground font-medium text-sm text-center">
					File uploaded!
					<br />
					{progress.filename} ({formatBytes(progress.size)})
				</div>
			</Container>
		);
	}

	if (progress.type === 'progress') {
		return (
			<Container>
				<div className="text-muted-foreground font-medium text-sm">
					Uploading {Math.round(progress.progress.progress * 100)}%
				</div>
			</Container>
		);
	}

	return (
		<Container
			onDrop={onDrop}
			data-disabled={progress.type === 'waiting-for-presign'}
			className="data-[disabled=true]:opacity-80"
		>
			<input
				type="file"
				onChange={onPick}
				disabled={progress.type === 'waiting-for-presign'}
				className="appearance-none w-full h-full bg-red-50 cursor-pointer opacity-0"
			/>
			<div className="pointer-events-none inset-0 absolute flex items-center justify-center">
				<div className="text-muted-foreground font-medium text-sm">
					{progress.type === 'waiting-for-presign' ? (
						<div>Starting Upload...</div>
					) : (
						<div>Drag a file or click here</div>
					)}
				</div>
			</div>
		</Container>
	);
};
