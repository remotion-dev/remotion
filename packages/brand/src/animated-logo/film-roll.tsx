import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {springB, springD} from './springs';

const strokeWidth = 56;
const filmRollDots = 5;
const r = 130;

export const FilmRoll: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const innerSpr = spring({
		fps,
		frame: frame - springB.delay,
		config: springB.config,
	});

	const spr2 = spring({
		fps,
		frame: frame - springD.delay - 20,
		config: springD.config,
	});

	const devolve = spring({
		fps,
		frame: frame - springD.delay - 30,
		config: springD.config,
	});

	const secondR = interpolate(devolve, [0, 1], [0, r - strokeWidth]);

	const dotScale = Math.max(0, 1 - devolve);

	const toMove = 700;
	const right = interpolate(innerSpr, [0, 1], [toMove, 0]);
	const circumference = r * 2 * Math.PI;
	const rotations = toMove / circumference;

	const rotate =
		interpolate(innerSpr, [0, 1], [0, -rotations * Math.PI * 2]) +
		interpolate(spr2, [0, 1], [0, rotations * Math.PI * 2]) +
		interpolate(devolve, [0, 1], [0, (rotations * Math.PI) / 2]);

	const scale = devolve * 10 + 1 + interpolate(frame, [0, 100], [0.8, 1.2]);

	return (
		<AbsoluteFill style={{scale: String(scale)}}>
			<AbsoluteFill>
				<svg
					style={{
						backgroundColor: 'white',
					}}
					viewBox="0 0 1080 1080"
				>
					<path
						d={`M ${540 + right} ${540 + r - strokeWidth / 2} L ${
							1080 - spr2 * 540
						} ${540 + r - strokeWidth / 2}`}
						strokeWidth={strokeWidth}
						stroke="black"
					/>
				</svg>
			</AbsoluteFill>
			<AbsoluteFill>
				<svg
					viewBox="0 0 1080 1080"
					style={{
						transform: `translateX(${right}px) rotate(${rotate}rad) `,
					}}
				>
					<g
						width={1080}
						height={1080}
						style={{
							transformBox: 'fill-box',
							transformOrigin: 'center center',
							mask: 'url(#cirmask)',
						}}
					>
						<mask id="cirmask">
							<circle cx="540" cy="540" r={r} fill="white" />
						</mask>
						<circle
							cx="540"
							cy="540"
							r={r}
							fill="black"
							style={{
								transformBox: 'fill-box',
								transformOrigin: 'center center',
							}}
						/>
						<circle
							cx="540"
							cy="540"
							r={secondR}
							fill="white"
							style={{
								transformBox: 'fill-box',
								transformOrigin: 'center center',
							}}
						/>
						{new Array(filmRollDots).fill(true).map((_f, i) => {
							return (
								<circle
									cx="540"
									cy="540"
									r={24}
									fill="white"
									style={{
										transformBox: 'fill-box',
										transformOrigin: 'center center',
										transform: `translateX(${
											Math.sin((i / filmRollDots) * Math.PI * 2) *
											(70 + (1 - dotScale) * 100)
										}px) translateY(${
											Math.cos((i / filmRollDots) * Math.PI * 2) *
											(70 + (1 - dotScale) * 100)
										}px) `,
									}}
								/>
							);
						})}
					</g>
				</svg>{' '}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
