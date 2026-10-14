// Adapted from https://www.remotion.dev/elements/youtube/youtube-end-card/
import {fontFamily, loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {rollerSkiAsset} from './assets';

loadFont('normal', {
	weights: ['500'],
});

const LinkedInIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg
			name="LinkedIn icon"
			height={height}
			viewBox="0 0 448 512"
			style={{translate: '0 -4px'}}
		>
			<path
				fill="currentColor"
				d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
			/>
		</Interactive.Svg>
	);
};

const XIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg name="X icon" height={height} viewBox="0 0 512 512">
			<path
				fill="currentColor"
				d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
			/>
		</Interactive.Svg>
	);
};

const LinkIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg name="Website icon" height={height} viewBox="0 0 640 512">
			<path
				fill="currentColor"
				d="M580.2 267.3c56.2-56.2 56.2-147.4 0-203.6S432.8 7.4 376.6 63.7L365.3 75l45.3 45.3 11.3-11.3c31.2-31.2 81.9-31.2 113.1 0s31.2 81.9 0 113.1L421.8 335.2c-31.2 31.2-81.9 31.2-113.1 0c-25.6-25.6-30.3-64.3-13.8-94.6c1.8-3.4 3.9-6.7 6.3-9.8l-51.2-38.4c-4.3 5.7-8.1 11.6-11.4 17.8c-29.5 54.6-21.3 124.2 24.9 170.3c56.2 56.2 147.4 56.2 203.6 0L580.2 267.3zM59.8 244.7c-56.2 56.2-56.2 147.4 0 203.6s147.4 56.2 203.6 0L274.7 437l-45.3-45.3-11.3 11.3c-31.2 31.2-81.9 31.2-113.1 0s-31.2-81.9 0-113.1L218.2 176.8c31.2-31.2 81.9-31.2 113.1 0c25.6 25.6 30.3 64.3 13.8 94.6c-1.8 3.4-3.9 6.7-6.3 9.8l51.2 38.4c4.3-5.7 8.1-11.6 11.4-17.8c29.5-54.6 21.3-124.2-24.9-170.3c-56.2-56.2-147.4-56.2-203.6 0L59.8 244.7z"
			/>
		</Interactive.Svg>
	);
};

const YouTubeIcon: React.FC<{height: number}> = ({height}) => {
	return (
		<Interactive.Svg name="YouTube icon" height={height} viewBox="0 0 48 34">
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M10 0H38C43.5 0 48 4.5 48 10V24C48 29.5 43.5 34 38 34H10C4.5 34 0 29.5 0 24V10C0 4.5 4.5 0 10 0ZM20 9V25L34 17 20 9Z"
			/>
		</Interactive.Svg>
	);
};

const SocialLink: React.FC<{
	children: React.ReactNode;
	icon: React.ReactNode;
	indexFromLast: number;
}> = ({children, icon, indexFromLast}) => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				paddingTop: 20,
				paddingBottom: 20,
				opacity: interpolate(
					frame,
					[
						35 + ((indexFromLast - 1) / 4) * (30 - 15),
						50 + ((indexFromLast - 1) / 4) * (30 - 15),
					],
					[0, 1],
					{
						easing: Easing.spring({damping: 200}),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: 60,
					width: 140,
					translate: '0 4px',
				}}
			>
				{icon}
			</div>
			<div style={{width: 30}} />
			{children}
		</div>
	);
};

const WebsiteRow = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 35,
		durationInFrames: 15,
	});

	return (
		<>
			<div style={{height: 80}} />
			<Interactive.Div
				name="Website row"
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					paddingTop: 20,
					paddingBottom: 20,
					opacity,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: 60,
						width: 140,
						translate: '0 4px',
					}}
				>
					<LinkIcon height={60} />
				</div>
				<div style={{width: 30}} />
				<Interactive.Div
					name="Website"
					style={{
						fontSize: 50,
						fontFamily,
						fontWeight: 500,
						marginLeft: 20,
					}}
				>
					youtube.com/@JonnyBurger
				</Interactive.Div>
			</Interactive.Div>
		</>
	);
};

const SubscribeButton = () => {
	return (
		<Interactive.Div
			style={{
				height: 140,
				borderRadius: 70,
				width: 400,
				backgroundColor: 'black',
				color: 'white',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 50,
				fontFamily,
				fontWeight: 500,
			}}
			name="Subscribe button"
		>
			Subscribe
		</Interactive.Div>
	);
};

const Avatar = () => {
	return (
		<Img
			style={{
				height: 140,
				width: 140,
				borderRadius: '50%',
				boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
			}}
			src={rollerSkiAsset('images/jonny-youtube-avatar.jpg')}
		/>
	);
};

const SubscribeCTA = () => {
	return (
		<div style={{display: 'inline-flex', alignItems: 'center'}}>
			<Avatar />
			<div style={{width: 30}} />
			<SubscribeButton />
		</div>
	);
};

const LeftSide = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			style={{
				display: 'flex',
				position: 'absolute',
				height: '100%',
				flexDirection: 'column',
				left: 80,
				justifyContent: 'center',
			}}
			showInTimeline={false}
		>
			<Interactive.Div
				name={'Call to action'}
				style={{
					display: 'inline-block',
					translate: interpolate(frame, [-77, -47], ['0px 281px', '0px 0px'], {
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								overshootClamping: false,
							}),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<SubscribeCTA />
			</Interactive.Div>
			<div style={{marginTop: 80}}>
				<Interactive.Div name="YouTube row">
					<SocialLink icon={<YouTubeIcon height={70} />} indexFromLast={4}>
						<Interactive.Div
							name="YouTube handle"
							style={{
								fontSize: 50,
								fontFamily,
								fontWeight: 500,
								marginLeft: 20,
							}}
						>
							@JonnyBurger
						</Interactive.Div>
					</SocialLink>
				</Interactive.Div>
				<Interactive.Div name="LinkedIn row">
					<SocialLink icon={<LinkedInIcon height={60} />} indexFromLast={3}>
						<Interactive.Div
							name="LinkedIn handle"
							style={{
								fontSize: 50,
								fontFamily,
								fontWeight: 500,
								marginLeft: 20,
							}}
						>
							Jonny Burger
						</Interactive.Div>
					</SocialLink>
				</Interactive.Div>
				<Interactive.Div name="X row">
					<SocialLink icon={<XIcon height={60} />} indexFromLast={2}>
						<Interactive.Div
							name="X handle"
							style={{
								fontSize: 50,
								fontFamily,
								fontWeight: 500,
								marginLeft: 20,
							}}
						>
							@JNYBGR
						</Interactive.Div>
					</SocialLink>
				</Interactive.Div>
				<WebsiteRow />
			</div>
		</Interactive.Div>
	);
};

const YouTubeEndCardInner = () => {
	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{backgroundColor: '#FAFAFA', color: 'black'}}
			name="Container"
		>
			<LeftSide />
			<Interactive.Div
				name="Top thumbnail"
				style={{
					position: 'absolute',
					top: 135,
					right: 100,
					width: 631,
					height: 361,
					border: '6px solid black',
				}}
			/>
			<Interactive.Div
				name="Bottom thumbnail"
				style={{
					position: 'absolute',
					right: 100,
					bottom: 155,
					width: 631,
					height: 361,
					border: '6px solid black',
				}}
			/>
		</AbsoluteFill>
	);
};

export const YouTubeEndCard = Interactive.withSchema({
	Component: YouTubeEndCardInner,
	componentName: 'YouTubeEndCard',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
