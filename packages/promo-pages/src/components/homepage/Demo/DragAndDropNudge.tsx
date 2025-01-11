import React from 'react';
import {FONTS, PALETTE} from '../layout/colors';

const origWidth = 37;
const scale = 0.4;

export const Icon: React.FC = () => {
	return (
		<svg
			style={{
				width: origWidth * scale,
				overflow: 'visible',
			}}
			viewBox="0 0 37 59"
			fill="none"
		>
			<path
				d="M5.00003 5C5.00002 36.5 16 44 32.0002 54"
				stroke={PALETTE.TEXT_COLOR}
				strokeWidth="8"
				strokeLinecap="round"
			/>
		</svg>
	);
};

export const DragAndDropNudge: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				flexDirection: 'row',
				display: 'flex',
				justifyContent: 'flex-start',
				paddingBottom: 5,
				marginTop: 50,
			}}
			className={'ml-4 lg:-ml-5'}
		>
			<div>
				<div
					style={{
						fontFamily: FONTS.GTPLANAR,
						fontSize: 15,
						width: 280,
						paddingBottom: 8,
						textWrap: 'balance',
					}}
					className={'-ml-3 lg:-ml-5'}
				>
					Drag and drop the cards to reorder them.
				</div>
				<Icon />
			</div>
		</div>
	);
};
