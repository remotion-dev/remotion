import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const location = 'Berlin, Germany';
const venue = 'LocalFirstConf, July 14';

export const LocationLowerThird: React.FC = () => {
	const frame = useCurrentFrame();
	const visibleLocationCharacters = Math.floor(
		interpolate(
			frame,
			[14, 38, 88, 108],
			[0, location.length, location.length, 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			},
		),
	);
	const visibleVenueCharacters = Math.floor(
		interpolate(frame, [27, 54, 82, 102], [0, venue.length, venue.length, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
	);

	return (
		<Interactive.Div
			name="Container"
			style={{
				position: 'relative',
				width: 680,
				height: 138,
				boxSizing: 'border-box',
				fontFamily: 'Arial, Helvetica, sans-serif',
			}}
		>
			<Interactive.Svg
				name="Location pin"
				viewBox="0 0 64 80"
				style={{
					position: 'absolute',
					left: 56,
					top: 4,
					width: 104,
					height: 130,
					overflow: 'visible',
					filter: 'drop-shadow(0 6px 8px rgba(24, 24, 27, 0.14))',
					opacity: interpolate(frame, [0, 9, 108, 119], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(
						frame,
						[0, 16, 106, 119],
						['0px -10px', '0px 0px', '0px 0px', '0px -8px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(frame, [0, 16, 106, 119], [0.88, 1, 1, 0.92], {
						easing: Easing.out(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transformOrigin: '52px 126px',
				}}
			>
				<path
					d="M32 3C15.4 3 4 15.4 4 31C4 50.8 22.1 69.6 29.3 76.2C30.8 77.6 33.2 77.6 34.7 76.2C41.9 69.6 60 50.8 60 31C60 15.4 48.6 3 32 3Z"
					pathLength="1"
					fill="#2563eb"
					fillOpacity={interpolate(frame, [5, 18, 105, 114], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					stroke="#1d4ed8"
					strokeDasharray="1"
					strokeDashoffset={interpolate(
						frame,
						[0, 16, 105, 116],
						[1, 0, 0, 1],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2.5"
				/>
				<circle
					cx="32"
					cy="30"
					r={interpolate(frame, [10, 21, 102, 112], [0, 9, 9, 0], {
						easing: Easing.out(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					fill="#eff6ff"
				/>
			</Interactive.Svg>

			<div
				style={{
					position: 'absolute',
					left: 184,
					top: 3,
					width: 440,
					height: 132,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<div
					style={{
						height: 82,
						display: 'flex',
						alignItems: 'center',
						overflow: 'hidden',
					}}
				>
					<Interactive.Div
						name="Location"
						dir="auto"
						style={{
							minWidth: 0,
							maxWidth: 440,
							overflow: 'hidden',
							color: '#18181b',
							fontSize: 54,
							fontWeight: 700,
							letterSpacing: -1,
							lineHeight: 1,
							clipPath: `inset(0 ${
								100 - (visibleLocationCharacters / location.length) * 100
							}% 0 0)`,
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							opacity: interpolate(frame, [14, 22, 98, 110], [0, 1, 1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						{location}
					</Interactive.Div>
				</div>

				<div
					style={{
						minHeight: 0,
						flex: 1,
						display: 'flex',
						alignItems: 'center',
						overflow: 'hidden',
					}}
				>
					<Interactive.Div
						name="Venue"
						dir="auto"
						style={{
							minWidth: 0,
							maxWidth: 440,
							overflow: 'hidden',
							color: '#52525b',
							fontSize: 29,
							fontWeight: 500,
							lineHeight: 1,
							clipPath: `inset(0 ${
								100 - (visibleVenueCharacters / venue.length) * 100
							}% 0 0)`,
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							opacity: interpolate(frame, [27, 35, 92, 104], [0, 1, 1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						{venue}
					</Interactive.Div>
				</div>
			</div>
		</Interactive.Div>
	);
};
