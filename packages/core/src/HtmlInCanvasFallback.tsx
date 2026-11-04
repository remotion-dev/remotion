import React from 'react';
import {useCurrentScale} from './use-current-scale.js';

export const HtmlInCanvasFallback: React.FC<{
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties;
	readonly label: string;
}> = ({children, style, label}) => {
	const currentScale = useCurrentScale({dontThrowIfOutsideOfRemotion: true});
	const scale = currentScale > 0 ? currentScale : 1;

	return (
		<div style={{position: 'relative', ...style}}>
			{children}
			<div
				className="css-reset"
				style={{
					position: 'absolute',
					top: 8 / scale,
					right: 8 / scale,
					zIndex: 1000,
					// Cancel the preview zoom while keeping the badge inside its component.
					transform: `scale(${1 / scale})`,
					transformOrigin: 'top right',
					maxWidth: `calc(${scale * 100}% - 16px)`,
					padding: '8px 10px',
					borderRadius: 6,
					border: '1px solid #7f3540',
					backgroundColor: '#2b171c',
					boxShadow: '0 2px 8px #0003',
					pointerEvents: 'none',
					textAlign: 'left',
				}}
			>
				<div
					style={{
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 12,
						fontWeight: 600,
						lineHeight: 1.5,
						color: '#ffabb5',
					}}
				>
					HTML-in-canvas is not available
				</div>
				<div
					style={{
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 11,
						fontWeight: 400,
						lineHeight: 1.5,
						color: '#e8bdc3',
					}}
				>
					{label}
				</div>
			</div>
		</div>
	);
};
