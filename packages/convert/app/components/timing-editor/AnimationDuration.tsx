import React from 'react';
import {PADDING_BOTTOM, PADDING_RIGHT} from './draw-trajectory';
import {Spacing} from './Spacing';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	fontFamily: 'GTPlanar',
	fontSize: 15,
	alignItems: 'center',
	position: 'absolute',
	right: PADDING_RIGHT,
	bottom: PADDING_BOTTOM - 12,
	cursor: 'pointer',
	fontVariantNumeric: 'tabular-nums',
};

export const AnimationDuration: React.FC<{
	readonly durationLabel: string;
	readonly setDurationType: React.Dispatch<
		React.SetStateAction<'seconds' | 'frames'>
	>;
}> = ({durationLabel, setDurationType}) => {
	return (
		<div
			style={row}
			onClick={() => {
				setDurationType((prev) => (prev === 'seconds' ? 'frames' : 'seconds'));
			}}
		>
			<svg height="1em" viewBox="0 0 512 512">
				<path
					fill="white"
					d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
				/>
			</svg>
			<Spacing x={1} />
			{durationLabel}
		</div>
	);
};
