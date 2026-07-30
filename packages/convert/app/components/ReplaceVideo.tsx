import React, {useCallback, useEffect, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {DragOverOverlay} from './DragOverOverlay';
import {Button} from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

export const ReplaceVideo: React.FC<{
	readonly src: Source | null;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({src, setSrc}) => {
	const [fileToReplace, setFileToReplace] = useState<File | null>(null);
	const [dragging, setDragging] = useState(false);

	useEffect(() => {
		if (fileToReplace) {
			return;
		}

		const onDragOver = (e: DragEvent) => {
			e.preventDefault();
			setDragging(src !== null);
		};

		const onDragEnd = () => {
			setDragging(false);
		};

		const onDrop = (e: DragEvent) => {
			setDragging(false);
			e.preventDefault();
			const file = e.dataTransfer?.files[0];
			if (file) {
				if (src === null) {
					setSrc({type: 'file', file});
				} else {
					setFileToReplace(file);
				}
			}
		};

		document.addEventListener('dragover', onDragOver, {capture: true});
		document.addEventListener('dragleave', onDragEnd, {capture: true});
		document.addEventListener('drop', onDrop, {capture: true});

		return () => {
			document.removeEventListener('dragleave', onDragEnd, {capture: true});
			document.removeEventListener('dragover', onDragOver, {capture: true});
			document.removeEventListener('drop', onDrop, {capture: true});
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
			<DragOverOverlay active={dragging} />
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
