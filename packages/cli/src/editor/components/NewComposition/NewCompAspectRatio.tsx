import React from 'react';
import {aspectRatio} from './render-aspect-ratio';

const GUIDE_HEIGHT = 55;
const GUIDE_WIDTH = 10;

const label: React.CSSProperties = {
	fontSize: 13,
	color: 'rgba(255, 255, 255, 0.5)',
	marginLeft: 10,
};

export const NewCompAspectRatio: React.FC<{
	width: number;
	height: number;
}> = ({width, height}) => {
	return (
		<div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					marginLeft: 10,
					alignItems: 'center',
				}}
			>
				<svg width={GUIDE_WIDTH} height={GUIDE_HEIGHT}>
					<path
						d={`M 0 0 L ${GUIDE_WIDTH} 0 L ${GUIDE_WIDTH} ${GUIDE_HEIGHT} L 0 ${GUIDE_HEIGHT}`}
						fill="transparent"
						strokeWidth="2"
						stroke="rgba(255, 255, 255, 0.2)"
					/>
				</svg>
				<div style={label}>
					Aspect ratio {aspectRatio(Number(width), Number(height))}
				</div>
			</div>
		</div>
	);
};
