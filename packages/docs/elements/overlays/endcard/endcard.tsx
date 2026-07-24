import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const YouTubeIcon: React.FC = () => (
	<svg height={58} viewBox="0 0 576 512">
		<path
			fill="currentColor"
			d="M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z"
		/>
	</svg>
);

const XIcon: React.FC = () => (
	<svg height={54} viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48h145.6l100.5 132.9L389.2 48zm-24.8 373.8h39.1L151.1 88h-42l255.3 333.8z"
		/>
	</svg>
);

const GitHubIcon: React.FC = () => (
	<svg height={58} viewBox="0 0 496 512">
		<path
			fill="currentColor"
			d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4-70 15-84.7-29.8-84.7-29.8-11.4-29.1-27.8-36.6-27.8-36.6-22.9-15.7 1.6-15.4 1.6-15.4 24.9 2 38.6 25.8 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 40-11.2 85.6-11.2 125.6 0 0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"
		/>
	</svg>
);

const SocialRow: React.FC<{
	readonly children: React.ReactNode;
	readonly label: string;
	readonly name: string;
}> = ({children, label, name}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name={name}
			style={{
				alignItems: 'center',
				color: '#18181b',
				display: 'flex',
				fontSize: 44,
				fontWeight: 500,
				height: 88,
				letterSpacing: -1.1,
				opacity: interpolate(frame, [28, 40, 146, 162], [0, 1, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				translate: interpolate(
					frame,
					[28, 44, 146, 166],
					['0px 24px', '0px 0px', '0px 0px', '0px -18px'],
					{
						easing: Easing.out(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					justifyContent: 'center',
					width: 138,
				}}
			>
				{children}
			</div>
			<div style={{marginLeft: 30}}>{label}</div>
		</Interactive.Div>
	);
};

export const Endcard: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
			style={{
				backgroundColor: '#fafafa',
				boxSizing: 'border-box',
				color: '#18181b',
				fontFamily: 'Arial, Helvetica, sans-serif',
				height: '100%',
				overflow: 'hidden',
				position: 'relative',
				width: '100%',
			}}
		>
			<Interactive.Div
				name="Creator"
				style={{
					alignItems: 'center',
					display: 'flex',
					opacity: interpolate(frame, [8, 26, 146, 166], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					position: 'absolute',
					translate: interpolate(
						frame,
						[8, 30, 146, 170],
						['0px 72px', '0px 0px', '0px 0px', '0px -48px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					left: 80,
					top: 254,
				}}
			>
				<Interactive.Div
					name="Avatar"
					style={{
						alignItems: 'center',
						backgroundColor: '#ff4d8d',
						borderRadius: 70,
						boxShadow: '0 8px 28px rgba(0, 0, 0, 0.16)',
						color: '#ffffff',
						display: 'flex',
						fontSize: 47,
						fontWeight: 700,
						height: 140,
						justifyContent: 'center',
						letterSpacing: -2,
						width: 140,
					}}
				>
					YC
				</Interactive.Div>
				<Interactive.Div
					name="Subscribe button"
					style={{
						alignItems: 'center',
						backgroundColor: '#18181b',
						borderRadius: 70,
						color: '#ffffff',
						display: 'flex',
						fontSize: 48,
						fontWeight: 600,
						height: 140,
						justifyContent: 'center',
						letterSpacing: -1.5,
						marginLeft: 30,
						width: 400,
					}}
				>
					Subscribe
				</Interactive.Div>
			</Interactive.Div>

			<div style={{position: 'absolute', left: 80, top: 474, width: 760}}>
				<SocialRow label="@yourchannel" name="YouTube">
					<YouTubeIcon />
				</SocialRow>
				<SocialRow label="@yourhandle" name="X">
					<XIcon />
				</SocialRow>
				<SocialRow label="github.com/yourname" name="GitHub">
					<GitHubIcon />
				</SocialRow>
			</div>

			<Interactive.Div
				name="Recommended video"
				style={{
					border: '6px solid #18181b',
					boxSizing: 'border-box',
					height: 361,
					opacity: interpolate(frame, [20, 38, 142, 160], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					position: 'absolute',
					right: 100,
					top: 135,
					translate: interpolate(
						frame,
						[20, 42, 142, 166],
						['48px 0px', '0px 0px', '0px 0px', '48px 0px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 631,
				}}
			/>
			<Interactive.Div
				name="Next video"
				style={{
					border: '6px solid #18181b',
					boxSizing: 'border-box',
					height: 361,
					opacity: interpolate(frame, [26, 44, 146, 164], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					position: 'absolute',
					right: 100,
					top: 564,
					translate: interpolate(
						frame,
						[26, 48, 146, 170],
						['48px 0px', '0px 0px', '0px 0px', '48px 0px'],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 631,
				}}
			/>
		</Interactive.Div>
	);
};
