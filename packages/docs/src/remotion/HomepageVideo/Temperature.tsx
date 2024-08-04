import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TemperatureNumber} from './TemperatureNumber';

export const Temperature: React.FC<{
	readonly theme: 'dark' | 'light';
}> = ({theme}) => {
	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					paddingLeft: 20,
					paddingRight: 20,
				}}
			>
				<div
					style={{
						color: '#0b84f3',
						fontFamily: 'GT Planar',
						fontWeight: '500',
						fontSize: 13,
						textAlign: 'center',
						marginTop: -7,
					}}
				>
					Temperature
				</div>

				<TemperatureNumber theme={theme} num={23} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
