import {parseToRgb} from 'polished';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const container: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily:
		"--apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
	fontWeight: 'bold',
	fontSize: 30,
};

const BAR_SCALE_FACTOR = 1.5;
const TOP_PANEL = 100;

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	height: BAR_SCALE_FACTOR * 255 + TOP_PANEL,
};

const bar: React.CSSProperties = {
	borderRadius: 10,
};

const rgb = ['#ff7979', '#badc58', '#3498db'];

export const Colors: React.FC<{
	color: string;
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
				...container,
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div style={row}>
				{[parsed.red, parsed.green, parsed.blue].map((color, index) => {
					const barProgress = spring({
						fps,
						frame: frame - index * 10,
						config: {
							mass: 1.4,
							damping: 200,
						},
					});
					return (
						<div style={{textAlign: 'center'}}>
							<div
								style={{
									height: TOP_PANEL,
									marginBottom: 10,
									color: rgb[index],
									overflow: 'hidden',
								}}
							>
								<span style={{opacity: barProgress, fontSize: 80}}>
									{String(color)}
								</span>
							</div>
							<div
								key={index}
								style={{
									...bar,
									width: 250,
									marginLeft: barMargin,
									marginRight: barMargin,
									height: color * BAR_SCALE_FACTOR * barProgress,
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
											[30, 0]
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
