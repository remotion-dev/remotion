import type {MediaFox, PlayerStateData} from '@mediafox/core';
import type {CropRectangle} from 'mediabunny';
import type React from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {CropBackdrop} from './Backdrop';
import {DragHandle} from './DragHandle';
import {EdgeHandle} from './EdgeHandle';
import {ResizeHandle} from './ResizeHandle';
import {
	HorizontalPositionIndicator,
	VerticalPositionIndicator,
} from './VerticalPositionIndicator';

export const CropUI: React.FC<{
	readonly mediaFox: MediaFox;
	readonly unclampedRect: CropRectangle;
	readonly setUnclampedRect: React.Dispatch<
		React.SetStateAction<CropRectangle>
	>;
}> = ({mediaFox, unclampedRect, setUnclampedRect}) => {
	const [state, setState] = useState<PlayerStateData | null>(() =>
		mediaFox.getState(),
	);

	const [isDragging, setMarkAsDragging] = useState(false);

	const ref = useRef<HTMLDivElement>(null);

	const dimensions = useMemo(() => {
		if (!state) {
			return null;
		}

		const selectedVideoTrack = state.videoTracks.find(
			(t) => t.id === state.selectedVideoTrack,
		);

		if (!selectedVideoTrack) {
			return null;
		}

		return {
			width: selectedVideoTrack.width,
			height: selectedVideoTrack.height,
		};
	}, [state]);

	useEffect(() => {
		const handleTrackChange = () => {
			setState(mediaFox.getState());
		};

		mediaFox.on('trackchange', handleTrackChange);
		mediaFox.on('loadedmetadata', handleTrackChange);
		return () => {
			mediaFox.off('trackchange', handleTrackChange);
			mediaFox.off('loadedmetadata', handleTrackChange);
		};
	}, [mediaFox]);

	if (!dimensions) {
		return null;
	}

	const rect = (() => {
		const width = Math.min(
			(dimensions?.width ?? 0) - unclampedRect.left,
			Number.isFinite(unclampedRect.width)
				? unclampedRect.width
				: (dimensions?.width ?? 0),
		);
		const height = Math.min(
			(dimensions?.height ?? 0) - unclampedRect.top,
			Number.isFinite(unclampedRect.height)
				? unclampedRect.height
				: (dimensions?.height ?? 0),
		);

		return {
			left: unclampedRect.left,
			top: unclampedRect.top,
			width,
			height,
		};
	})();

	return (
		<div
			ref={ref}
			className="absolute w-full"
			style={{
				aspectRatio: `${dimensions.width} / ${dimensions.height}`,
			}}
		>
			<VerticalPositionIndicator
				xPosition={rect.left}
				width={dimensions.width}
				isDragging={isDragging}
			/>
			<VerticalPositionIndicator
				xPosition={rect.left + rect.width}
				width={dimensions.width}
				isDragging={isDragging}
			/>
			<HorizontalPositionIndicator
				yPosition={rect.top}
				height={dimensions.height}
				isDragging={isDragging}
			/>
			<HorizontalPositionIndicator
				yPosition={rect.top + rect.height}
				height={dimensions.height}
				isDragging={isDragging}
			/>
			<CropBackdrop rect={rect} dimensions={dimensions} />
			<div
				className="border-brand absolute border-2 rounded-md flex flex-col items-center justify-center pointer-events-none"
				style={{
					width: (rect.width / dimensions.width) * 100 + '%',
					height: (rect.height / dimensions.height) * 100 + '%',
					left: (rect.left / dimensions.width) * 100 + '%',
					top: (rect.top / dimensions.height) * 100 + '%',
				}}
			>
				<div className="bg-brand inline-block text-white px-3 py-1 text-sm font-brand rounded-full">
					{rect.width}x{rect.height}
				</div>
			</div>
			<DragHandle
				divRef={ref}
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<EdgeHandle
				divRef={ref}
				position="top"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<EdgeHandle
				divRef={ref}
				position="right"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<EdgeHandle
				divRef={ref}
				position="bottom"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<EdgeHandle
				divRef={ref}
				position="left"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<ResizeHandle
				divRef={ref}
				position="top-left"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<ResizeHandle
				divRef={ref}
				position="top-right"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<ResizeHandle
				divRef={ref}
				position="bottom-left"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
			<ResizeHandle
				divRef={ref}
				position="bottom-right"
				dimensions={dimensions}
				rect={rect}
				updateRect={setUnclampedRect}
				setMarkAsDragging={setMarkAsDragging}
			/>
		</div>
	);
};
