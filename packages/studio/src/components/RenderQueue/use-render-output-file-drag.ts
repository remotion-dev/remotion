import type {DragEventHandler} from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {remotion_outputsBase} from '../../helpers/get-asset-metadata';
import type {AnyRenderJob} from './context';
import {isClientRenderJob} from './context';

const MAXIMUM_SAFE_FILE_DRAG_SIZE = 500 * 1024 * 1024;

const getFilename = (outName: string) => {
	return outName.split(/[/\\]/).at(-1) ?? outName;
};

const isChrome = () => {
	return (
		/Chrome\/\d/.test(navigator.userAgent) &&
		!/(Edg|OPR|SamsungBrowser|YaBrowser)\//.test(navigator.userAgent)
	);
};

export const useRenderOutputFileDrag = (job: AnyRenderJob) => {
	const deletedOutputLocation =
		'deletedOutputLocation' in job && job.deletedOutputLocation;
	const [isDragging, setIsDragging] = useState(false);
	const [clientFile, setClientFile] = useState<{
		file: File;
		objectUrl: string;
	} | null>(null);

	const clientBlobInfo = useMemo(() => {
		if (
			!isClientRenderJob(job) ||
			job.status !== 'done' ||
			job.getBlob === undefined
		) {
			return null;
		}

		return {
			getBlob: job.getBlob,
			sizeInBytes: job.metadata.sizeInBytes,
		};
	}, [job]);
	const clientJobWithBlob = clientBlobInfo !== null;

	useEffect(() => {
		if (
			!clientBlobInfo ||
			clientBlobInfo.sizeInBytes <= 0 ||
			clientBlobInfo.sizeInBytes > MAXIMUM_SAFE_FILE_DRAG_SIZE ||
			typeof File === 'undefined' ||
			typeof URL.createObjectURL !== 'function'
		) {
			setClientFile(null);
			return;
		}

		let cancelled = false;
		let objectUrl: string | null = null;
		const filename = getFilename(job.outName);

		clientBlobInfo
			.getBlob()
			.then((blob) => {
				if (cancelled) {
					return;
				}

				const file = new File([blob], filename, {
					lastModified: blob instanceof File ? blob.lastModified : Date.now(),
					type: blob.type,
				});
				objectUrl = URL.createObjectURL(file);
				setClientFile({file, objectUrl});
			})
			.catch(() => {
				if (!cancelled) {
					setClientFile(null);
				}
			});

		return () => {
			cancelled = true;
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [clientBlobInfo, job.outName]);

	const canUseFileDrag =
		typeof DataTransfer !== 'undefined' &&
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(any-pointer: fine)').matches &&
		navigator.maxTouchPoints === 0 &&
		isChrome();
	const canDrag =
		canUseFileDrag &&
		job.status === 'done' &&
		job.type !== 'sequence' &&
		!deletedOutputLocation &&
		(clientJobWithBlob ? clientFile !== null : true);

	const onDragStart: DragEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			if (!canDrag) {
				event.preventDefault();
				return;
			}

			try {
				const filename = getFilename(job.outName);
				const source = clientFile
					? clientFile.objectUrl
					: new URL(
							`${remotion_outputsBase}/${job.outName}`,
							window.location.href,
						).href;
				const mimeType = clientFile?.file.type || 'application/octet-stream';

				event.dataTransfer.clearData();
				event.dataTransfer.effectAllowed = 'copy';
				if (clientFile) {
					const item = event.dataTransfer.items.add(clientFile.file);
					if (item === null) {
						event.preventDefault();
						return;
					}
				}

				event.dataTransfer.setData(
					'DownloadURL',
					`${mimeType}:${filename}:${source}`,
				);
				setIsDragging(true);
			} catch {
				event.preventDefault();
			}
		},
		[canDrag, clientFile, job.outName],
	);
	const onDragEnd = useCallback(() => {
		setIsDragging(false);
	}, []);

	return {canDrag, isDragging, onDragEnd, onDragStart};
};
