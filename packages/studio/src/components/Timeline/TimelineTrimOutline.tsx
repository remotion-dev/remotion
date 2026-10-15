import React, {
	createContext,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';

const TimelineTrimOutlineTarget =
	createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export const TimelineTrimOutlineContainer: React.FC<{
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties;
	readonly clipPath: string | null;
}> = ({children, style, clipPath}) => {
	const ref = useRef<HTMLDivElement>(null);

	return (
		// Only the masked content may receive pointer events in overlapping rows.
		<div ref={ref} style={{...style, pointerEvents: 'none'}}>
			<TimelineTrimOutlineTarget.Provider value={ref}>
				<div
					style={{
						clipPath: clipPath ?? undefined,
						height: '100%',
						pointerEvents: 'auto',
					}}
				>
					{children}
				</div>
			</TimelineTrimOutlineTarget.Provider>
		</div>
	);
};

export const TimelineUnclippedTrimOutline: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const targetRef = useContext(TimelineTrimOutlineTarget);
	const originRef = useRef<HTMLDivElement>(null);
	const [placement, setPlacement] = useState<{
		readonly target: HTMLDivElement;
		readonly left: number;
		readonly top: number;
	} | null>(null);

	useLayoutEffect(() => {
		const target = targetRef?.current;
		const origin = originRef.current;
		if (!target || !origin) {
			return;
		}

		// Preserve the local row offset when drawing outside its scene's clip path.
		const targetBounds = target.getBoundingClientRect();
		const originBounds = origin.getBoundingClientRect();
		setPlacement({
			target,
			left: originBounds.left - targetBounds.left,
			top: originBounds.top - targetBounds.top,
		});
	}, [targetRef]);

	if (targetRef === null) {
		return children;
	}

	return (
		<>
			<div ref={originRef} style={{position: 'absolute', left: 0, top: 0}} />
			{placement === null
				? null
				: createPortal(
						<div
							style={{
								position: 'absolute',
								left: placement.left,
								top: placement.top,
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
