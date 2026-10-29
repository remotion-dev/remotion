import React, {useCallback, useEffect, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import '~/lib/early-file-drop';
import {CONVERTED_OUTPUT_DRAG_TYPE} from '~/lib/file-drag';
import {DragOverOverlay} from './DragOverOverlay';
import {Button} from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

const isConvertedOutputDrag = (dataTransfer: DataTransfer | null) => {
	return dataTransfer
		? Array.from(dataTransfer.types).includes(CONVERTED_OUTPUT_DRAG_TYPE)
		: false;
};

export const ReplaceVideo: React.FC<{
	readonly src: Source | null;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({src, setSrc}) => {
	const [fileToReplace, setFileToReplace] = useState<File | null>(null);
	const [dragging, setDragging] = useState(false);

	useEffect(() => {
		const onDragOver = (e: DragEvent) => {
			if (
				!Array.from(e.dataTransfer?.types ?? []).includes('Files') ||
				isConvertedOutputDrag(e.dataTransfer)
			) {
				setDragging(false);
				return;
			}

			e.preventDefault();
			setDragging(fileToReplace === null);
		};

		const onDragEnd = () => {
			setDragging(false);
		};

		const onDragLeave = (event: DragEvent) => {
			if (!event.relatedTarget) {
				setDragging(false);
			}
		};

		const onDrop = (e: DragEvent) => {
			setDragging(false);
			if (isConvertedOutputDrag(e.dataTransfer)) {
				e.preventDefault();
				return;
			}

			const file = e.dataTransfer?.files[0];
			if (file) {
				e.preventDefault();
				if (fileToReplace) {
					return;
				}

				if (src === null) {
					setSrc({type: 'file', file});
				} else {
					setFileToReplace(file);
				}
			}
		};

		const onPaste = (e: ClipboardEvent) => {
			const file = e.clipboardData?.files[0];
			if (!file) {
				return;
			}

			e.preventDefault();
			if (fileToReplace) {
				return;
			}

			if (src === null) {
				setSrc({type: 'file', file});
			} else {
				setFileToReplace(file);
			}
		};

		document.addEventListener('dragover', onDragOver, {capture: true});
		document.addEventListener('dragleave', onDragLeave, {capture: true});
		document.addEventListener('drop', onDrop, {capture: true});
		document.addEventListener('paste', onPaste, {capture: true});
		document.addEventListener('dragend', onDragEnd, {capture: true});

		const earlyDrop = window.remotionEarlyFileDrop;
		if (earlyDrop) {
			earlyDrop.stop();
			window.remotionEarlyFileDrop = null;
			if (earlyDrop.file) {
				if (src === null) {
					setSrc({type: 'file', file: earlyDrop.file});
				} else {
					setFileToReplace(earlyDrop.file);
				}
			}
		}

		return () => {
			document.removeEventListener('dragleave', onDragLeave, {capture: true});
			document.removeEventListener('dragover', onDragOver, {capture: true});
			document.removeEventListener('drop', onDrop, {capture: true});
			document.removeEventListener('paste', onPaste, {capture: true});
			document.removeEventListener('dragend', onDragEnd, {capture: true});
		};
	}, [fileToReplace, setSrc, src]);

	const keepCurrent = useCallback(() => {
		setFileToReplace(null);
	}, []);

	const replace = useCallback(() => {
		if (!fileToReplace) {
			throw new Error('No file to replace');
		}

		setSrc({type: 'file', file: fileToReplace});
		setFileToReplace(null);
	}, [fileToReplace, setSrc]);

	const onOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setFileToReplace(null);
		}
	}, []);

	return (
		<>
			<DragOverOverlay active={dragging} replacing={src !== null} />
			<Dialog open={Boolean(fileToReplace)} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-brand">Replace video?</DialogTitle>
						<div className="h-1" />
						<DialogDescription>
							The currently loaded video will be discarded.
						</DialogDescription>
						<div className="h-2" />
						<Button variant="brand" onClick={replace}>
							Replace video
						</Button>
						<Button variant="brandsecondary" onClick={keepCurrent}>
							Keep current video
						</Button>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
};
