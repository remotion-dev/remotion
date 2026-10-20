import React, {
	createContext,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';
import {TimelineZoomActiveContext} from '../../state/timeline-zoom';

const originStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
};

const TimelineTrimOutlineTarget =
	createContext<React.RefObject<HTMLDivElement | null> | null>(null);
const TimelineTrimHighlightTarget =
	createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export const TimelineTrimOutlineContainer: React.FC<{
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties;
	readonly clipPath: string | null;
}> = ({children, style, clipPath}) => {
	const ref = useRef<HTMLDivElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);

	return (
		// Content stays masked; portaled trim targets opt into pointer events.
		<div ref={ref} style={{...style, pointerEvents: 'none'}}>
			<TimelineTrimOutlineTarget.Provider value={ref}>
				<TimelineTrimHighlightTarget.Provider value={highlightRef}>
					<div
						ref={highlightRef}
						style={{
							clipPath: clipPath ?? undefined,
							height: '100%',
							pointerEvents: 'auto',
							position: 'relative',
						}}
					>
						{children}
					</div>
				</TimelineTrimHighlightTarget.Provider>
			</TimelineTrimOutlineTarget.Provider>
		</div>
	);
};

const TimelineTrimPortal: React.FC<{
	readonly children: React.ReactNode;
	readonly targetRef: React.RefObject<HTMLDivElement | null> | null;
}> = ({children, targetRef}) => {
	const isZooming = useContext(TimelineZoomActiveContext);
	const originRef = useRef<HTMLDivElement>(null);
	const [placement, setPlacement] = useState<{
		readonly target: HTMLDivElement;
		readonly left: number;
		readonly top: number;
		readonly width: number;
		readonly height: number;
	} | null>(null);

	useLayoutEffect(() => {
		if (isZooming) {
			return;
		}

		const target = targetRef?.current;
		const origin = originRef.current;
		if (!target || !origin) {
			return;
		}

		// Preserve the local coordinate space when escaping the dimmed content.
		// Recheck after renders so a moving or resized clip keeps its handle aligned.
		const targetBounds = target.getBoundingClientRect();
		const originBounds = origin.getBoundingClientRect();
		const next = {
			target,
			left: originBounds.left - targetBounds.left,
			top: originBounds.top - targetBounds.top,
			width: originBounds.width,
			height: originBounds.height,
		};
		setPlacement((previous) =>
			previous?.target === next.target &&
			previous.left === next.left &&
			previous.top === next.top &&
			previous.width === next.width &&
			previous.height === next.height
				? previous
				: next,
		);
	}, [children, isZooming, targetRef]);

	if (targetRef === null) {
		return isZooming ? null : children;
	}

	return (
		<>
			<div ref={originRef} style={originStyle} />
			{isZooming || placement === null
				? null
				: createPortal(
						<div
							style={{
								position: 'absolute',
								left: placement.left,
								top: placement.top,
								width: placement.width,
								height: placement.height,
								pointerEvents: 'none',
								zIndex: 2,
							}}
						>
							{children}
						</div>,
						placement.target,
					)}
		</>
	);
};

export const TimelineUnclippedTrimContent: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const targetRef = useContext(TimelineTrimOutlineTarget);
	return (
		<TimelineTrimPortal targetRef={targetRef}>{children}</TimelineTrimPortal>
	);
};

export const TimelineUndimmedTrimContent: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const targetRef = useContext(TimelineTrimHighlightTarget);
	return (
		<TimelineTrimPortal targetRef={targetRef}>{children}</TimelineTrimPortal>
	);
};
