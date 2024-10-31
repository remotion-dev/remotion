import React from 'react';
import {FONTS} from '../../../components/layout/colors';

const origWidth = 53;
const scale = 0.4;

export const Icon: React.FC = () => {
	return (
		<svg
			style={{
				width: origWidth * scale,
			}}
			viewBox="0 0 53 147"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12.8163 5C-0.76736 47.7848 -0.990035 115.043 48 142"
				stroke="currentColor"
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
				position: 'relative',
				flexDirection: 'row',
				display: 'flex',
				justifyContent: 'flex-start',
				marginLeft: -30,
				paddingBottom: 5,
			}}
		>
			<div>
				<div
					style={{
						fontFamily: FONTS.GTPLANAR,
						fontSize: 15,
						width: 280,
						paddingBottom: 8,
						marginLeft: -15,
						// @ts-expect-error
						textWrap: 'balance',
					}}
				>
					Drag and drop the cards to reorder them.
				</div>
				<Icon />
			</div>
		</div>
	);
};
