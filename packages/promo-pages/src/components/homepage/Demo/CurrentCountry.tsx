import React from 'react';
import {
	AbsoluteFill,
	Img,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const CurrentCountry: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly countryFlag: string | null;
	readonly countryLabel: string | null;
}> = ({theme, countryFlag, countryLabel}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	if (!countryFlag || !countryLabel) {
		return null;
	}

	const progress = spring({
		fps,
		frame,
		delay: 10,
	});

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						color: '#0b84f3',
						fontFamily: 'GTPlanar',
						fontWeight: '500',
						fontSize: 13,
						textAlign: 'center',
						marginTop: -10,
						width: '100%',
						paddingLeft: 20,
						paddingRight: 20,
						transform:
							'translateX(' + interpolate(progress, [0, 1], [-100, 0]) + '%)',
					}}
				>
					Your country
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 6,
						lineHeight: 1.1,
						fontFamily: 'GTPlanar',
						textAlign: 'center',
						fontWeight: '500',
						fontSize: 30,
						color: theme === 'dark' ? 'white' : 'black',
						width: '100%',
						paddingLeft: 20,
						paddingRight: 20,
						transform:
							'translateX(' + interpolate(progress, [0, 1], [100, 0]) + '%)',
					}}
				>
					<Img
						src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(countryFlag)}`}
						style={{
							width: 38,
							height: 29,
							objectFit: 'cover',
							borderRadius: 3,
							flex: 'none',
						}}
					/>
					<span>{countryLabel}</span>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
