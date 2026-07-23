import {useCallback, useEffect, useMemo, useRef} from 'react';
import {NoReactInternals} from 'remotion/no-react';

export const isFileDragEvent = (event: {
	readonly dataTransfer: DataTransfer;
}): boolean => {
	return Array.from(event.dataTransfer.types).includes('Files');
};

function useAssetDragEvents({
	name,
	parentFolder,
	dropLocation,
	setDropLocation,
}: {
	name: string | null;
	parentFolder: string | null;
	dropLocation: string | null;
	setDropLocation: React.Dispatch<React.SetStateAction<string | null>>;
}) {
	const dragDepthRef = useRef(0);

	const combinedParents = useMemo(() => {
		return [parentFolder, name].filter(NoReactInternals.truthy).join('/');
	}, [name, parentFolder]);

	const isDropDiv = useMemo(() => {
		return dropLocation === combinedParents;
	}, [combinedParents, dropLocation]);

	const onDragEnter: React.DragEventHandler = useCallback(
		(event) => {
			if (!isFileDragEvent(event)) {
				return;
			}

			if (dragDepthRef.current === 0) {
				setDropLocation((currentDropLocation) =>
					currentDropLocation?.includes(combinedParents)
						? currentDropLocation
						: combinedParents,
				);
			}

			dragDepthRef.current++;
		},
		[combinedParents, dragDepthRef, setDropLocation],
	);

	const onDragLeave: React.DragEventHandler = useCallback(
		(event) => {
			if (!isFileDragEvent(event)) {
				return;
			}

			dragDepthRef.current--;
			if (dragDepthRef.current === 0) {
				setDropLocation((currentPath) =>
					currentPath === combinedParents ? parentFolder : currentPath,
				);
			}
		},
		[combinedParents, dragDepthRef, parentFolder, setDropLocation],
	);

	useEffect(() => {
		if (dropLocation === null) {
			dragDepthRef.current = 0;
		}
	}, [dropLocation]);

	return {
		isDropDiv,
		onDragEnter,
		onDragLeave,
	};
}

export default useAssetDragEvents;
