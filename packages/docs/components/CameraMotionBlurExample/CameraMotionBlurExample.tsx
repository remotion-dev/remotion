import {Player} from '@remotion/player';
import React, {useState} from 'react';
import {
	AbsoluteFill,
	Freeze,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

import {CameraMotionBlur} from '@remotion/motion-blur';

const square: React.CSSProperties = {
	height: 150,
	width: 150,
	background: `linear-gradient(217deg, rgba(255,0,0,1), rgba(255,0,0,0) 70.71%), linear-gradient(127deg, rgba(0,255,0,1), rgba(0,255,0,0) 70.71%), linear-gradient(336deg, rgba(0,0,255,1), rgba(0,0,255,0) 70.71%)`,
	borderRadius: 14,
	fontSize: 100,
	fontWeight: 'bold',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	flexWrap: 'wrap',
};

const spacer: React.CSSProperties = {
	width: 40,
};

export const Square: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();
	const spr = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 60,
	});

	const rotate = interpolate(spr, [0, 1], [Math.PI, 0]);
	const y = interpolate(spr, [0, 1], [height, 0]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				transform: `translateY(${y}px) rotate(${rotate}rad)`,
			}}
		>
			<div style={square}>A</div>
		</AbsoluteFill>
	);
};

const MyComposition = ({
	shutterAngle,
	samples,
}: {
	readonly shutterAngle: number;
	readonly samples: number;
}) => {
	return (
		<AbsoluteFill
			style={{
				flexDirection: 'row',
			}}
		>
			<div style={{flex: 1, position: 'relative'}}>
				<AbsoluteFill style={{padding: 30}}>
					<h1>Still</h1>
				</AbsoluteFill>
				<Freeze frame={20}>
					<CameraMotionBlur shutterAngle={shutterAngle} samples={samples}>
						<Square />
					</CameraMotionBlur>
				</Freeze>
			</div>
			<div
				style={{
					width: 1,
					background: 'var(--ifm-color-emphasis-300)',
				}}
			/>
			<div style={{flex: 1, position: 'relative'}}>
				<AbsoluteFill style={{padding: 30}}>
					<h1>Animation</h1>
				</AbsoluteFill>
				<CameraMotionBlur shutterAngle={shutterAngle} samples={samples}>
					<Square />
				</CameraMotionBlur>
			</div>
		</AbsoluteFill>
	);
};

export const CameraMotionBlurExample: React.FC = () => {
	const [shutterAngle, setShutterAngle] = useState(180);
	const [samples, setSamples] = useState(10);

	return (
		<div>
			<Player
				component={MyComposition}
				compositionWidth={1280}
				compositionHeight={720}
				durationInFrames={70}
				fps={30}
				style={{
					width: '100%',
					border: '1px solid var(--ifm-color-emphasis-300)',
					borderRadius: 'var(--ifm-pre-border-radius)',
				}}
				inputProps={{
					shutterAngle,
					samples,
				}}
				autoPlay
				loop
			/>
			<br />
			<div style={{...row, fontSize: 20}}>
				<label style={row}>
					<input
						type="range"
						min={1}
						max={360}
						step={1}
						value={shutterAngle}
						style={{width: 90, marginRight: 8, padding: 8}}
						onChange={(e) => setShutterAngle(Number(e.target.value))}
					/>
					<code>
						shutterAngle={'{'}
						{shutterAngle}
						{'}'}
					</code>
				</label>
				<div style={spacer} />

				<label style={row}>
					<input
						type="range"
						min={1}
						max={100}
						step={1}
						value={samples}
						style={{width: 90, marginRight: 8}}
						onChange={(e) => setSamples(Number(e.target.value))}
					/>
					<code>
						samples={'{'}
						{samples}
						{'}'}
					</code>
				</label>
			</div>
		</div>
	);
};
