import React from 'react';
import {rightLabel} from './new-comp-layout';
import {aspectRatio} from './render-aspect-ratio';
import {ToggleAspectRatio} from './ToggleAspectRatio';

const GUIDE_HEIGHT = 55;
const GUIDE_WIDTH = 10;

export const NewCompAspectRatio: React.FC<{
	width: number;
	height: number;
	aspectRatioLocked: boolean;
	setAspectRatioLocked: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({width, height, aspectRatioLocked, setAspectRatioLocked}) => {
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
				<ToggleAspectRatio
					aspectRatioLocked={aspectRatioLocked}
					setAspectRatioLocked={setAspectRatioLocked}
				/>
				<div style={rightLabel}>
					Aspect ratio {aspectRatio(Number(width), Number(height))}
				</div>
			</div>
		</div>
	);
};
