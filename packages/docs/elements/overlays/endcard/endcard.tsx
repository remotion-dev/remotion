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

const InstagramIcon: React.FC = () => (
	<svg height={62} viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M224.3 141a115 115 0 1 0-.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1-.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1-53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
		/>
	</svg>
);

const SocialRow: React.FC<{
	readonly children: React.ReactNode;
	readonly label: string;
	readonly name: string;
}> = ({children, label, name}) => {
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
					position: 'absolute',
					translate: interpolate(frame, [8, 42], ['0px 190px', '0px 0px'], {
						easing: Easing.out(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
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

			<div
				style={{
					height: 264,
					left: 80,
					overflow: 'hidden',
					position: 'absolute',
					top: 474,
					width: 760,
				}}
			>
				<Interactive.Div
					name="Social links"
					style={{
						translate: interpolate(frame, [18, 48], ['0px 264px', '0px 0px'], {
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<SocialRow label="@yourchannel" name="YouTube">
						<YouTubeIcon />
					</SocialRow>
					<SocialRow label="@yourhandle" name="X">
						<XIcon />
					</SocialRow>
					<SocialRow label="@yourhandle" name="Instagram">
						<InstagramIcon />
					</SocialRow>
				</Interactive.Div>
			</div>

			<Interactive.Div
				name="Recommended video"
				style={{
					border: '6px solid #18181b',
					boxSizing: 'border-box',
					height: 361,
					position: 'absolute',
					right: 100,
					top: 135,
					width: 631,
				}}
			/>
			<Interactive.Div
				name="Next video"
				style={{
					border: '6px solid #18181b',
					boxSizing: 'border-box',
					height: 361,
					position: 'absolute',
					right: 100,
					top: 564,
					width: 631,
				}}
			/>
		</Interactive.Div>
	);
};
