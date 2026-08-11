import {parseToRgb} from 'polished';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {defaultStyles} from './styles';

const BAR_SCALE_FACTOR = 1.5;
const TOP_PANEL = 100;

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	height: BAR_SCALE_FACTOR * 255 + TOP_PANEL,
};

const rgb = ['#ff7979', '#badc58', '#3498db'];

export const Colors: React.FC<{
	readonly color: string;
}> = ({color}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const parsed = parseToRgb(color);

	const progress = spring({
		fps,
		frame,
		config: {
			mass: 4,
			damping: 200,
		},
	});

	const barMargin = interpolate(progress, [0, 1], [0, 20]);

	return (
		<div
			style={{
				...defaultStyles,
				backgroundColor: 'white',
				fontSize: 30,
			}}
		>
			<div style={row}>
				{[parsed.red, parsed.green, parsed.blue].map((arrayColor, index) => {
					const barProgress = spring({
						fps,
						frame: frame - index * 10,
						config: {
							mass: 1.4,
							damping: 200,
						},
					});
					return (
						<div key={arrayColor} style={{textAlign: 'center'}}>
							<div
								style={{
									height: TOP_PANEL,
									marginBottom: 10,
									color: rgb[index],
									overflow: 'hidden',
								}}
							>
								<span
									style={{
										opacity: barProgress,
										fontSize: 80,
									}}
								>
									{String(arrayColor)}
								</span>
							</div>
							<div
								// eslint-disable-next-line react/no-array-index-key
								key={index}
								style={{
									width: 250,
									marginLeft: barMargin,
									marginRight: barMargin,
									height: arrayColor * BAR_SCALE_FACTOR * barProgress,
									borderRadius: 10,
									backgroundColor: rgb[index],
								}}
							/>
							<div
								style={{marginTop: 20, color: rgb[index], overflow: 'hidden'}}
							>
								<span
									style={{
										transform: `translateY(${interpolate(
											barProgress,
											[0, 1],
											[70, 0],
										)}px)`,
										display: 'block',
									}}
								>
									{['Red', 'Green', 'Blue'][index]}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
