import React from 'react';

export const HtmlInCanvasFallback: React.FC<{
	readonly children: React.ReactNode;
	readonly style: React.CSSProperties;
	readonly label: string;
}> = ({children, style, label}) => {
	return (
		<div style={{position: 'relative', ...style}}>
			{children}
			<div
				className="css-reset"
				style={{
					position: 'absolute',
					top: 8,
					right: 8,
					zIndex: 1000,
					maxWidth: 'calc(100% - 16px)',
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
