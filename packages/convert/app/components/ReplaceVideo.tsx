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
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({setSrc}) => {
	const [fileToReplace, setFileToReplace] = useState<File | null>(null);
	const [dragging, setDragging] = useState(false);

	useEffect(() => {
		if (fileToReplace) {
			return;
		}

		const onDragOver = (e: DragEvent) => {
			e.preventDefault();
			setDragging(true);
		};

		const onDragEnd = () => {
			setDragging(false);
		};

		const onDrop = (e: DragEvent) => {
			setDragging(false);
			e.preventDefault();
			const file = e.dataTransfer?.files[0];
			if (file) {
				setFileToReplace(file);
			}
		};

		document.body.addEventListener('dragover', onDragOver);
		document.body.addEventListener('dragleave', onDragEnd);
		document.body.addEventListener('drop', onDrop);

		return () => {
			document.body.removeEventListener('dragleave', onDragEnd);
			document.body.removeEventListener('dragover', onDragOver);
			document.body.removeEventListener('drop', onDrop);
		};
	}, [fileToReplace]);

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
